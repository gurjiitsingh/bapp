'use client'

 
import Title from "@/custom/cus-components/Title";
 


export default function Hero() {
  return (
   <>
     <div className="flex flex-col md:flex-row md:justify-between">
              <div>
               <Title />
                <div className="flex items-center gap-2 w-full">
                  {/* <SearchForm /> */}
                </div>
              </div>
              <div>
                 
              </div>
            </div>
   </>
  )
}
