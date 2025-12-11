"use client";
import Link from "next/link";
//import Form from "./components/Form";
import EditForm from "./components/EditForm";
import { SessionProvider } from "next-auth/react"
//import ViewList from './components/ViewList';


export default  function page() {
  
 
  return (
    <><SessionProvider >
      <div className="flex flex-col  gap-4">
      <div className="flex gap-4 px-5 py-3 bg-slate-300 rounded-lg ">
      <Link href={"/user/address"} >Edit Address</Link>
        <Link href={"/user/address/newaddress"} >Create Address</Link>
        
        </div>

        <div className="w-full md:w-[100%] rounded-xl bg-white p-5">
     {/* {searchParams?.id?<EditForm />: <Form />}  */}
     
          
          
          <EditForm />
         
         
         
         
        </div>
        {/* <div className="w-full md:w-[60%] rounded-xl bg-white p-3"> */}

{/* <ShowAddress /> */}
          {/* <ViewList /> */}
       
        {/* </div> */}
      </div>
      </SessionProvider>
    </>
  );
}
