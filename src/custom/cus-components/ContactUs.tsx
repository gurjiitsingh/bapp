import React from "react";
import { FaMapMarkedAlt, FaPhoneAlt } from "react-icons/fa";

export default function ContactUs() {
  return (
    <div className="relative   py-26 px-2 md:p-0">
      <div className="flex flex-col max-w-7xl mx-auto gap-1 md:flex-row my-24 justify-between">
        {/* Address Section */}
        <div className="flex flex-col pb-12">
          <h1 className="text-[#333] text-[3rem]">Grill Hut Junction</h1>
          <div className="w-full  space-y-3 text-lg">
         
            
                      <FaMapMarkedAlt className="w-8 h-8  mb-4 text-[#2b2e4a]" />
                      <h3 className="uppercase text-sm tracking-wider font-semibold mb-2">Address</h3>
                      
                      <p className="text-sm">Grill Hut, Junction, </p>
                        <p className="text-sm">G. T. Road, Bhogpur, </p>
                        <p className="text-sm">Punjab 144201</p>
                    </div>
                    <div className="flex flex-col">
                              <FaPhoneAlt className="w-8 h-8  my-4 text-[#2b2e4a]" />
                              <h3 className="uppercase text-sm tracking-wider font-semibold mb-2">Phone</h3>
                              <p className="text-sm"> 098766 70094</p>
                            </div>
         
        </div>

        {/* Google Map Section */}
        <div className="google_map w-full md:w-[60%] ">
          {/* <iframe
            src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d2430.4102913899947!2d10.540868176678202!3d52.47170657204857!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNTLCsDI4JzE4LjEiTiAxMMKwMzInMzYuNCJF!5e0!3m2!1sen!2sin!4v1736146998436!5m2!1sen!2sin"
            width="100%"
            height="450"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe> */}



          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3399.5954504037104!2d75.6419124!3d31.562715299999994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391bab4400000001%3A0xc237a042f8c2d3e0!2sGrill%20Hut%20Junction!5e0!3m2!1sen!2sin!4v1763782009403!5m2!1sen!2sin" 
          width="100%" 
          height="450" 
          style={{ border: 0 }} 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
