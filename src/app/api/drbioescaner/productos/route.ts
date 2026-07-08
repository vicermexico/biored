import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://drbioescaner.com/api/integracion/productos', {
      headers: { 'x-api-key': process.env.DRBIOESCANER_API_KEY! },
      cache: 'no-store',
    })
    if (!res.ok) return NextResponse.json({ error: 'Error externo' }, { status: 502 })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Error al conectar con drbioescaner.com' }, { status: 502 })
  }
}
