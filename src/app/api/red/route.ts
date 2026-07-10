import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

async function calcularActivo(invitadoId: string, inicioMes: string, finMes: string): Promise<boolean> {
  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('id')
    .eq('usuario_id', invitadoId)
    .eq('estado', 'entregado')
    .gte('created_at', inicioMes)
    .lt('created_at', finMes)

  if (!pedidos || pedidos.length === 0) return false

  const { data: detalles } = await supabase
    .from('detalle_pedidos')
    .select('cantidad')
    .in('pedido_id', pedidos.map((p: any) => p.id))

  const total = (detalles || []).reduce((sum: number, d: any) => sum + (d.cantidad || 0), 0)
  return total >= 6
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const usuario_id = searchParams.get('usuario_id')
  const nivel = parseInt(searchParams.get('nivel') || '1', 10)

  if (!usuario_id) return NextResponse.json([], { status: 400 })

  const ahora = new Date()
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString()
  const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 1).toISOString()

  // Subir nivel-1 veces para llegar a los referidores del nivel pedido
  let referidorIds: string[] = [usuario_id]

  for (let i = 1; i < nivel; i++) {
    const { data } = await supabase
      .from('red_afiliados')
      .select('usuario_id')
      .in('referidor_id', referidorIds)

    if (!data || data.length === 0) return NextResponse.json([])
    referidorIds = data.map((r: any) => r.usuario_id)
  }

  // Obtener los usuarios del nivel pedido
  const { data, error } = await supabase
    .from('red_afiliados')
    .select('usuario_id, usuarios!red_afiliados_usuario_id_fkey(id, nombre, celular)')
    .in('referidor_id', referidorIds)

  if (error) return NextResponse.json([], { status: 500 })
  if (!data || data.length === 0) return NextResponse.json([])

  const resultado = await Promise.all(
    data.map(async (r: any) => {
      const invitadoId = r.usuarios?.id
      const activo = invitadoId ? await calcularActivo(invitadoId, inicioMes, finMes) : false
      return { ...r, usuarios: { ...r.usuarios, activo } }
    })
  )

  return NextResponse.json(resultado)
}
