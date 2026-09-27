import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * WhatsApp Cloud API (Meta Graph API).
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/messages
 *
 * - Free-form text messages only reach users who messaged you in the last 24h.
 * - For first contact with a customer use an approved template (WHATSAPP_ORDER_TEMPLATE).
 * All sends are best-effort: failures are logged and never break the order flow.
 */

function configured() {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

type Payload =
  | { type: "text"; text: { body: string; preview_url?: boolean } }
  | {
      type: "template";
      template: {
        name: string;
        language: { code: string };
        components?: { type: "body"; parameters: { type: "text"; text: string }[] }[];
      };
    };

async function send(to: string, payload: Payload, kind: string, orderId?: string) {
  if (!configured()) return { skipped: true as const };
  const version = process.env.WHATSAPP_API_VERSION || "v21.0";
  const url = `https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  let success = false;
  let error: string | null = null;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to, ...payload }),
      signal: AbortSignal.timeout(10_000),
    });
    success = res.ok;
    if (!res.ok) error = (await res.text()).slice(0, 500);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
  await prisma.messageLog
    .create({ data: { to, kind, success, error, orderId } })
    .catch(() => undefined);
  return { success, error };
}

export function sendText(to: string, body: string, kind: string, orderId?: string) {
  return send(to, { type: "text", text: { body } }, kind, orderId);
}

export function sendTemplate(to: string, name: string, params: string[], kind: string, orderId?: string) {
  return send(
    to,
    {
      type: "template",
      template: {
        name,
        language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "ar" },
        components: params.length
          ? [{ type: "body", parameters: params.map((text) => ({ type: "text" as const, text })) }]
          : undefined,
      },
    },
    kind,
    orderId,
  );
}
