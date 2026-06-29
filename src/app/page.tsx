import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className='min-h-screen flex flex-col items-center justify-center relative overflow-hidden'>
      <div className='absolute inset-0 bg-gradient-to-b from-green-700 to-green-900' />
      <div className='relative z-10 flex flex-col items-center gap-8 px-6 w-full max-w-sm'>
        <div className='text-center'>
          <h1 className='text-5xl font-bold text-white tracking-tight'>BIO<span className='text-red-400'>RED</span></h1>
          <p className='text-green-200 mt-2 text-sm'>Tu red de bienestar</p>
        </div>
        <div className='flex flex-col gap-4 w-full'>
          <Link href='/login' className='w-full'>
            <Button className='w-full bg-white text-green-800 hover:bg-green-50 font-semibold py-6 text-base rounded-2xl'>Ya tengo cuenta</Button>
          </Link>
          <Link href='/registro' className='w-full'>
            <Button className='w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-6 text-base rounded-2xl'>Se parte de nosotros</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}