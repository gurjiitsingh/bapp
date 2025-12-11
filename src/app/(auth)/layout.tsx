//import { NextUIProvider } from '@nextui-org/react';
import "@/custom/globals.css";
const AuthLayout = ({children}:{children:React.ReactNode}) => {

  return (
    <html lang="de">
      {/* <body className={inter.className}> */}
      <body className="bg-gradient-to-r from-indigo-40 via-purple-40 to-pink-40">

      {/* <NextUIProvider> */}
    <div>{children}</div>
    {/* </NextUIProvider> */}

      </body>
   
  
    </html>
  )
}

export default AuthLayout


