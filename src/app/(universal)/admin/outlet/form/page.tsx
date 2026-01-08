import Outlet from '@/components/admin/outlet/Outlet'
import React, { Suspense } from 'react'


export default function page() {
  return (
  <Suspense>
    <Outlet />
  </Suspense>
  )
}
