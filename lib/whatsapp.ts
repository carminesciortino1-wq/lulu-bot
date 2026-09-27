export async function sendWhatsAppMessage(to: string, text: string) {
  const token = process.env.WHATSAPP_TOKEN!;
  const phoneId = process.env.WHATSAPP_PHONE_ID!;
  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text } })
  });
  return await res.json();
}

export function parseReminderFromText(text: string) {
  const now = new Date();
  let eventDate = new Date(now);
  let remindAt = new Date(now);
  const lower = text.toLowerCase();
  if (lower.includes('domani')) {
    eventDate.setDate(now.getDate()+1);
    remindAt = new Date(eventDate);
    remindAt.setHours(8,0,0,0);
  } else {
    eventDate.setDate(now.getDate()+1);
    remindAt.setHours(9,0,0,0);
  }
  let title = text.replace(/ricordami|ricorda|lulù|domani|dopodomani/gi,'').trim().slice(0,100) || 'Promemoria';
  return { title, event_date: eventDate, remind_at: remindAt };
}
