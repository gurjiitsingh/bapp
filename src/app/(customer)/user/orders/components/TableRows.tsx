import {
 // Table,
  // TableBody,
  TableCell,
 // TableHead,
 // TableHeader,
  TableRow,
//  TableCaption,
} from "@/components/ui/table";
import { TOrderMaster } from "@/lib/types/orderMasterType";

function TableRows({ order }:{order:TOrderMaster}){



//  async function handleDelete(order) {
//     //console.log(product);
//   const result = await deleteProduct(order.id, order.image)
// if(result.errors){
//   alert(result.errors)
// }else{
//   // router.push('/admin/products')
//    //   router.refresh()
//       location.reload()
// }

//   }

  return (
    <TableRow key={order.id} className="whitespace-nowrap bg-slate-50 rounded-lg p-1 my-1">
       <TableCell>{order.userId }---{ order.customerName}</TableCell>
      <TableCell>{order.time}</TableCell>
      <TableCell>completed</TableCell>
        <TableCell>$25</TableCell>
      <TableCell>masala-bs.de</TableCell>
     </TableRow>
  );
};

export default TableRows;
