"use client";

import { useRef } from "react";

export default function PrintOrderPage() {
  const orderRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // Sample order data
  const order = {
    orderId: "ORD12345",
    customerName: "John Doe",
    date: new Date().toLocaleDateString(),
    items: [
      { name: "Pizza Margherita", quantity: 2, price: 9.99 },
      { name: "Garlic Bread", quantity: 1, price: 4.5 },
      { name: "Coke", quantity: 3, price: 1.99 },
    ],
  };

  const total = order.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Order Invoice</h1>
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Print
          </button>
        </div>

        {/* Printable area */}
        <div ref={orderRef} className="text-gray-800">
          <div className="border-b pb-4 mb-4">
            <p>
              <span className="font-semibold">Order ID:</span> {order.orderId}
            </p>
            <p>
              <span className="font-semibold">Customer:</span>{" "}
              {order.customerName}
            </p>
            <p>
              <span className="font-semibold">Date:</span> {order.date}
            </p>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left border-b">
                <th className="p-2 border">Item</th>
                <th className="p-2 border text-center">Qty</th>
                <th className="p-2 border text-right">Price</th>
                <th className="p-2 border text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2 border">{item.name}</td>
                  <td className="p-2 border text-center">{item.quantity}</td>
                  <td className="p-2 border text-right">${item.price.toFixed(2)}</td>
                  <td className="p-2 border text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="p-2 border text-right" colSpan={3}>
                  Total
                </td>
                <td className="p-2 border text-right">${total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <p className="text-sm text-gray-500 mt-4">
            Thank you for your order!
          </p>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          button {
            display: none;
          }
          .shadow-lg,
          .bg-gray-100 {
            box-shadow: none !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
