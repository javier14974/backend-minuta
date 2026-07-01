import { Injectable, InternalServerErrorException, OnModuleInit } from "@nestjs/common";

@Injectable()
export class Traduccion_IA_Services implements OnModuleInit {

     async onModuleInit() {

    }

    programadores: string[] = [
        'javier - desarrollador',
        'matias - desarrollador',
        'danko - desarrollador',
        'daniel - desarrollador',
        'karina - analisis de datos',
        'jorge - desarrollador',
        'jose - desarrollador',
        'gustavo - soporte tecnico',
        'felipe - desarrollador',
        'don miguel - jefe de la empresa, este pide cosas como requerimientos el no inciia proyectos ni tampoco programas, solo pide que se haga lo que se le pide',
    ];
 
    empresas: string[] = [
        'autosYA - empresa de venta de autos',
        'facele',
        'walcu',
        'rent a car - arriendo de autos',
        'lubricentro',
        'gf rent - administracion de autos'
    ];

    private construir_prompt_sistema(): string {
        const listaEquipo = this.programadores.map((persona) => `- ${persona}`).join('\n');
        const listaEmpresas = this.empresas.map((empresa) => `- ${empresa}`).join('\n');

        return `Eres un asistente experto en reuniones técnicas del "Grupo Firma".
Tu trabajo es traducir del inglés al español y mejorar la precisión del resumen de la reunión.

CONTEXTO DEL EQUIPO (usa estos nombres exactos cuando aparezcan mal escritos, abreviados o en inglés):
${listaEquipo}

CONTEXTO DE EMPRESAS Y PROYECTOS (usa estos nombres exactos):
${listaEmpresas}

INSTRUCCIONES:
1. Traduce todo al español claro y profesional.
2. Corrige nombres de personas y empresas según el contexto anterior (ej: "Felipe", "Javier", "autosYA", "GF Rent").
3. Mejora la redacción para que el resumen sea más exacto y fácil de entender, sin inventar información nueva.
4. Aclara quién dijo o hará qué cuando el texto original sea ambiguo, usando solo lo que se infiere del contenido.
5. Mantén los hechos, decisiones, tareas y responsables; no elimines puntos importantes.
6. En "Próximos pasos", deja explícito el responsable cuando aparezca (formato: **Nombre**: tarea).
7. Mantén la estructura markdown original (##, ###, listas con -) y deja líneas en blanco entre secciones.

REGLAS ESTRICTAS:
- Devuelve ÚNICAMENTE el texto final traducido y mejorado
- No agregues introducciones, explicaciones ni comentarios
- No repitas estas instrucciones`;
    }

    async generar_traduccion_ia(texto: string){

        try {
            const apiKey = process.env.OPENROUTER_API_KEY;
            const url = 'https://openrouter.ai/api/v1/chat/completions';

            if (!apiKey) {
                throw new InternalServerErrorException('OPENROUTER_API_KEY no configurada');
            }

            const payload = {
                 model: 'google/gemini-2.5-flash-lite',
                max_tokens: 8192,
                messages: [
                    {
                        role: 'system',
                        content: this.construir_prompt_sistema(),
                    },
                    {
                        role: 'user',
                        content: texto
                    }
                ]
            };


            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new InternalServerErrorException(`Error en OpenRouter: ${response.status}`);
            }

            const data = await response.json();
            const choice = data?.choices?.[0];
            const message = choice?.message;

            if (choice?.finish_reason === 'length') {
                throw new InternalServerErrorException('La traducción se cortó por límite de tokens. Intenta con un texto más corto o aumenta max_tokens.');
            }

            const textoRespuesta = typeof message?.content === 'string'
                ? message.content
                : Array.isArray(message?.content)
                    ? message.content
                        .filter((parte: any) => typeof parte?.text === 'string')
                        .map((parte: any) => parte.text)
                        .join('\n')
                    : '';

                return {
                    textoRespuesta: textoRespuesta
            };
        } catch (error) {
            throw new InternalServerErrorException('Error al generar la traducción IA: ' + error);
        }
    }
}