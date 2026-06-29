import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

export async function POST(request: Request) {
  try {
    const ahora = new Date()
    const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    const ultimoDiaMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59)

    const { data: pedidos } = await supabase
      .from('pedidos')
      .select('usuario_id, id')
      .eq('estado', 'entregado')
      .gte('created_at', primerDiaMes.toISOString())
      .lte('created_at', ultimoDiaMes.toISOString())

    if (!pedidos || pedidos.length === 0) {
      return NextResponse.json({ mensaje: 'No hay pedidos entregados este mes' })
    }

    const productosPorUsuario: Record<string, number> = {}

    for (const pedido of pedidos) {
      const { data: detalles } = await supabase
        .from('detalle_pedidos')
        .select('cantidad')
        .eq('pedido_id', pedido.id)
      const totalProductos = detalles?.reduce((sum, d) => sum + d.cantidad, 0) || 0
      productosPorUsuario[pedido.usuario_id] = (productosPorUsuario[pedido.usuario_id] || 0) + totalProductos
    }

    const usuariosActivos = new Set(
      Object.entries(productosPorUsuario)
        .filter(([_, total]) => total >= 6)
        .map(([id]) => id)
    )

    const { data: redAfiliados } = await supabase
      .from('red_afiliados')
      .select('usuario_id, referidor_id')

    if (!redAfiliados) return NextResponse.json({ mensaje: 'Sin datos de red' })

    const tokensAcreditar: Record<string, number> = {}

    for (const relacion of redAfiliados) {
      const afiliadoId = relacion.usuario_id
      const titularId = relacion.referidor_id
      const productosAfiliado = productosPorUsuario[afiliadoId] || 0
      if (productosAfiliado === 0) continue
      if (!usuariosActivos.has(titularId)) continue
      const tokensGenerados = Math.floor(productosAfiliado / 12)
      if (tokensGenerados === 0) continue
      tokensAcreditar[titularId] = (tokensAcreditar[titularId] || 0) + tokensGenerados
    }

    let totalAcreditados = 0
    const mesAnio = (ahora.getMonth() + 1) + '/' + ahora.getFullYear()

    for (const [usuarioId, cantidad] of Object.entries(tokensAcreditar)) {
      const { data: tokenActual } = await supabase
        .from('tokens')
        .select('saldo')
        .eq('usuario_id', usuarioId)
        .single()

      const nuevoSaldo = (tokenActual?.saldo || 0) + cantidad

      await supabase.from('tokens').update({ saldo: nuevoSaldo }).eq('usuario_id', usuarioId)

      await supabase.from('historial_tokens').insert({
        usuario_id: usuarioId,
        cantidad,
        motivo: 'Corte mensual ' + mesAnio,
        fecha: new Date().toISOString()
      })

      totalAcreditados += cantidad
    }

    return NextResponse.json({
      mensaje: 'Calculo completado',
      usuariosActivos: usuariosActivos.size,
      tokensAcreditados: totalAcreditados,
      detalle: tokensAcreditar
    })

  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error al calcular tokens' }, { status: 500 })
  }
}