import AddressIN from "./AddressIN";
import AddressDE from "./AddressDE";
import AddressAll from "./AddressAll";
 

export default function AddressWrapper({ country }: { country: "IN" | "DE" | "ALL" }) {
   if (country === "ALL") return <AddressAll />;
  if (country === "IN") return <AddressIN />;
  return <AddressDE />;
}