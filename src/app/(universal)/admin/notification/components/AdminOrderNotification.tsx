"use client";

import React, { useEffect, useRef } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import toast from "react-hot-toast";

export default function AdminOrderNotification() {
  const lastOrderTime = useRef<number>(Date.now());

  useEffect(() => {
    const q = query(
      collection(db, "orderMaster"), // your Firestore collection
      orderBy("time", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log("this works-------------------")
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          const orderTime = new Date(data.time).getTime();

          // Show notification only for new orders
          if (orderTime > lastOrderTime.current) {
            lastOrderTime.current = orderTime;
            toast.success(`New order #${data.srno} received!`);
          }
        }
      });
    });

    return () => unsubscribe();
  }, []);

  return null;
}
