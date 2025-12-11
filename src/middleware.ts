//import { request } from "http"
import { NextRequestWithAuth, withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(request:NextRequestWithAuth) {
    // console.log("this is login middleware -------------------",  request.nextauth.token)
    // console.log("this is login middleware role-------------------",  request.nextauth.token?.user?.role)

    if(request.nextUrl.pathname.startsWith("/admin/*")
     && request.nextauth.token?.user?.role !== "admin"){
      console.log("not admin")
   return NextResponse.rewrite(
     new URL("/", request.url)
   )}
   if(request.nextUrl.pathname.startsWith("/admin")
    && request.nextauth.token?.user?.role === "user"){
     console.log("not admin")
  return NextResponse.rewrite(
    new URL("/user", request.url)
  )}
  if(request.nextUrl.pathname.startsWith("/user")
    && request.nextauth.token?.user?.role === "user"){
     console.log("not admin")
  return NextResponse.rewrite(
    new URL("/user", request.url)
  )}
  if(request.nextUrl.pathname.startsWith("/user")
    // && request.nextauth.token?.user?.role !== "admin"
   && request.nextauth.token?.user?.role !== "user"){
    console.log("not user")
   return NextResponse.rewrite(
     new URL("/", request.url)
   )}
   if(request.nextUrl.pathname.startsWith("/user/address")
    // && request.nextauth.token?.user?.role !== "admin"
   && request.nextauth.token?.user?.role !== "user"){
    console.log("not user")
   return NextResponse.rewrite(
     new URL("/", request.url)
   )}
   if(request.nextUrl.pathname.startsWith("/user/*")
    // && request.nextauth.token?.user?.role !== "admin"
   && request.nextauth.token?.user?.role !== "user"){
    console.log("not user")
   return NextResponse.rewrite(
     new URL("/", request.url)
   )}

   if(request.nextUrl.pathname.startsWith("/user")
    // && request.nextauth.token?.user?.role !== "admin"
   && request.nextauth.token?.user?.role === "admin"){
    console.log("not user")
   return NextResponse.rewrite(
     new URL("/admin", request.url)
   )}
   
  //  if(request.nextauth.token?.user?.role === "admin") 
  // return NextResponse.rewrite(
  //   new URL("/admin", request.url)
  // )

  
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
)

export const config = { matcher: ["/admin", "/user","/admin/:path*","/user/:path*"] }


// export { default } from "next-auth/middleware"

// export const config = {
//      matcher: ["/dashboard(.*)"]
//      }



// import { useSession } from "next-auth/react";
// import { NextRequest, NextResponse }  from "next/server";

// export function middleware(req:NextRequest){
   
//     const {data: session } = useSession();


// console.log(req.url)
// return NextResponse.redirect(new URL('/auth/login',req.url ))

// }


// export const config = {

//     matcher: ['/dashboard', 'user']
// }