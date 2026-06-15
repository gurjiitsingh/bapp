'use client'

import { Suspense } from 'react'
import ListView from './components/ListView'
import Link from "next/link"

export default function page(){
  return (
    <Suspense>
    <div className='h-screen flex flex-col '>
    
      <ListView />

    </div>
    </Suspense>
  )
}
