import React, { Suspense } from 'react'
import PageComp from './pagecomp'

export default function page() {
  return (
  <Suspense>
    <PageComp />
  </Suspense>
  )
}
