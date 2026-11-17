"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Search, Truck } from "lucide-react";




import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WholeCustomerType } from "@/lib/types/WholeSaleCustomerType";

import { bulkSale } from "@/app/(universal)/action/distribution/sale/bulkSale/bulkSale";
import { ProductStock, ProductStockType } from "@/lib/types/productStockType";
import { bulkSale_direct } from "@/app/(universal)/action/distribution/sale/bulkSale/bulkSale_direct";

type BulkSaleType = {
  wholeSaleCutomerId?: string;
  wholeSaleCutomerName?: string;

  remarks?: string;
  createdBy?: string;

  paymentStatus: "PAID" | "PARTIAL";

  totalAmount: number;
  paidAmount: number;
  dueAmount: number;

  items: {
    productId: string;
    quantity: number;
    wholesalePrice: number;
  }[];
};

type Props = {
  productStock: ProductStockType[];
  customers: WholeCustomerType[];
};

export default function BulkSaleForm({
  productStock,
  customers,
}: Props) {

  const [customerSearch, setCustomerSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Product stock shown on screen
  const [products, setProducts] =
    useState<ProductStockType[]>(productStock);

  const form = useForm<BulkSaleType>({
    defaultValues: {
      remarks: "",
      paymentStatus: "PAID",
      totalAmount: 0,
      paidAmount: 0,
      dueAmount: 0,

      items: productStock.map((p) => ({
        productId: p.id,
        quantity: 0,
        wholesalePrice: p.wholesalePrice ?? p.sellingPrice,
      })),
    },
  });

  const customerId = form.watch("wholeSaleCutomerId");

  const paymentStatus = form.watch("paymentStatus");
  const paidAmount = form.watch("paidAmount") || 0;

  const totalAmount = form
    .watch("items")
    .reduce(
      (sum, item) =>
        sum + item.quantity * item.wholesalePrice,
      0
    );

  const dueAmount = Math.max(
    totalAmount - paidAmount,
    0
  );

  useEffect(() => {
    form.setValue("totalAmount", totalAmount);
    form.setValue("dueAmount", dueAmount);
  }, [totalAmount, dueAmount]);

  useEffect(() => {
    if (paymentStatus === "PAID") {
      form.setValue("paidAmount", totalAmount);
      form.setValue("dueAmount", 0);
    }
  }, [paymentStatus, totalAmount]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;

    return customers.filter((customer) =>
      customer.companyName
        ?.toLowerCase()
        .includes(customerSearch.toLowerCase())
    );
  }, [customerSearch, customers]);

  const selectedCustomer = useMemo(
    () =>
      customers.find((c) => c.id === customerId) ??
      null,
    [customerId, customers]
  );



  // Products displayed in table
  const rows = products;


  const onSubmit = async (data: BulkSaleType) => {
    const items = data.items.filter(
      (x) => x.quantity > 0
    );

    if (
      !data.wholeSaleCutomerId ||
      !data.wholeSaleCutomerName
    ) {
      toast.error("Please select a wholesale customer.");
      return;
    }

    if (!items.length) {
      toast.error("Please enter at least one quantity.");
      return;
    }

    if (data.paidAmount > data.totalAmount) {
      toast.error("Paid amount cannot be greater than total amount.");
      return;
    }

    const result = await bulkSale_direct({
      wholeSaleCutomerId: data.wholeSaleCutomerId,
      wholeSaleCutomerName: data.wholeSaleCutomerName,

      totalAmount: Number(data.totalAmount),
      paidAmount: Number(data.paidAmount),
      dueAmount: Number(data.dueAmount),

      paymentStatus: data.paymentStatus,

      remarks: data.remarks,

      items,
    });

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    // Update local MAIN stock
    const updatedProducts = products.map((product) => {
      const sold = items.find(
        (i) => i.productId === product.id
      );

      if (!sold) return product;

      return {
        ...product,
        currentStock: product.currentStock - sold.quantity,
      };
    });

    setProducts(updatedProducts);

    toast.success(result.message);

    form.reset({
      wholeSaleCutomerId: "",
      wholeSaleCutomerName: "",

      remarks: "",

      paymentStatus: "PAID",

      totalAmount: 0,
      paidAmount: 0,
      dueAmount: 0,

      items: updatedProducts.map((p) => ({
        productId: p.id,
        quantity: 0,
        wholesalePrice:
          p.wholesalePrice ?? p.sellingPrice,
      })),
    });

    setCustomerSearch("");
  };


  const totalStock = useMemo(() => {
    return products.reduce(
      (sum, item) => sum + item.currentStock,
      0
    );
  }, [products]);


  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6 w-full">


        <div className="w-full ">

          {/* ================= Vehicle Info ================= */}

          <Card className="rounded-3xl border border-gray-100 shadow-sm bg-white">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Bulk Sale To customer
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">



                <div className="bg-white">

                  <div className="flex   justify-between">
                    <div className="flex items-center justify-between mb-1">
                      {customerId && selectedCustomer && (
                        <div className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                          {selectedCustomer.companyName}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SEARCH */}

                  <div className="relative">

                    <Search
                      size={18}
                      className="absolute right-2 top-3 text-gray-400"
                    />

                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) =>
                        setCustomerSearch(e.target.value)
                      }
                      placeholder="Search customer..."
                      className="input-style-4 pl-10"
                    />

                  </div>

                  {/* CUSTOMER LIST */}

                  <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-gray-200">

                    {filteredCustomers.length > 0 ? (

                      filteredCustomers.map((customer) => (

                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => {
                            form.setValue(
                              "wholeSaleCutomerId",
                              customer.id
                            );

                            form.setValue(
                              "wholeSaleCutomerName",
                              customer.companyName
                            );

                            setCustomerSearch(customer.companyName);

                            setShowDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-slate-50 transition ${selectedCustomer?.id === customer.id
                            ? "bg-blue-50"
                            : ""
                            }`}
                        >
                          <div className="font-medium text-sm text-gray-800">
                            {customer.companyName}
                          </div>

                          <div className="text-xs text-gray-500">
                            {customer.phone || "No phone"}
                          </div>

                        </button>

                      ))

                    ) : (

                      <div className="p-4 text-sm text-gray-400 text-center">
                        No customer found
                      </div>

                    )}

                  </div>

                </div>


                {/* TOTAL AMOUNT */}

                <div className="flex flex-col gap-2">

                  <label className="label-style-4">
                    Total Amount
                  </label>

                  <Input
                    value={totalAmount.toFixed(2)}
                    readOnly
                    className="input-style-4 bg-gray-100"
                  />

                </div>


                {/* PAYMENT STATUS */}

                <div className="flex flex-col gap-2">

                  <label className="label-style-4">
                    Payment
                  </label>


                  <select
                    {...form.register("paymentStatus")}
                    className="input-style-4"
                  >

                    <option value="PAID">
                      Full Paid
                    </option>


                    <option value="PARTIAL">
                      Partial Payment
                    </option>


                  </select>

                </div>



                {/* PAID AMOUNT */}

                <div className="flex flex-col gap-2">

                  <label className="label-style-4">
                    Paid Amount
                  </label>


                  <Input
                    type="number"
                    step="0.01"
                    disabled={
                      paymentStatus === "PAID"
                    }
                    {...form.register(
                      "paidAmount",
                      {
                        valueAsNumber: true
                      }
                    )}
                    className="input-style-4"
                  />

                </div>



                {/* DUE AMOUNT */}

                <div className="flex flex-col gap-2">

                  <label className="label-style-4">
                    Due Amount
                  </label>


                  <Input
                    value={dueAmount.toFixed(2)}
                    readOnly
                    className="input-style-4 bg-gray-100"
                  />

                </div>


              </div>

              {/* ===================================================== */}
              {/* CUSTOMER */}
              {/* ===================================================== */}

            </CardContent>
          </Card>

          {/* ================= Products ================= */}

       

           <div className="rounded-3xl border border-gray-100 mt-1 shadow-sm bg-white">

              <div className="rounded-2xl overflow-hidden  ">

                <table className="w-full">

                  <thead className="bg-zinc-200">
                    <tr>
                      <th className="text-left p-3">
                        Item Name
                      </th>

                      <th className="text-center p-3">
                        Current Stock
                      </th>

                      <th className="text-center p-3">
                        Default Price
                      </th>

                      <th className="text-center p-3">
                        Sale Price
                      </th>

                      <th className="text-center p-3">
                        Sale Qty
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {rows.map((item, index) => {

                      const wholesalePrice =
                        form.watch(`items.${index}.wholesalePrice`);
                      const qty =
                        form.watch(`items.${index}.quantity`) || 0;

                      return (
                        <tr
                          key={item.id}
                          className={`
        ${qty > 0
                              ? "bg-green-50"
                              : index % 2 === 0
                                ? "bg-zinc-50"
                                : "bg-zinc-100"
                            }
        hover:bg-blue-50
      `}
                        >
                          <td className="p-3 font-medium">
                            {item.name}
                          </td>

                          <td className="text-center font-semibold">
                            {item.currentStock}
                          </td>

                          <td className="text-center p-3">
                            ₹{item.wholesalePrice ?? item.sellingPrice}
                          </td>

                          <td className="p-2 w-36">
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              value={wholesalePrice ?? 0}
                              onChange={(e) =>
                                form.setValue(
                                  `items.${index}.wholesalePrice`,
                                  Number(e.target.value)
                                )
                              }
                            />
                          </td>

                          <td className="p-2">
                            <Input
                              type="number"
                              min={0}
                              max={item.currentStock}
                              {...form.register(`items.${index}.quantity`, {
                                valueAsNumber: true,
                                setValueAs: (value) =>
                                  value === "" || value == null
                                    ? 0
                                    : Number(value),
                              })}
                              onFocus={(e) => {
                                if (e.target.value === "0") {
                                  e.target.value = "";
                                }
                              }}
                              onBlur={(e) => {
                                if (e.target.value === "") {
                                  form.setValue(
                                    `items.${index}.quantity`,
                                    0,
                                    { shouldDirty: true }
                                  );
                                }
                              }}
                            />
                          </td>
                          {/* <td className="text-center font-semibold text-green-700">
                            {item.quantity - qty}
                          </td> */}
                        </tr>
                      )
                    })}

                    {rows.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-10 text-center text-gray-500"
                        >
                          No products available.
                        </td>
                      </tr>
                    )}

                  </tbody>

                </table>

              </div>

            </div>

         

          {/* ================= Summary ================= */}

        
            <div className="">

              <div className="flex justify-between items-center">

                <div className="space-y-1">

                  <p>
                    Total Products :
                    <strong> {rows.length}</strong>
                  </p>

                  <p>
                    Total Stock :
                    <strong>{totalStock}</strong>
                  </p>

                </div>

                <Button type="submit" size="lg">
                  {/* <Truck className="mr-2 h-5 w-5" /> */}
                  Record Sale
                </Button>

              </div>

            </div>

     

        </div>
      </div>
    </form>
  );
} 