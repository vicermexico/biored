'use client'
import { useRouter } from 'next/navigation'
export default function MasterNav({ titulo }: { titulo: string }) {
  const router = useRouter()
  return (
    <div className='bg-gray-900 px-6 pt-10 pb-6'>
      <button onClick={() => router.push('/master')} className='text-gray-300 text-sm mb-2 block'>← Panel Master</button>
      <h1 className='text-2xl font-bold text-white'>{titulo}</h1>
    </div>
  )
}