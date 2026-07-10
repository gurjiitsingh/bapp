"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BatchDetails({ batch }: any) {
    return (
        <div className="  space-y-6">

            {/* HEADER */}
            <div className="flex justify-between">
                <div> 
                    <h1 className="text-2xl font-semibold text-gray-800">
                    Batch Details
                </h1>
                    <p className="text-sm text-gray-500">
                        {batch.id}
                    </p>
                </div>
                <Link href={`/admin/stock-finished/issue/batches/close/${batch.id}`}>
                    <Button className="btn-save-4">
                        Close Batch
                    </Button>
                </Link>
            </div>

            {/* INFO CARD */}
            <div className="bg-white border rounded-xl p-4 grid grid-cols-3 gap-4">

                <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{batch.departmentName}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-medium">
                        {new Date(batch.createdAt).toLocaleString()}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p
                        className={`font-medium ${batch.isClosed
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                    >
                        {batch.isClosed ? "Closed" : "Open"}
                    </p>
                </div>

                <div className="col-span-3">
                    <p className="text-sm text-gray-500">Note</p>
                    <p>{batch.note || "-"}</p>
                </div>
            </div>

            {/* ITEMS TABLE */}
            <div className="bg-white border rounded-xl overflow-hidden">

                <div className="grid grid-cols-5 bg-gray-100 px-4 py-3 text-sm font-medium text-gray-600">
                    <div>Item</div>
                    <div>Qty</div>
                    <div>Unit</div>
                    <div>Cost</div>
                    <div>Total</div>
                </div>

                {batch.items.map((item: any) => (
                    <div
                        key={item.id}
                        className="grid grid-cols-5 px-4 py-3 border-t"
                    >
                        <div className="font-medium text-gray-800">
                            {item.inventoryItemName}
                        </div>

                        <div>{item.quantity}</div>

                        <div>{item.unit}</div>

                        <div>₹ {item.costPerUnit.toFixed(2)}</div>

                        <div className="font-medium">
                            ₹ {item.totalCost.toFixed(2)}
                        </div>
                    </div>
                ))}

                {!batch.items.length && (
                    <div className="text-center py-6 text-gray-400">
                        No items found
                    </div>
                )}
            </div>

            {/* TOTAL */}
            <div className="text-right text-lg font-semibold">
                Total Cost: ₹{" "}
                {batch.items
                    .reduce((sum: number, i: any) => sum + i.totalCost, 0)
                    .toFixed(2)}
            </div>
        </div>
    );
}