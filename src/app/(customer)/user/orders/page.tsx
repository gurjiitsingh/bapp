'use client'
import ListView from './components/ListView'


export default function page(){
  return (
    <div className='h-screen flex flex-col '>
      <div className="flex justify-between">
      <h1>Your orders</h1>
      </div>

      <ListView />

    </div>
  )
}
