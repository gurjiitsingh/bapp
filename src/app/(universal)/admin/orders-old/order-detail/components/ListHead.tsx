import React from 'react'

export default function ListHead() {
  return (
    <div>
                {/* start of head */}
                <div className="flex flex-row gap-2 bg-slate-100 justify-between border-b mt-2 rounded-xl">
          <div className="w-[20%]">
            <div className="w-[100px]">
           
            </div>
          </div>
          <div className="w-full flex flex-col justify-between gap-2 p-2 ">
            <div className="flex flex-row gap-3  items-start ">
              <div className="text-sm w-[40%] flex items-start ">Name</div>

              <div className="flex gap-2 w-[60%]">
                <div className="text-[1rem] w-[33%] flex items-start justify-end ">
                  Price
                </div>
                <div className="text-[1rem] w-[33%] flex items-start justify-end ">
                  Quantity
                </div>
                <div className="text-[1rem] w-[33%] flex items-start justify-end">
                  Total
                </div>
              </div>
            </div>

          </div>
        </div>
         {/* end of head */}


    </div>
  )
}
