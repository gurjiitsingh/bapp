"use client";

import { getRegisteredCustomerAddresses } from "@/modules/customer-account";
import { useState } from "react";

export default function CustomerAddresses() {
  const [message, setMessage] = useState("");

  async function loadAddresses() {
    const result = await getRegisteredCustomerAddresses();

    if (!result.success) {
      setMessage(result.error);
      return;
    }

    setMessage(`Found ${result.data.length} saved addresses.`);
    console.log(result.data);
  }

  return (
    <div>
      <button onClick={loadAddresses}>
        Load my saved addresses
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}