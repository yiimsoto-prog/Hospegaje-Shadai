import { answerConcierge } from "@/lib/ai/concierge";
import { json } from "@/lib/server/authz";
import { sanitizeText } from "@/lib/security/validate";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { message?: string };
  const message = sanitizeText(body.message, 500);
  if (message.length < 2) return json({ error: "empty_message" }, 400);
  return json({ ...answerConcierge(message), at: new Date().toISOString() });
}
