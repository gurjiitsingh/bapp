"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StockLocationType } from "@/lib/types/distribution/StockLocationType";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


type Props = {
  stockLocations: StockLocationType[];
  selectedLocation?: string;
};

export default function StockLocationView({
  stockLocations,
  selectedLocation,
}: Props) {
 return (
  <div className="space-y-6">

    {/* ===================================================== */}
    {/* FILTERS */}
    {/* ===================================================== */}

    <div className="flex flex-wrap gap-3">

      <Button
        asChild
        variant={!selectedLocation ? "default" : "outline"}
      >
        <Link href="/distribution/stock-location">
          All
        </Link>
      </Button>

      <Button
        asChild
        variant={selectedLocation === "FACTORY" ? "default" : "outline"}
      >
        <Link href="/distribution/stock-location?locationType=FACTORY">
          Store
        </Link>
      </Button>

      <Button
        asChild
        variant={selectedLocation === "TRUCK" ? "default" : "outline"}
      >
        <Link href="/distribution/stock-location?locationType=VAN">
          Van
        </Link>
      </Button>

      <Button
        asChild
        variant={selectedLocation === "WAREHOUSE" ? "default" : "outline"}
      >
        <Link href="/distribution/stock-location?locationType=WAREHOUSE">
          Warehouse
        </Link>
      </Button>

    </div>

    {/* ===================================================== */}
    {/* TABLE */}
    {/* ===================================================== */}

    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white">

      <Table>

        <TableHeader className="bg-zinc-200">

          <TableRow>

            <TableHead>
              Product
            </TableHead>

            <TableHead>
              Location
            </TableHead>

            <TableHead>
              Reference
            </TableHead>

            <TableHead className="text-right">
              Stock
            </TableHead>

          </TableRow>

        </TableHeader>

        <TableBody>

          {stockLocations.map((item) => (

            <TableRow
              key={item.id}
              className="
                whitespace-nowrap
                odd:bg-zinc-50
                even:bg-zinc-100
                hover:bg-blue-50
                border-b border-zinc-200
              "
            >

              <TableCell className="font-medium">
                {item.productName}
              </TableCell>

              <TableCell>

                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.locationType === "FACTORY"
                      ? "bg-green-100 text-green-700"
                      : item.locationType === "TRUCK"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {item.locationType}
                </span>

              </TableCell>

              <TableCell>
                {item.locationRef}
              </TableCell>

              <TableCell className="text-right font-semibold">
                {item.quantity}
              </TableCell>

            </TableRow>

          ))}

        </TableBody>

      </Table>

      {/* ===================================================== */}
      {/* PAGINATION (Dummy) */}
      {/* ===================================================== */}

      <div className="flex items-center justify-between p-4 border-t bg-white">

        <div className="text-sm text-gray-500">
          Page 1
        </div>

        <div className="flex gap-2">

          <Button
            variant="outline"
            disabled
          >
            <ChevronLeft
              size={16}
              className="mr-1"
            />
            Previous
          </Button>

          <Button
            variant="outline"
          >
            Next
            <ChevronRight
              size={16}
              className="ml-1"
            />
          </Button>

        </div>

      </div>

    </div>

  </div>
);
}