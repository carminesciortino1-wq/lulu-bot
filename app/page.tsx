'use client'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [input, setInput] = useState('')
  const [chat, setChat] = useState<any[]>([])
  const [personality, setPersonality] = useState('Professionale, precisa, senza amore/tesoro, senza emoji se non richiesto.')

  const send = async () => {
    if (!input) return
    setChat(c=>[...c,{role:'user',content:input}])
    const res = await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:input,channel:'web'})})
    const data = await res.json()
    setChat(c=>[...c,{role:'lulu',content:data.reply}])
    setInput('')
  }

  const savePersonality = async () => {
    const text = `Da ora in poi il tuo carattere deve essere: ${personality}. Sovrascrivi tutto il precedente.`
    await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,channel:'web'})})
    alert('Carattere aggiornato! Ora Lulù è: ' + personality)
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h1>Lulù - Dashboard Carattere Settabile</h1>
      <p style={{ background: 'white', padding: 12, borderRadius: 8 }}>Stato: <b>{personality}</b></p>
      
      <div style={{ background: 'white', padding: 16, borderRadius: 12, marginBottom: 20 }}>
        <h3>⚙️ Imposta come vuoi che sia Lulù:</h3>
        <textarea value={personality} onChange={e=>setPersonality(e.target.value)} style={{ width: '100%', height: 100, padding: 10, borderRadius: 8 }} placeholder="Es: Sii dolcissima, usa tante emoji, chiamami amore tesoro, sii super affettuosa..." />
        <button onClick={savePersonality} style={{ marginTop: 10, width: '100%', padding: 12, background: 'black', color: 'white', borderRadius: 8 }}>Salva Carattere</button>
        <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>Esempi veloci: <br/>• Professionale e distaccata senza emoji<br/>• Dolce, affettuosa, usa ❤️ e chiamami amore<br/>• Ironica, simpatica, usa 😂</p>
      </div>

      <div style={{ background: 'white', padding: 16, borderRadius: 12 }}>
        <h3>Chat test</h3>
        <div style={{ height: 300, overflowY: 'auto', border: '1px solid #ddd', padding: 10, borderRadius: 8, marginBottom: 10 }}>
          {chat.map((m,i)=><div key={i} style={{ marginBottom: 8, textAlign: m.role==='user'?'right':'left' }}><b>{m.role}:</b> {m.content}</div>)}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Scrivi a Lulù..." style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
          <button onClick={send} style={{ padding: '10px 20px', background: 'black', color: 'white', borderRadius: 8 }}>Invia</button>
        </div>
      </div>
    </div>
  )
}
