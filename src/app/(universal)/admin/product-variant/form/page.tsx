import React, { Suspense } from 'react'
import NewProductVariant from './componets/NewProductVariant'


export default function page() {
  return (
  <Suspense>
    <NewProductVariant />
  </Suspense>
  )
}
