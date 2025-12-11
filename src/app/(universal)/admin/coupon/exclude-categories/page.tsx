import React, { Suspense } from 'react'
import ExcludeCategorySelector from '../components/ExcludeCategorySelector'

export default function Page() {
  return (
    <Suspense>
      <ExcludeCategorySelector />
    </Suspense>
  )
}
