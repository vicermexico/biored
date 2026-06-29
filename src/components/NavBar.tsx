'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavBar() {
  const path = usePathname()
  return (
    <nav className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-2 px-4'>
      <Link href='/dashboard' className='flex flex-col items-center gap-1 px-3 py-1'>
        <svg xmlns='http://www.w3.org/2000/svg' className={`w-6 h-6 ${path === '/dashboard' ? 'text-green-700' : 'text-gray-400'}`} fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' /></svg>
        <span className={`text-xs ${path === '/dashboard' ? 'text-green-700 font-medium' : 'text-gray-400'}`}>Inicio</span>
      </Link>
      <Link href='/pedidos' className='flex flex-col items-center gap-1 px-3 py-1'>
        <svg xmlns='http://www.w3.org/2000/svg' className={`w-6 h-6 ${path === '/pedidos' ? 'text-green-700' : 'text-gray-400'}`} fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' /></svg>
        <span className={`text-xs ${path === '/pedidos' ? 'text-green-700 font-medium' : 'text-gray-400'}`}>Pedidos</span>
      </Link>
      <Link href='/red' className='flex flex-col items-center gap-1 px-3 py-1'>
        <svg xmlns='http://www.w3.org/2000/svg' className={`w-6 h-6 ${path === '/red' ? 'text-green-700' : 'text-gray-400'}`} fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' /></svg>
        <span className={`text-xs ${path === '/red' ? 'text-green-700 font-medium' : 'text-gray-400'}`}>Mi Red</span>
      </Link>
      <Link href='/perfil' className='flex flex-col items-center gap-1 px-3 py-1'>
        <svg xmlns='http://www.w3.org/2000/svg' className={`w-6 h-6 ${path === '/perfil' ? 'text-green-700' : 'text-gray-400'}`} fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' /></svg>
        <span className={`text-xs ${path === '/perfil' ? 'text-green-700 font-medium' : 'text-gray-400'}`}>Perfil</span>
      </Link>
    </nav>
  )
}