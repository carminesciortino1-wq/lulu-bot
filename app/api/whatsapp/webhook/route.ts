import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  if (p.get('hub.mode') === 'subscribe' && p.get('hub.verify_token') === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(p.get('hub.challenge')!, { status: 200 })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const msg = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
  if (!msg) return NextResponse.json({ ok: true })

  const from = msg.from
  const text = msg.text?.body || ''
  const baseUrl = process.env.VERCEL_URL? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'

  await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, from, channel: 'whatsapp' })
  })

  return NextResponse.json({ ok: true })
}
