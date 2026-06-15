"use client";

import React, { useTransition } from "react";

import { Button } from "@/components/ui/button";

import { FiTrash2 } from "react-icons/fi";

import { deleteMasterCategory } from "@/app/(universal)/action/master-category/deleteMasterCategory";

import { useRouter } from "next/navigation";

const DeleteButton = ({
  id,
}: {
  id: string;
}) => {
  const router = useRouter();

  const [isPending, startTransition] =
    useTransition();

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this master category?"
    );

    if (!confirmed) return;

    startTransition(async () => {
      await deleteMasterCategory(id);

      router.refresh();
    });
  };

  return (
    <Button
      variant="destructive"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
    >
      <FiTrash2 />
    </Button>
  );
};

export default DeleteButton;