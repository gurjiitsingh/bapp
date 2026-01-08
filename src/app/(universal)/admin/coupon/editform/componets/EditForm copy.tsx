"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { couponSchema, TcouponSchema } from "@/lib/types/couponType";
import { db } from "@/lib/firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";

const EditForm = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const router = useRouter();

  const {
    register,
    formState: { errors },
    setValue,
    handleSubmit,
  } = useForm<TcouponSchema>({
    resolver: zodResolver(couponSchema),
  });

  useEffect(() => {
    async function prefill() {
      try {
        const docRef = doc(db, "coupon", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const couponData = docSnap.data();
          
          setValue("id", id);
          setValue("code", couponData.code || "");
          setValue("couponDesc", couponData.couponDesc || "");
          setValue("discount", couponData.discount?.toString() || "");
          setValue("minSpend", couponData.minSpend?.toString() || "");
          setValue("isFeatured", couponData.isFeatured || false);
          setValue("discountType", couponData.discountType || "percentage");
         const expiryDate = couponData.expiry;

// If using Firestore Timestamp:
if (expiryDate && typeof expiryDate.toDate === "function") {
  setValue("expiry", expiryDate.toDate().toISOString().split("T")[0]);
} else if (typeof expiryDate === "string") {
  // If it's already a string (e.g. ISO date string)
  setValue("expiry", expiryDate.split("T")[0]);
} else {
  // Fallback
  setValue("expiry", "");
}
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    }

    if (id) {
      prefill();
    }
  }, [id, setValue]);

  const onSubmit = async (data: TcouponSchema) => {
    try {
      const docRef = doc(db, "coupon", id);
      const updatedData = {
        code: data.code.toUpperCase(),
        couponDesc: data.couponDesc || "",
        discount: parseFloat(data.discount),
        minSpend: parseFloat(data.minSpend || "0"),
        isFeatured: data.isFeatured || false,
        discountType: data.discountType || "percentage",
        expiry: data.expiry ? Timestamp.fromDate(new Date(data.expiry)) : null,
        updatedAt: Timestamp.now(),
      };
      await updateDoc(docRef, updatedData);
      router.push("/admin/coupon");
    } catch (error) {
      console.error("Error updating document:", error);
      alert("Something went wrong while updating.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ... your form fields ... */}
      <Button type="submit" className="bg-red-500">Edit Coupon</Button>
    </form>
  );
};

export default EditForm;
