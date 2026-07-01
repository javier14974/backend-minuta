import { Injectable, OnModuleInit } from "@nestjs/common";
import { EmailService } from "src/email/email.services";
import { Traduccion_IA_Services } from "src/IA/Traduccion_IA.services";

@Injectable()
export class FathomService {

    constructor(private readonly traduccionIAServices: Traduccion_IA_Services, private readonly emailService: EmailService) {}


    gmails: string[] = [
          'f.cabello@grupofirma.cl',
          'j.castillo@grupofirma.cl',
          'd.nawrath@grupofirma.cl',
          'danko.munoz@grupofirma.cl',
          'f.Bassaletti@grupofirma.cl',
          'k.villagra@grupofirma.cl',
          'j.quevedo@grupofirma.cl',
          'grupofirma.informatica@gmail.com',  
          'j.rios@grupofirma.cl',
        ];

    
    async getVisits() {
        const response = await fetch("https://api.fathom.ai/external/v1/meetings?include_summary=true", {
            method: "GET",
            headers: {
              "X-Api-Key": process.env.KEY_FATHOM || ""
            },
          });

          if(!response) {
            throw new Error("Error al obtener las visitas");
          }

          const body = await response.json();
          
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

          // 5. NUEVO: EXTRAER LOS PRÓXIMOS PASOS (NEXT STEPS)
          // Buscamos lo que está desde '## Next Steps' hasta el final del string
          const matchNextSteps = textoLimpio.match(/## Next Steps\s+([\s\S]*?)$/);
          let proximosPasos: string[] = [];

          if (matchNextSteps) {
            proximosPasos = matchNextSteps[1]
              .split('\n')
              .map(linea => linea.trim())
              // Filtramos para capturar tanto las viñetas de tareas como los nombres de los responsables
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
 
            const traduccion = await this.traduccionIAServices.generar_traduccion_ia(textoReunion); 

          console.log('TRADUCCION:', traduccion.textoRespuesta);   

          await this.emailService.enviar_minuta(traduccion.textoRespuesta, this.gmails);

          return {
            resumen: resumen,
            puntosImportantes: puntosImportantes,
            temasVistos: temasVistos,
            proximosPasos: proximosPasos,
            textoReunion: traduccion.textoRespuesta, 
          };
    }



}