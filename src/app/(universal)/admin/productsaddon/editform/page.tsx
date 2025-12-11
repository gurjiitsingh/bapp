import React, { Suspense } from 'react'
import Form from './form'
export default function Page() {
  return (
    <Suspense>
      <Form />
    </Suspense>
  )
}
