"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";

import {
  settingSchema,
  settingSchemaType,
} from "@/lib/types/settingType";

import {
  addNewsetting,
  fetchSettings,
  deleteSettingById,
} from "@/app/(universal)/action/setting/dbOperations";

const Page = () => {
  const [settings, setSettings] = useState<settingSchemaType[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await fetchSettings();
      setSettings(data);
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  }

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm<settingSchemaType>({
    resolver: zodResolver(settingSchema),
  });

  async function onsubmit(data: settingSchemaType) {
    if (!data.value!.trim()) return;

    const formData = new FormData();
    formData.append("name", data.name!.trim());
    formData.append("value", data.value!);

    const result = await addNewsetting(formData);

    if (!result?.errors) {
      await loadSettings();
      reset();
    } else {
      console.log("Errors:", result.errors);
    }
  }

  async function handleDelete(key: string) {
    const userInput = window.prompt(
      `⚠️ To confirm deletion, please type the doc ID exactly:\n\n"${key}"`
    );

    if (userInput !== key) {
      alert("❌ Document ID does not match. Deletion cancelled.");
      return;
    }

    try {
      await deleteSettingById(key);
      await loadSettings();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete setting.");
    }
  }

  return (
    <div className="flex flex-col">

      <div className="mb-6">
        <button
          type="button"
          onClick={() => router.push("/admin/setting/default")}
          className="form-btn-style bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ⚙️ Default Setting
        </button>
      </div>

      <form onSubmit={handleSubmit(onsubmit)} className="p-6">
        <h1 className="text-2xl font-bold mb-4">⚙️ Manage Settings</h1>

        {/* Form Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <label className="label-style">
              Setting Name<span className="text-red-500">*</span>
            </label>
            <input
              {...register("name")}
              className="input-style"
              placeholder="e.g. Home page offer"
            />
            {errors.name?.message && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="flex-1">
            <label className="label-style">
              Value<span className="text-red-500">*</span>
            </label>
            <input
              {...register("value")}
              className="input-style"
              placeholder="e.g. bei Abholung"
            />
            {errors.value?.message && (
              <p className="text-red-500 text-sm">{errors.value.message}</p>
            )}
          </div>

          <button className="form-btn-style self-end mt-2" type="submit">
            Save
          </button>
        </div>

        {/* Table Section */}
        <div className="rounded-2xl overflow-hidden bg-white dark:bg-zinc-900">
          <Table>
            <TableHeader className="bg-gray-100 dark:bg-zinc-800">
              <TableRow>
                <TableHead>Setting Name</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="hidden md:table-cell">Key (Doc ID)</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {Array.isArray(settings) &&
                settings
                  .filter((setting) => setting.name?.trim())
                  .map((setting) => (
                    <TableRow
                      key={setting.key}
                      className="whitespace-nowrap hover:bg-green-50 dark:hover:bg-zinc-800 transition rounded-xl"
                    >
                      <TableCell className="capitalize">{setting.name}</TableCell>
                      <TableCell>{String(setting.value)}</TableCell>
                      <TableCell className="hidden md:table-cell text-gray-500">
                        {setting.key}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/admin/setting/edit?key=${setting.key}`)
                          }
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(setting.key!)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </form>
    </div>
  );
};

export default Page;
