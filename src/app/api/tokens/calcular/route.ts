import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)

const NIVELES_RED = 5

export async function POST(request: Request) {
  try {
    const ahora = new Date()
    const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    const ultimoDiaMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59)
    const mesAnio = (ahora.getMonth() + 1) + '/' + ahora.getFullYear()

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

    const referidorPorUsuario: Record<string, string> = {}
    for (const relacion of redAfiliados) {
      referidorPorUsuario[relacion.usuario_id] = relacion.referidor_id
    }

    // titularId → { fuenteId → cantidad }
    // fuenteId === titularId significa tokens propios
    const tokensDesglose: Record<string, Record<string, number>> = {}

    const sumar = (titularId: string, fuenteId: string, cantidad: number) => {
      if (!tokensDesglose[titularId]) tokensDesglose[titularId] = {}
      tokensDesglose[titularId][fuenteId] = (tokensDesglose[titularId][fuenteId] || 0) + cantidad
    }

    // 1. Compras propias
    for (const usuarioId of usuariosActivos) {
      const propios = productosPorUsuario[usuarioId] || 0
      const tokensPropios = Math.floor(propios / 12)
      if (tokensPropios > 0) sumar(usuarioId, usuarioId, tokensPropios)
    }

    // 2. Red hasta 5 niveles
    for (const [afiliadoId, productosAfiliado] of Object.entries(productosPorUsuario)) {
      if (productosAfiliado === 0) continue
      const tokensGenerados = Math.floor(productosAfiliado / 12)
      if (tokensGenerados === 0) continue

      let currentId = afiliadoId
      for (let nivel = 1; nivel <= NIVELES_RED; nivel++) {
        const titularId = referidorPorUsuario[currentId]
        if (!titularId) break
        if (usuariosActivos.has(titularId)) {
          sumar(titularId, afiliadoId, tokensGenerados)
        }
        currentId = titularId
      }
    }

    // Recopilar todos los ids de afiliados (fuentes distintas al titular) para buscar nombres
    const idsAfiliados = new Set<string>()
    for (const [titularId, fuentes] of Object.entries(tokensDesglose)) {
      for (const fuenteId of Object.keys(fuentes)) {
        if (fuenteId !== titularId) idsAfiliados.add(fuenteId)
      }
    }

    const nombresPorId: Record<string, string> = {}
    if (idsAfiliados.size > 0) {
      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('id, nombre')
        .in('id', Array.from(idsAfiliados))
      for (const u of usuarios || []) {
        nombresPorId[u.id] = u.nombre
      }
    }

    let totalAcreditados = 0

    for (const [titularId, fuentes] of Object.entries(tokensDesglose)) {
      const totalTitular = Object.values(fuentes).reduce((sum, n) => sum + n, 0)

      // Actualizar saldo
      const { data: tokenActual } = await supabase
        .from('tokens')
        .select('saldo')
        .eq('usuario_id', titularId)
        .single()

      const nuevoSaldo = (tokenActual?.saldo || 0) + totalTitular
      await supabase.from('tokens').update({ saldo: nuevoSaldo }).eq('usuario_id', titularId)

      // Insertar un registro por cada fuente
      const registros = Object.entries(fuentes).map(([fuenteId, cantidad]) => {
        const esPropios = fuenteId === titularId
        const motivo = esPropios
          ? `Tokens propios - ${mesAnio}`
          : `Tokens de ${nombresPorId[fuenteId] || fuenteId} - ${mesAnio}`
        return {
          usuario_id: titularId,
          cantidad,
          motivo,
          fecha: new Date().toISOString(),
        }
      })

      await supabase.from('historial_tokens').insert(registros)

      totalAcreditados += totalTitular
    }

    return NextResponse.json({
      mensaje: 'Calculo completado',
      usuariosActivos: usuariosActivos.size,
      tokensAcreditados: totalAcreditados,
      detalle: tokensDesglose,
    })

  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error al calcular tokens' }, { status: 500 })
  }
}
