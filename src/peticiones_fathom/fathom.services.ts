import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import axios from "axios";
import { EmailService } from "src/email/email.services";
import { Traduccion_IA_Services } from "src/IA/Traduccion_IA.services";
import { KeysServices } from "src/keys/keys.services";
import { RolesEntry } from "src/roles/roles.entry";
import { UsuariosEntry } from "src/usuarios/entry/usuarios.entry";

@Injectable()
export class FathomService {
    private readonly logger = new Logger(FathomService.name);

    constructor(
        private readonly traduccionIAServices: Traduccion_IA_Services,
        private readonly emailService: EmailService,
        private readonly keysServices: KeysServices,
        @InjectModel(UsuariosEntry)
        private readonly usuariosRepository: typeof UsuariosEntry,
    ) {}

    procesarMinutaEnBackground(key: string) {
        this.getVisits(key)
            .then(() => this.logger.log(`Minuta procesada y enviada correctamente`))
            .catch((error) => this.logger.error(`Error procesando minuta en background`, error));
    }

    private async esperar(milisegundos: number) {
        return new Promise((resolve) => setTimeout(resolve, milisegundos));
    }

    private async obtenerApiKeyYSeccion(keyParametro: string) {
        const keyDecodificada = decodeURIComponent(keyParametro.trim());
        const esIdNumerico = /^\d+$/.test(keyDecodificada);

        let keyRegistro: Awaited<ReturnType<KeysServices['obtenerPorId']>> = null;

        if (esIdNumerico) {
            keyRegistro = await this.keysServices.obtenerPorId(Number(keyDecodificada));
        } else {
            keyRegistro = await this.keysServices.obtenerPorKeyPlana(keyDecodificada);
        }

        if (!keyRegistro) {
            throw new NotFoundException(
                esIdNumerico
                    ? `Key con id ${keyDecodificada} no encontrada. Créala en /keys/crear_key`
                    : 'Key de Fathom no encontrada en la BD. Créala en /keys/crear_key con su seccion_id',
            );
        }

        const apiKey = this.keysServices.descifrado(keyRegistro.nombre);

        return {
            apiKey,
            seccionId: keyRegistro.seccion_id,
            seccionNombre: keyRegistro.seccion?.nombre ?? String(keyRegistro.seccion_id),
            keyId: keyRegistro.id,
        };
    }

    private async obtenerUsuariosDeSeccion(seccionId: number, seccionNombre: string) {
        return this.usuariosRepository.findAll({
            where: {
                seccion: [String(seccionId), seccionNombre],
            },
            include: [RolesEntry],
        });
    }

    private obtenerEquipoDeSeccion(usuarios: UsuariosEntry[]): string[] {
        const equipo: string[] = [];

        for (const usuario of usuarios) {
            const nombre = usuario.nombre?.trim();
            if (!nombre) {
                continue;
            }

            const roles = (usuario.roles ?? [])
                .map((rol) => rol.nombre?.trim())
                .filter(Boolean);

            if (roles.length > 0) {
                equipo.push(`${nombre} - ${roles.join(', ')}`);
            } else {
                equipo.push(nombre);
            }
        }

        return equipo;
    }

    private async obtenerReunionesFathom(apiKey: string) {
        const maxIntentos = 3;
        let ultimoError: Error | null = null;

        for (let intento = 1; intento <= maxIntentos; intento++) {
            try {
                const response = await axios.get(
                    'https://api.fathom.ai/external/v1/meetings',
                    {
                        params: { include_summary: true },
                        headers: { 'X-Api-Key': apiKey },
                        timeout: 30000,
                        responseType: 'text',
                        validateStatus: () => true,
                    },
                );

                const textoRespuesta = response.data?.trim() ?? '';

                if (response.status !== 200) {
                    throw new Error(
                        `Fathom respondió ${response.status}: ${textoRespuesta || 'sin cuerpo'}`,
                    );
                }

                if (!textoRespuesta) {
                    throw new Error('Fathom devolvió una respuesta vacía');
                }

                try {
                    return JSON.parse(textoRespuesta);
                } catch {
                    throw new Error(
                        `Fathom devolvió JSON inválido: ${textoRespuesta.slice(0, 200)}`,
                    );
                }
            } catch (error) {
                ultimoError = error instanceof Error ? error : new Error(String(error));
                this.logger.warn(`Fathom intento ${intento}/${maxIntentos}: ${ultimoError.message}`);

                if (intento < maxIntentos) {
                    await this.esperar(intento * 2000);
                }
            }
        }

        throw ultimoError ?? new Error('No se pudo consultar Fathom');
    }

    async getVisits(keyParametro: string) {
          const { apiKey, seccionId, seccionNombre, keyId } = await this.obtenerApiKeyYSeccion(keyParametro);
          this.logger.log(`Procesando minuta para seccion=${seccionNombre} (id=${seccionId}) con key_id=${keyId}`);

          const body = await this.obtenerReunionesFathom(apiKey);
          
          if (!body.items || body.items.length === 0) {
            return { resumen: "No hay reuniones disponibles", puntosImportantes: [], temasVistos: [], proximosPasos: [] };
          }

          const markdownOriginal = body.items[0]?.default_summary?.markdown_formatted;
          
          if (!markdownOriginal) {
            return { resumen: "Reunión sin resumen procesado aún", puntosImportantes: [], temasVistos: [], proximosPasos: [] };
          }

          // 1. LIMPIEZA: Quitamos los links pesados de Fathom [Texto](Link)
          let textoLimpio = markdownOriginal.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
          textoLimpio = textoLimpio.replace(/[^\S\n]+/g, ' ');

          // 2. EXTRAER EL RESUMEN REAL
          const matchPurpose = textoLimpio.match(/## Meeting Purpose\s+([\s\S]*?)\s+##/);
          const resumen = matchPurpose ? matchPurpose[1].trim() : "Quick daily sync on project progress and blockers.";

          // 3. EXTRAER LOS KEY TAKEAWAYS (PUNTOS IMPORTANTES)
          const matchKeyTakeaways = textoLimpio.match(/## Key Takeaways\s+([\s\S]*?)\s+## Topics/);
          let puntosImportantes: string[] = [];
          
          if (matchKeyTakeaways) {
            puntosImportantes = matchKeyTakeaways[1]
              .split('\n')
              .map(linea => linea.trim())
              .filter(linea => linea.startsWith('-') || linea.startsWith('*'))
              .map(linea => linea.replace(/^[-*\s]+/, '').trim());
          }

          if (puntosImportantes.length === 0) {
            puntosImportantes = ["Revisar el estado de los proyectos y despliegues en producción."];
          }

          // 4. EXTRAER LOS TEMAS VISTOS (TOPICS)
          const matchTopicsSection = textoLimpio.match(/## Topics\s+([\s\S]*?)\s+## Next Steps/);
          const temasVistos: { tema: string; detalles: string[] }[] = [];

          if (matchTopicsSection) {
            const seccionTemas = matchTopicsSection[1];
            const bloquesTemas = seccionTemas.split(/\n### /);

            bloquesTemas.forEach(bloque => {
              const lineas = bloque.split('\n');
              const tituloTema = lineas[0].trim();
              
              if (tituloTema) {
                const detalles = lineas
                  .slice(1)
                  .map(linea => linea.trim())
                  .filter(linea => linea.startsWith('-') || linea.startsWith('*'))
                  .map(linea => linea.replace(/^[-*\s]+/, '').trim());

                if (detalles.length > 0) {
                  temasVistos.push({
                    tema: tituloTema,
                    detalles: detalles
                  });
                }
              }
            });
          }

          // 5. EXTRAER LOS PRÓXIMOS PASOS (NEXT STEPS)
          const matchNextSteps = textoLimpio.match(/## Next Steps\s+([\s\S]*?)$/);
          let proximosPasos: string[] = [];

          if (matchNextSteps) {
            proximosPasos = matchNextSteps[1]
              .split('\n')
              .map(linea => linea.trim())
              .filter(linea => linea.startsWith('-') || linea.startsWith('*') || linea.startsWith('**'))
              .map(linea => linea.replace(/^[-*\s]+/, '').trim());
          }
          let textoReunion = `## Meeting Purpose\n\n${resumen}\n\n`;

          textoReunion += `## Key Takeaways\n\n`;
          for (const punto of puntosImportantes) {
            textoReunion += `- ${punto}\n\n`;
          }

          textoReunion += `\n## Topics\n\n`;
          for (const tema of temasVistos) {
            textoReunion += `### ${tema.tema}\n\n`;
            for (const detalle of tema.detalles) {
              textoReunion += `- ${detalle}\n\n`;
            }
            textoReunion += `\n`;
          }

          textoReunion += `## Next Steps\n\n`;
          for (const paso of proximosPasos) {
            textoReunion += `- ${paso}\n\n`;
          }

          console.log('TEXTO REUNION:', textoReunion);

          const usuariosSeccion = await this.obtenerUsuariosDeSeccion(seccionId, seccionNombre);
          const equipo = this.obtenerEquipoDeSeccion(usuariosSeccion);
          this.logger.log(`Equipo seccion ${seccionNombre}: ${equipo.join(' | ') || '(vacio)'}`);

          const traduccion = await this.traduccionIAServices.generar_traduccion_ia(textoReunion, equipo);

          console.log('TRADUCCION:', traduccion.textoRespuesta);

          const gmails = usuariosSeccion
            .map((usuario) => usuario.email?.trim())
            .filter(Boolean);

          if (gmails.length === 0) {
            throw new Error(
              `No hay usuarios con email en la seccion "${seccionNombre}" (id=${seccionId}). Agrégalos en el panel.`,
            );
          }

          this.logger.log(`Destinatarios seccion ${seccionNombre}: ${gmails.join(', ')}`);
          await this.emailService.enviar_minuta(traduccion.textoRespuesta, gmails);

          return {
            resumen: resumen,
            puntosImportantes: puntosImportantes,
            temasVistos: temasVistos,
            proximosPasos: proximosPasos,
            textoReunion: traduccion.textoRespuesta,
            seccion: seccionNombre,
            key_id: keyId,
          };
    }
}

