'use client'
import { useEffect, useState } from 'react'
import JuegoModal from './JuegoModal'

export default function JuegoProvider() {
  const [juego, setJuego] = useState<{ video_url: string; tokens: number; tipo: string } | null>(null)
  const [usuarioId, setUsuarioId] = useState<string | null>(null)

  useEffect(() => {
    const u = localStorage.getItem('usuario')
    if (!u) return
    const usr = JSON.parse(u)
    setUsuarioId(usr.id)
    if (sessionStorage.getItem('juego_visto')) return
    fetch('/api/juego/verificar?usuario_id=' + usr.id)
      .then(r => r.json())
      .then(d => {
        if (d.aplica) {
          setTimeout(() => {
            setJuego({ video_url: d.video_url, tokens: d.tokens, tipo: d.tipo })
          }, 5000)
        }
      })
      .catch(() => {})
  }, [])

  const handleCerrar = () => {
    sessionStorage.setItem('juego_visto', '1')
    setJuego(null)
    const u = localStorage.getItem('usuario')
    if (u) {
      const usr = JSON.parse(u)
      fetch('/api/tokens/saldo?usuario_id=' + usr.id)
        .then(r => r.json())
        .then(d => {
          window.dispatchEvent(
            new CustomEvent('biored:tokens-changed', { detail: { saldo: d.saldo || 0 } })
          )
        })
        .catch(() => {})
    }
  }

  if (!juego || !usuarioId) return null

  return (
    <JuegoModal
      video_url={juego.video_url}
      tokens={juego.tokens}
      tipo={juego.tipo}
      usuario_id={usuarioId}
      onCerrar={handleCerrar}
    />
  )
}
