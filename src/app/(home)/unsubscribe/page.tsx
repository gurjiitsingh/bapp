import React, { Suspense } from 'react'
import UnsubscribePage from './components/UnsubscribePage'

export default function page() {
  return (
    <Suspense>
        <UnsubscribePage />
    </Suspense>
  )
}
