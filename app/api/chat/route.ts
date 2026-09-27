import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendWhatsAppMessage, parseReminderFromText } from '@/lib/whatsapp'

const DEFAULT_PERSONALITY = `
Sei Lulu, segretaria personale privata di Carmine su WhatsApp.
COMPORTAMENTO BASE (se non diversamente istruito):
- Professionale, precisa, meticolosa, cordiale, rispettosa.
- NON usi nomignoli affettuosi come "amore", "tesoro", "cuore" MAI, a meno che l'utente non ti dica esplicitamente di farlo.
- Usi emoji SOLO se l'utente ti dice di usarle. Altrimenti ZERO emoji.
- Risposte brevi, chiare, senza frasi inutili.
- Fuso Europe/Rome. Oggi e {date}
- Obiettivo: ricordare, organizzare, avvisare. Non flirtare.
`

async function getPersonalityInstructions(): Promise<string> {
  const { data } = await supabase.from('memories').select('content').eq('category','personality').order('created_at', { ascending: false }).limit(3)
  if (!data || data.length === 0) return ''
  return `\n\nISTRUZIONI SUL CARATTERE DATE DALL'UTENTE (priorita massima):\n${data.map(d => '- ' + d.content).join('\n')}`
}

export async function POST(req: NextRequest) {
  try {
    const { message, from, channel = 'whatsapp' } = await req.json()
    const nowStr = new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })
    
    await supabase.from('conversations').insert({ role: 'user', content: message, channel })

    const isPersonalitySetup = /comportati come|da ora in poi sii|voglio che tu sia|il tuo carattere deve essere|usa emoji|non usare emoji|chiamami|non chiamarmi amore| sii piu| sii meno/i.test(message)
    
    if (isPersonalitySetup) {
      await supabase.from('memories').insert({ category: 'personality', content: message, importance: 10 })
      const reply = `Capito. Ho aggiornato il mio carattere: "${message}". Da ora in poi mi comportero cosi.`
      await supabase.from('conversations').insert({ role: 'lulu', content: reply, channel })
      if (channel === 'whatsapp' && from) await sendWhatsAppMessage(from, reply)
      return NextResponse.json({ reply })
    }

    const personalityOverride = await getPersonalityInstructions()
    const system = (DEFAULT_PERSONALITY + personalityOverride).replace('{date}', nowStr)

    const isReminder = /ricordami|promemoria|ricorda|non dimenticare/i.test(message)
    let reminderCreated = null
    if (isReminder) {
      const parsed = parseReminderFromText(message)
      const { data } = await supabase.from('reminders').insert({ title: parsed.title, event_date: parsed.event_date.toISOString(), remind_at: parsed.remind_at.toISOString(), original_text: message, status: 'pending' }).select().single()
      reminderCreated = data
    }

    if (/ricordati che|tieni a mente|salva che/i.test(message) && !isPersonalitySetup) {
      await supabase.from('memories').insert({ category: 'fatto', content: message, importance: 8 })
    }

    let luluReply = reminderCreated ? `Ricevuto. Promemoria impostato: ${reminderCreated.title} - Evento: ${new Date(reminderCreated.event_date).toLocaleDateString('it-IT')} alle ${new Date(reminderCreated.event_date).toLocaleTimeString('it-IT')} - Ti avvisero il ${new Date(reminderCreated.remind_at).toLocaleDateString('it-IT')}.` : `Ricevuto: "${message.slice(0,80)}". Me ne occupo.`

    await supabase.from('conversations').insert({ role: 'lulu', content: luluReply, channel })
    if (channel === 'whatsapp' && from) await sendWhatsAppMessage(from, luluReply)

    return NextResponse.json({ reply: luluReply })
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
