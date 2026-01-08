import AddressIN from "./AddressIN";
import AddressDE from "./AddressDE";

export default function AddressWrapper({ country }: { country: "IN" | "DE" }) {
  if (country === "IN") return <AddressIN />;
  return <AddressDE />;
}