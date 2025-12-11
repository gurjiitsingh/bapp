import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
},
env: {
  //PAYPAL_CLIENT_ID:"AdcDFkGEb4Dsdmf41sWb3sf2MZQXv4GQ6UJvPJYCdv7lyK7mGwTnVhXxwNJrdNm53RMmlwyL4BWcg24H",//gs
  PAYPAL_CLIENT_ID:"BAAQambvfgf8cMiIWoROWluTo5X08lvESisQno-RXyWIK7Mk8JzNL7UNonzp8h5g5ZGjd8HTp2vBHD_4zk",//vijay
  //PAYPAL_MODE:"sandbox",
  //PAYPAL_CLIENT_ID:"AaE5j_iAGG8h6JeuW6y3khLvftR8OT2qDi2tqlhTaOeC4QxU3feFgMgF1RYMGe7LuYAtd7EyhQZpUhQz",//sandbox(this is client id in indiaan business)
  //PAYPAL_CLIENT_ID:"ASStgEC21rSgoRNm81lGkenzu8UOM69fFpuWk7X8Cmh_QT-UH7mnbbRuMnC_Wt6SrikHBPFvAt8a9MoB",// sandbox german
},
};

export default nextConfig;
