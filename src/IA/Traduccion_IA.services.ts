import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";

@Injectable()
export class Traduccion_IA_Services {
    private readonly logger = new Logger(Traduccion_IA_Services.name);

    empresas: string[] = [
        'autosYA - empresa de venta de autos',
        'facele',
        'walcu',
        'rent a car - arriendo de autos',
        'lubricentro',
        'gf rent - administracion de autos',
        'grupo firma - es un holding con multiples empresas'
    ];

    private construir_prompt_sistema(equipo: string[]): string {
        const listaEquipo = equipo.map((persona) => `- ${persona}`).join('\n');
        const listaEmpresas = this.empresas.map((empresa) => `- ${empresa}`).join('\n');

        return `Eres un asistente experto en reuniones técnicas del "Grupo Firma".
Tu trabajo es traducir del inglés al español y mejorar la precisión del resumen de la reunión.

CONTEXTO DEL EQUIPO (usa estos nombres exactos cuando aparezcan mal escritos, abreviados o en inglés):
${listaEquipo || '- (sin usuarios registrados en esta sección)'}

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

    async generar_traduccion_ia(texto: string, equipo: string[]) {
        try {
            const apiKey = process.env.OPENROUTER_API_KEY;
            const url = 'https://openrouter.ai/api/v1/chat/completions';

            if (!apiKey) {
                throw new Error('OPENROUTER_API_KEY no configurada');
            }

            const payload = {
                model: 'google/gemini-2.5-flash-lite',
                max_tokens: 8192,
                messages: [
                    {
                        role: 'system',
                        content: this.construir_prompt_sistema(equipo),
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
                throw new Error(`Error en OpenRouter: ${response.status}`);
            }

            const data = await response.json();
            const choice = data?.choices?.[0];
            const message = choice?.message;

            if (choice?.finish_reason === 'length') {
                throw new Error('La traducción se cortó por límite de tokens. Intenta con un texto más corto o aumenta max_tokens.');
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
            this.logger.warn(`OpenRouter falló, usando Gemini como respaldo: ${error}`);

            try {
                const textoRespuesta = await this.generar_traduccion_ia_gemini(texto, equipo);
                return { textoRespuesta };
            } catch (errorGemini) {
                throw new InternalServerErrorException(
                    'Error al generar la traducción IA (OpenRouter y Gemini fallaron): ' + errorGemini,
                );
            }
        }
    }

    async generar_traduccion_ia_gemini(texto: string, equipo: string[]): Promise<string> {
        const { GoogleGenAI } = await (eval(`import('@google/genai')`) as Promise<typeof import('@google/genai')>);
        const apiKey = process.env.KEY_GEMINI;

        if (!apiKey) {
            throw new Error('KEY_GEMINI no está definida en .env');
        }

        const ai = new GoogleGenAI({ apiKey });
        const prompt = `${this.construir_prompt_sistema(equipo)}\n\n---\n\nTEXTO A TRADUCIR:\n${texto}`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            contents: prompt,
        });

        return response.text ?? '';
    }
}
