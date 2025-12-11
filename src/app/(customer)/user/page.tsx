'use client'
import React from 'react'
import { useSession } from "next-auth/react";


export default function Page() {
 // const { data: session } = useSession();//, status
  
 // const [session] = useSession();

 // useEffect(() => {}, [session]);

   // console.log("--------- value ----------",session?.user?.id)
  return (
    <div>Here in your dashboard you can view your recent orders, manage your shipping and billing addresses, and edit your password and account details.</div>
  )
}
