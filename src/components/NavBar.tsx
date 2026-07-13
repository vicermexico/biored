'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

export default function NavBar() {
  const path = usePathname()
  const router = useRouter()
  const [carritoCount, setCarritoCount] = useState(0)
  const [confeti, setConfeti] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = localStorage.getItem('carrito')
    if (c) {
      try {
        const items = JSON.parse(c)
        setCarritoCount(items.reduce((acc: number, i: any) => acc + i.cantidad, 0))
      } catch { setCarritoCount(0) }
    }
  }, [])

  useEffect(() => {
    if (!confeti) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const particles: any[] = []
    const colors = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6']
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 10 + 5,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 4 + 2,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.2,
      })
    }
    let frame: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false
      particles.forEach(p => {
        p.y += p.speed
        p.angle += p.spin
        if (p.y < canvas.height + 20) alive = true
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      })
      if (alive) frame = requestAnimationFrame(draw)
      else setConfeti(false)
    }
    frame = requestAnimationFrame(draw)
    const timer = setTimeout(() => { setConfeti(false); router.push('/red') }, 2000)
    return () => { cancelAnimationFrame(frame); clearTimeout(timer) }
  }, [confeti])

  const handleInvita = () => {
    setConfeti(true)
    setTimeout(() => router.push('/red'), 2000)
  }

  const handleSalir = () => {
    if (confirm('¿Seguro que quieres cerrar sesión?')) {
      localStorage.removeItem('usuario')
      localStorage.removeItem('carrito')
      router.push('/')
    }
  }

  const active = (p: string) => path === p ? 'text-red-600' : 'text-gray-400'
  const activeText = (p: string) => path === p ? 'text-red-600 font-medium' : 'text-gray-400'
  const activeRed = (p: string) => path === p

  return (
    <>
      {confeti && (
        <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }} />
      )}

      <button
        onClick={handleInvita}
        style={{
          position: 'fixed',
          right: 16,
          bottom: 80,
          zIndex: 100,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#ef4444',
          color: 'white',
          fontSize: 11,
          fontWeight: 700,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          border: 'none',
          cursor: 'pointer',
          gap: 2,
        }}
      >
        <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
        </svg>
        Invita
      </button>

      <nav className='fixed bottom-0 left-0 right-0 bg-white flex justify-around py-2 px-1' style={{ boxShadow: '0 -4px 12px rgba(0,0,0,0.08)' }}>
        <Link href='/dashboard' className='flex flex-col items-center gap-0.5 px-2 py-1'>
          <svg xmlns='http://www.w3.org/2000/svg' className={`w-6 h-6 ${active('/dashboard')}`} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
          </svg>
          <span className={`text-xs ${activeText('/dashboard')}`}>Inicio</span>
        </Link>

        <Link href='/pedidos' className='flex flex-col items-center gap-0.5 px-2 py-1'>
          <svg xmlns='http://www.w3.org/2000/svg' className={`w-6 h-6 ${active('/pedidos')}`} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' />
          </svg>
          <span className={`text-xs ${activeText('/pedidos')}`}>Pedidos</span>
        </Link>

        <Link href='/red' className='flex flex-col items-center gap-0.5 px-2 py-1'>
          <svg xmlns='http://www.w3.org/2000/svg' className={`w-6 h-6 ${activeRed('/red') ? 'text-red-600' : 'text-gray-400'}`} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' />
          </svg>
          <span className={`text-xs ${activeRed('/red') ? 'text-red-600 font-medium' : 'text-red-500 font-medium'}`}>Mi Red</span>
        </Link>

        <Link href='/perfil' className='flex flex-col items-center gap-0.5 px-2 py-1'>
          <svg xmlns='http://www.w3.org/2000/svg' className={`w-6 h-6 ${active('/perfil')}`} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
          </svg>
          <span className={`text-xs ${activeText('/perfil')}`}>Perfil</span>
        </Link>

        <Link href='/carrito' className='flex flex-col items-center gap-0.5 px-2 py-1 relative'>
          <div className='relative'>
            <svg xmlns='http://www.w3.org/2000/svg' className={`w-6 h-6 ${active('/carrito')}`} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' />
            </svg>
            {carritoCount > 0 && (
              <span className='absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none'>
                {carritoCount > 9 ? '9+' : carritoCount}
              </span>
            )}
          </div>
          <span className={`text-xs ${activeText('/carrito')}`}>Carrito</span>
        </Link>

        <button onClick={handleSalir} className='flex flex-col items-center gap-0.5 px-2 py-1'>
          <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
          </svg>
          <span className='text-xs text-gray-400'>Salir</span>
        </button>
      </nav>
    </>
  )
}