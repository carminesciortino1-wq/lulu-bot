export const metadata = { title: 'Lulù - Segretaria WhatsApp', description: 'Lulù segretaria privata 100% gratis - carattere settabile' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f8f7f4' }}>{children}</body>
    </html>
  )
}
