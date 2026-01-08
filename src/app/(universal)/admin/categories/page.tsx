'use client'

import ListView from './components/ListView'
import Link from "next/link"

export default function page(){
  return (
    <div className='h-screen flex flex-col '>
      <div className="flex justify-start gap-3">
     
      <Link href='/admin/categories/form'><button className="bg-[#313131] text-sm text-white px-4 py-2 rounded-lg">Create</button></Link>
     <Link href='/admin/categories/display-category'><button className="bg-[#313131] text-sm text-white px-4 py-2 rounded-lg">Display catgory</button></Link>
      </div>

      <ListView />

    </div>
  )
}
