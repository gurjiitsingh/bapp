import StripeWrapper from '@/custom/stripe/StripeWrapper'
import React, { Suspense } from 'react'
//  import StripeWrapper from "@/custom/cus-components/stripe/StripeWrapper";

export default function page() {
  return (
    <div translate="no">
    <Suspense>
      <StripeWrapper />
    </Suspense>
    </div>
  )
}