//import AddressIN from "./AddressIN";
//import AddressDE from "./AddressDE";
import AddressES from "./AddressES";
//import AddressAll from "./AddressAll";
 

export default function AddressWrapper() {
    console.log("ties==================================")
    return <AddressES />;
}


// export default function AddressWrapper({ country }: { country: "IN" | "DE" | "ALL" }) {
//     return <AddressES />;
// }