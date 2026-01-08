"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  settingSchema,
  settingSchemaType,
} from "@/lib/types/settingType";
import {
  addNewsetting,
  fetchSettings,
} from "@/app/(universal)/action/setting/dbOperations";

const Page = () => {
  const [settings, setSettings] = useState<settingSchemaType[]>([]);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await fetchSettings();
        setSettings(data);
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    }
    loadSettings();
  }, []);

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
    formData.append("name", data.name.trim());
    formData.append("value", data.value!);

    const result = await addNewsetting(formData);

    if (!result?.errors) {
      const updatedSettings = await fetchSettings();
      setSettings(updatedSettings);
      
      reset(); // Clear form
    } else {
      console.log("Errors:", result.errors);
    }
  }

  return (
    <form onSubmit={handleSubmit(onsubmit)}>
      <div className="flex flex-col gap-4 p-5">
        <h1 className="text-xl font-bold">Create or Update Settings</h1>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="label-style">
              Setting Name<span className="text-red-500">*</span>
            </label>
            <input
              {...register("name")}
              className="input-style"
              placeholder="e.g. Home page offer"
            />
            {errors.name?.message && (
              <span className="text-red-500 text-sm">{errors.name.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="label-style">
              Value<span className="text-red-500">*</span>
            </label>
            <input
              {...register("value")}
              className="input-style"
              placeholder="e.g. bei Abholung"
            />
            {errors.value?.message && (
              <span className="text-red-500 text-sm">{errors.value.message}</span>
            )}
          </div>

          <button className="form-btn-style" type="submit">
            Save
          </button>
        </div>

        {/* Table of settings */}
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Current Settings</h2>
          <table className="w-full text-sm border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">Setting</th>
                <th className="text-left px-4 py-2">Value</th>
                  <th className="text-left px-4 py-2">Key</th>
                 <th className="text-left px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(settings) &&
                settings.map((setting) => (
                  <tr key={setting.name} className="border-t">
                    <td className="px-4 py-2 capitalize">
                      {setting.name}
                    </td>
                    <td className="px-4 py-2">{String(setting.value)}</td>
                    <td className="px-4 py-2 text-gray-500">{setting.key}</td>
<td className="px-4 py-2">
  <a
    href={`/admin/setting/edit?key=${setting.key}`}
    className="text-blue-600 hover:underline"
  >
    Edit
  </a>
</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </form>
  );
};

export default Page;
