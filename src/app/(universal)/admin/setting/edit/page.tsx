import React, { Suspense } from 'react'
import EditSettingPage from './components/EditSettingPage'

export default function page() {
  return (
   <Suspense><EditSettingPage /></Suspense>
  )
}
