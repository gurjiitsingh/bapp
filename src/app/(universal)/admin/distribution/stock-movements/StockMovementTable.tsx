"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StockMovementType } from "@/lib/types/distribution/StockMovementType";

 

type Props = {
  movements: StockMovementType[];
};

export default function StockMovementTable({
  movements,
}: Props) {

 
  return (
    <Card className="rounded-3xl  border-0 p-0   shadow-sm bg-white">
      <CardHeader className=" ">
        <CardTitle>
          Stock Movements
        </CardTitle>
      </CardHeader>

      <CardContent className="m-0 p-0 ">

        <div className="rounded-2xl overflow-hidden  ">

          <table className="w-full">

            <thead className="bg-zinc-200">

              <tr>
                <th className="p-3 text-left">
                  Date
                </th>
                <th className="p-3 text-left">
                 Info
                </th>

                <th className="p-3 text-left">
                  Product
                </th>

                <th className="p-3 text-center">
                  Qty
                </th>
  
                <th className="p-3 text-left">
                  From
                </th>

                <th className="p-3 text-left">
                  To
                </th>

                <th className="p-3 text-left">
                  Type
                </th>

                <th className="p-3 text-left">
                  User
                </th>

                <th className="p-3 text-left">
                  Remarks
                </th>

              </tr>

            </thead>

            <tbody>

              {movements.map((movement) => (

                <tr
                  key={movement.id}
                  className="
                  
                    odd:bg-zinc-50
                    even:bg-zinc-100
                    hover:bg-blue-50
                  "
                >

                  <td className="p-3 whitespace-nowrap">
                    {new Date(
                      movement.createdAt
                    ).toLocaleString()}
                  </td>
  <td className="p-3">
                  {movement.name}-{movement.locationCode}- {movement.responsiblePerson}
                  </td>
                  <td className="p-3">
                    {movement.productName}
                  </td>

                  <td className="text-center">
                    {movement.quantity}
                  </td>
                 

                  <td className="p-3">
                    {movement.fromLocationType}
                  </td>

                  <td className="p-3">
                    {movement.toLocationType}
                  </td>

                  <td className="p-3">
                    {movement.movementType}
                  </td>

                  <td className="p-3">
                    {movement.createdBy}
                  </td>

                  <td className="p-3">
                    {movement.remarks || "-"}
                  </td>

                </tr>

              ))}

              {movements.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-10"
                  >
                    No stock movements found.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </CardContent>

    </Card>
  );
}