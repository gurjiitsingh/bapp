 
import React, { Suspense } from 'react'
import Outlet from './Outlet'


export default function page() {
  return (
  <Suspense>
    <Outlet />
    
  </Suspense>
  )
}
