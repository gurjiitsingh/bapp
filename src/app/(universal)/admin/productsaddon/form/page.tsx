import React, { Suspense } from 'react'
import Form from './componets/Form'

export default function Page() {
  return (
    <Suspense>
      <Form />
    </Suspense>
  )
}
