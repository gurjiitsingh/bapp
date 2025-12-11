'use client'
import Link from 'next/link'
import { signOut } from "next-auth/react";//, useSession
import { MdSpaceDashboard } from "../../../../node_modules/react-icons/md";
import { FaUserTie } from "../../../../node_modules/react-icons/fa";
import { BsBorderStyle } from "../../../../node_modules/react-icons/bs";
import { usePathname } from 'next/navigation';
import { IoIosLogOut } from "../../../../node_modules/react-icons/io";
import { GoHome } from "react-icons/go";
//import { SiBrandfolder } from "../../../../node_modules/react-icons/si";
//import { TbCategoryPlus } from "../../../../node_modules/react-icons/tb";
//import { MdOutlineProductionQuantityLimits } from "../../../../node_modules/react-icons/md";
//import { Button } from '@/components/ui/button';

const Sidebar = () => {

  const menuList = [
    {
      name:"Home",
      link:"/",
      icon: <GoHome />
    },
    {
      name:"Dashboard",
      link:"/user",
      icon: <MdSpaceDashboard />
    },
    {
      name:"Orders",
      link:"/user/orders",
      icon:<BsBorderStyle />
    },
    {
      name:"Address",
      link:"/user/address",
      icon:<FaUserTie />
    },
    // {
    //   name:"Payment methods",
    //   link:"/admin/paymentMethods",
    //   icon: <GiStarsStack />
    // },
    // {
    //   name:"Account details",
    //   link:"/admin/account-details",
    //   icon: <IoLibrary />
    // }
    
  ]

  return (
    <div className='h-screen w-[290px] border-r flex flex-col py-4 px-8 items-center justify-start overflow-hidden'>
       <ul className='flex flex-col gap-2 overflow-y-auto'>
        {/* {
       menuList?.map((item)=>{return(
   <Tab key={item.name} item={item} />
      )})
        } */}
       </ul>
       <div className='flex flex-col items-center w-full'>
<button onClick={()=>signOut()} className='flex gap-2 items-center px-4 py-1 rounded-lg ease-soft translate-all duration-300 font-semibold text-[.9rem]'>
 Logout <IoIosLogOut />
  </button>



 

       </div>
        
        </div>
  )
}

type Titem = {
 
    name:string;
    link:string;
    icon:unknown;
 
}
// function Tab(item:Titem){
//  // const path = usePathname();
//   //const isSelected = path === item?.link;
// const isSelected = false;
//   // if(path === item?.link){
//   //   isSelected = true;
//   // }
// return <>  <Link href={item?.link}>
//   <li className={`flex gap-2 items-center px-4 py-1 rounded-lg ease-soft translate-all duration-300 font-semibold text-[.9rem] 
//       ${isSelected ? "bg-violet-300 text-white":"text-slate-700"}`}  >
//     {item?.icon}{item?.name}
//     </li>
//     </Link></>
// }

export default Sidebar