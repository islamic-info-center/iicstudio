// WhatsApp webhook (set in Dualhook / Meta): answers Meta's verification and accepts incoming events.
// Replies from customers reach the WhatsApp Business app on the phone, so nothing is stored here.
const VERIFY_TOKEN = "icstudio-38a55f0d590a6047b41b76eb";

export default async (req) => {
  const url = new URL(req.url);
  if (req.method === "GET") {
    const ok = url.searchParams.get("hub.mode") === "subscribe" && url.searchParams.get("hub.verify_token") === VERIFY_TOKEN;
    return ok ? new Response(url.searchParams.get("hub.challenge") || "", {status: 200}) : new Response("Forbidden", {status: 403});
  }
  return new Response("ok", {status: 200});
};
