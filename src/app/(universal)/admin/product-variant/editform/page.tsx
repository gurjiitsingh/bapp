import React, { Suspense } from 'react'
import EditProduct from './componets/EditProduct'

export default function page() {
  return (
  <Suspense>
    <EditProduct />
  </Suspense>
  )
}
