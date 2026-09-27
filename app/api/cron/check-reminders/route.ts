import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}` && req.nextUrl.searchParams.get('secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date().toISOString()
  const { data: due } = await supabase.from('reminders').select('*').eq('status','pending').lte('remind_at', now)

  if (!due || due.length === 0) return NextResponse.json({ checked: true, sent: 0 })

  for (const r of due) {
    const to = process.env.MY_WHATSAPP_NUMBER!
    const text = `🔔 Promemoria Lulù: ${r.title}\nEvento del ${new Date(r.event_date).toLocaleString('it-IT')}\nTesto originale: ${r.original_text}`
    await sendWhatsAppMessage(to, text)
    await supabase.from('reminders').update({ status: 'sent' }).eq('id', r.id)
  }

  return NextResponse.json({ checked: true, sent: due.length })
}
