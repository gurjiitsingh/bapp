'use server'

import { Suspense } from 'react'
import ListView from './components/ListView'
import Link from "next/link"
 import { fetchInventoryItems } from '@/app/(universal)/action/inventory/dbOperation';


export default async function page(){

  const inventoryItems = await fetchInventoryItems();

  console.log("cat------------------", inventoryItems)

  return (
     <Suspense>
    <div className='h-screen flex flex-col '>
      <div className="flex justify-between p-1">
     
      {/* <Link href='/admin/inventory/form'><button className="bg-[#313131] text-sm text-white px-4 py-2 rounded-lg">Create</button></Link> */}
      </div>
 
      <ListView 
      inventoryItems = { inventoryItems}
      />

    </div>
    </Suspense>
  )
}
