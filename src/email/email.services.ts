// src/email/email.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { MicrosoftToken } from "./email.token.services";
import axios from "axios";

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  contentId?: string;
  cid?: string;
  isInline?: boolean;
}

export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  telefono: string;
  attachments?: EmailAttachment[];
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly graphEndpoint = `https://graph.microsoft.com/v1.0/users/${process.env.SMTP_USER}/sendMail`;

  constructor(
    private readonly microsoftToken: MicrosoftToken,
  ) {}


  async send(payload: SendEmailPayload): Promise<void> {
    const token = await this.microsoftToken.getAccessToken();
    const destinatarios = Array.isArray(payload.to) ? payload.to : [payload.to];
    const toRecipients = destinatarios.map((address) => ({
      emailAddress: { address },
    }));

    const message: Record<string, unknown> = {
      subject: payload.subject,
      body: { contentType: "HTML", content: payload.html },
      toRecipients,
    };

    if (payload.attachments?.length) {
      message.attachments = payload.attachments.map((attachment) => {
        const contenido = Buffer.isBuffer(attachment.content)
          ? attachment.content
          : Buffer.from(attachment.content);
        const contentId = attachment.contentId ?? attachment.cid;
        const graphAttachment: Record<string, unknown> = {
          "@odata.type": "#microsoft.graph.fileAttachment",
          name: attachment.filename,
          contentType: attachment.contentType ?? "application/octet-stream",
          contentBytes: contenido.toString("base64"),
        };
        if (contentId) {
          graphAttachment.contentId = contentId;
          graphAttachment.isInline = attachment.isInline ?? true;
        }
        return graphAttachment;
      });
    }

    try {
      await axios.post(
        this.graphEndpoint,
        { message },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
      );
    } catch (error) {
      const detail =
        axios.isAxiosError(error) && error.response?.data
          ? error.response.data
          : error instanceof Error
            ? error.message
            : error;
      this.logger.error("Error al enviar email por Microsoft Graph:", JSON.stringify(detail));
      throw error;
    }
  }

  private escapeHtml(texto: string): string {
    return texto
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  private formatear_nombres_en_linea(texto: string): string {
    let resultado = texto;

    resultado = resultado.replace(
      /\*\*([^*]+)\*\*:\s*(.*)/g,
      '<strong style="color: #1e40af;">$1:</strong><br><span style="display: block; margin-top: 6px; padding-left: 12px;">$2</span>',
    );

    resultado = resultado.replace(
      /\*\*([^*]+)\*\*/g,
      '<strong style="color: #1e40af;">$1</strong>',
    );

    return resultado;
  }

  private formatear_texto_minuta(texto_minuta: string): string {
    const lineas = texto_minuta.split("\n");
    let html = "";
    let enLista = false;

    const cerrarLista = () => {
      if (enLista) {
        html += "</ul>";
        enLista = false;
      }
    };

    for (const lineaRaw of lineas) {
      const linea = lineaRaw.trim();

      if (!linea) {
        cerrarLista();
        html += "<br>";
        continue;
      }

      if (linea.startsWith("## ")) {
        cerrarLista();
        const titulo = this.escapeHtml(linea.slice(3));
        html += `<h2 style="margin: 24px 0 12px 0; color: #1e293b; font-size: 16px; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">${titulo}</h2>`;
        continue;
      }

      if (linea.startsWith("### ")) {
        cerrarLista();
        const titulo = this.escapeHtml(linea.slice(4));
        html += `<h3 style="margin: 18px 0 10px 0; color: #334155; font-size: 15px; font-weight: 600;">${titulo}</h3>`;
        continue;
      }

      if (linea.startsWith("- ") || linea.startsWith("* ")) {
        const contenido = this.formatear_nombres_en_linea(
          this.escapeHtml(linea.slice(2)),
        );

        if (!enLista) {
          html += '<ul style="margin: 8px 0 16px 0; padding-left: 22px; list-style-type: disc;">';
          enLista = true;
        }

        html += `<li style="margin-bottom: 12px; line-height: 1.7;">${contenido}</li>`;
        continue;
      }

      cerrarLista();
      const parrafo = this.formatear_nombres_en_linea(this.escapeHtml(linea));
      html += `<p style="margin: 0 0 12px 0; line-height: 1.7;">${parrafo}</p>`;
    }

    cerrarLista();
    return html;
  }

  html_minuta(
    texto_minuta: string,
    telefono: string
  ): string {
    const contenidoFormateado = this.formatear_texto_minuta(texto_minuta);

    return `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f9; padding: 30px 10px; color: #333333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e1e5eb;">
          
          <div style="background-color: #1e293b; padding: 25px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.5px;">
              Minuta de Reunión
            </h1>
            <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 14px;">Grupo Firma</p>
          </div>

          <div style="padding: 30px 25px;">
            <p style="font-size: 16px; line-height: 1.5; color: #1e293b; margin-top: 0;">
              Estimado equipo,
            </p>
            <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 25px;">
              Compartimos con ustedes el resumen, las decisiones técnicas y los puntos clave tratados en la última reunión respecto al funcionamiento de nuestras plataformas (**autosYA**, **rent a car**, **lubricentro**, etc.).
            </p>

            <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 25px;">
              <h3 style="margin-0 0 10px 0; color: #1e293b; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">
                📋 Detalles y Acuerdos:
              </h3>
              <div style="font-size: 14px; line-height: 1.7; color: #334155;">
                ${contenidoFormateado}
              </div>
            </div>

            <p style="font-size: 14px; line-height: 1.5; color: #64748b;">
              Por favor, revisen los puntos asignados. Si tienen alguna duda o acotación, pueden responder directamente a este correo.
            </p>

            <div style="margin-top: 25px; text-align: center;">
              <a href="tel:${telefono}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 8px 16px; margin: 4px; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 4px;">
                Llamar Soporte
              </a>
              <a href="https://wa.me/${telefono.replace(/\D/g, "")}" target="_blank" style="display: inline-block; background-color: #16a34a; color: #ffffff; padding: 8px 16px; margin: 4px; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 4px;">
                WhatsApp
              </a>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;">
                Número: <code style="font-family: monospace; font-size: 13px; font-weight: bold; color: #1e293b; background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; user-select: all;">${this.escapeHtml(telefono)}</code>
              </p>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">

            <p style="font-size: 14px; color: #1e293b; margin: 0; font-weight: 600;">
              Saludos cordiales,
            </p>
            <p style="font-size: 14px; color: #64748b; margin: 3px 0 0 0;">
              Área de Tecnología e Informática<br>
              <strong>Grupo Firma</strong>
            </p>
          </div>

          <div style="background-color: #f1f5f9; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 12px; color: #94a3b8;">
              Este es un correo automático, por favor no lo respondas si no es necesario.
            </p>
          </div>

        </div>
      </div>
    `;
  }

  async enviar_minuta(texto_minuta: string, gmail: string[]): Promise<void> {
    const destinatarios = gmail.map((email) => email.trim()).filter(Boolean);

    if (destinatarios.length === 0) {
      throw new Error('No hay destinatarios para enviar la minuta');
    }

    const telefono = "+56951690604";

    await this.send({
      to: destinatarios,
      telefono,
      subject: "Minuta de Reunión - Grupo Firma",
      html: this.html_minuta(texto_minuta, telefono),
    });
  }

}







