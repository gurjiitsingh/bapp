'use client'

import { Suspense } from 'react'
import ListView from './components/ListView'


export default function page(){
  return (
    <Suspense>
    <div className='h-screen flex flex-col '>
     

      <ListView />

    </div>
    </Suspense>
  )
}
