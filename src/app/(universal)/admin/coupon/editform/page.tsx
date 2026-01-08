"use client";

import { Suspense } from "react";
import EditForm from "./componets/EditForm";

const Page = () => {
  
  return (
    <>
    <Suspense>
      <EditForm />
      </Suspense>
    </>
  );
};

export default Page;
