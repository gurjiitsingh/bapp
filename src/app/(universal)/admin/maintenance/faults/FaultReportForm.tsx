"use client";

import {
  useRef,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useForm,
} from "react-hook-form";

 

import type {
  CreateFaultInput,
  FaultPriority,
} from "@/lib/maintenance/faultTypes";

import type {
  Machine,
} from "@/lib/maintenance/machineTypes";
 
import { addFaultPhoto } from "@/app/(universal)/action/maintenance/addFaultFoto";
import { addFault } from "@/app/(universal)/action/maintenance/addFault";

type FaultReportFormProps = {
  machines: Machine[];

  reportedBy: string;

  reportedByName?: string;
};

type FaultFormValues = {
  machineId: string;

  faultTitle: string;

  faultDescription: string;

  priority: FaultPriority;
};

type SelectedImage = {
  id: string;

  file: File;

  preview: string;
};

export default function FaultReportForm({
  machines,
  reportedBy,
  reportedByName,
}: FaultReportFormProps) {
  const router =
    useRouter();

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const cameraInputRef =
    useRef<HTMLInputElement>(null);

  const [
    selectedImages,
    setSelectedImages,
  ] = useState<SelectedImage[]>(
    []
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: {
      errors,
    },
  } =
    useForm<FaultFormValues>({
      defaultValues: {
        machineId: "",

        faultTitle: "",

        faultDescription: "",

        priority: "MEDIUM",
      },
    });

  const selectedMachineId =
    watch("machineId");

  const selectedMachine =
    machines.find(
      (machine) =>
        machine.id ===
        selectedMachineId
    );

  /**
   * =========================================================
   * ADD IMAGES
   * =========================================================
   */

  const addImages = (
    files: FileList | null
  ) => {
    if (!files) {
      return;
    }

    const newImages: SelectedImage[] =
      [];

    Array.from(files).forEach(
      (file) => {
        if (
          !file.type.startsWith(
            "image/"
          )
        ) {
          return;
        }

        /**
         * Limit individual image
         * to 10 MB.
         */

        if (
          file.size >
          10 * 1024 * 1024
        ) {
          setError(
            `${file.name} is larger than 10 MB.`
          );

          return;
        }

        newImages.push({
          id: crypto.randomUUID(),

          file,

          preview:
            URL.createObjectURL(
              file
            ),
        });
      }
    );

    if (
      newImages.length > 0
    ) {
      setSelectedImages(
        (current) => [
          ...current,
          ...newImages,
        ]
      );

      setError("");
    }
  };

  /**
   * =========================================================
   * REMOVE IMAGE
   * =========================================================
   */

  const removeImage = (
    id: string
  ) => {
    setSelectedImages(
      (current) => {
        const image =
          current.find(
            (item) =>
              item.id === id
          );

        if (image) {
          URL.revokeObjectURL(
            image.preview
          );
        }

        return current.filter(
          (item) =>
            item.id !== id
        );
      }
    );
  };

  /**
   * =========================================================
   * FILE TO BASE64
   * =========================================================
   */

  // const fileToBase64 = (
  //   file: File
  // ): Promise<string> => {
  //   return new Promise(
  //     (
  //       resolve,
  //       reject
  //     ) => {
  //       const reader =
  //         new FileReader();

  //       reader.onload = () => {
  //         resolve(
  //           reader.result as string
  //         );
  //       };

  //       reader.onerror =
  //         reject;

  //       reader.readAsDataURL(
  //         file
  //       );
  //     }
  //   );
  // };

  /**
   * =========================================================
   * SUBMIT
   * =========================================================
   */

  const onSubmit = async (
  values: FaultFormValues
) => {
  try {
    setLoading(true);
    setError("");
    setSuccess("");

    /**
     * =======================================================
     * MACHINE
     * =======================================================
     */

    const machine = machines.find(
      (item) =>
        item.id === values.machineId
    );

    if (!machine) {
      setError("Please select a machine.");
      return;
    }

    /**
     * =======================================================
     * CREATE FAULT
     * =======================================================
     */

    const input: CreateFaultInput = {
      machineId: machine.id,

      machineName:
        machine.machineName,

      machineCode:
        machine.machineCode,

      departmentId:
        machine.departmentId,

      departmentName:
        machine.departmentName,

      location:
        machine.location,

      faultTitle:
        values.faultTitle.trim(),

      faultDescription:
        values.faultDescription.trim(),

      priority:
        values.priority,

      reportedBy:
        reportedBy,

      reportedByName:
        reportedByName || "",
    };

    /**
     * =======================================================
     * CREATE FAULT RECORD
     * =======================================================
     */

    const result =
      await addFault(input);

    if (!result.success) {
      setError(result.message);
      return;
    }

    if (!result.faultId) {
      setError(
        "Fault was created but fault ID was not returned."
      );
      return;
    }

    /**
     * =======================================================
     * UPLOAD PHOTOS TO CLOUDINARY
     * =======================================================
     */

    let uploadedCount = 0;

    for (
      const selectedImage of selectedImages
    ) {
      const formData = new FormData();

      formData.append(
        "image",
        selectedImage.file
      );

      const photoResult =
        await addFaultPhoto(
          result.faultId,
          formData
        );

      if (!photoResult.success) {
        console.error(
          "Fault photo upload failed:",
          photoResult.message
        );

        continue;
      }

      uploadedCount++;
    }

    /**
     * =======================================================
     * SUCCESS MESSAGE
     * =======================================================
     */

    let successMessage =
      result.ticketNumber
        ? `Fault reported successfully. Ticket: ${result.ticketNumber}`
        : result.message;

    if (
      selectedImages.length > 0 &&
      uploadedCount <
        selectedImages.length
    ) {
      successMessage += ` ${uploadedCount} of ${selectedImages.length} photos uploaded.`;
    }

    setSuccess(successMessage);

    /**
     * =======================================================
     * CLEANUP PREVIEWS
     * =======================================================
     */

    selectedImages.forEach(
      (image) => {
        URL.revokeObjectURL(
          image.preview
        );
      }
    );

    setSelectedImages([]);

    /**
     * =======================================================
     * REDIRECT
     * =======================================================
     */

    setTimeout(() => {
      router.push(
        `/admin/maintenance/faults/${result.faultId}`
      );

      router.refresh();
    }, 1200);

  } catch (error) {
    console.error(
      "Fault report form error:",
      error
    );

    setError(
      "Something went wrong while reporting the fault."
    );
  } finally {
    setLoading(false);
  }
};

  // const onSubmit = async (
  //   values: FaultFormValues
  // ) => {
  //   try {
  //     setLoading(true);

  //     setError("");

  //     setSuccess("");

  //     /**
  //      * =======================================================
  //      * MACHINE
  //      * =======================================================
  //      */

  //     const machine =
  //       machines.find(
  //         (item) =>
  //           item.id ===
  //           values.machineId
  //       );

  //     if (!machine) {
  //       setError(
  //         "Please select a machine."
  //       );

  //       return;
  //     }

  //     /**
  //      * =======================================================
  //      * CONVERT IMAGES
  //      * =======================================================
  //      */

  //     const images:
  //       CreateFaultInput["images"] =
  //       [];

  //     for (
  //       const selectedImage of selectedImages
  //     ) {
  //       const base64 =
  //         await fileToBase64(
  //           selectedImage.file
  //         );

  //       images.push({
  //         fileName:
  //           selectedImage.file
  //             .name,

  //         data: base64,
  //       });
  //     }

  //     /**
  //      * =======================================================
  //      * CREATE INPUT
  //      * =======================================================
  //      */

  //     const input:
  //       CreateFaultInput = {
  //       machineId:
  //         machine.id,

  //       machineName:
  //         machine.machineName,

  //       machineCode:
  //         machine.machineCode,

  //       departmentId:
  //         machine.departmentId,

  //       departmentName:
  //         machine.departmentName,

  //       location:
  //         machine.location,

  //       faultTitle:
  //         values.faultTitle.trim(),

  //       faultDescription:
  //         values.faultDescription.trim(),

  //       priority:
  //         values.priority,

  //       reportedBy:
  //         reportedBy,

  //       reportedByName:
  //         reportedByName || "",

  //       images,
  //     };

  //     /**
  //      * =======================================================
  //      * SEND TO SERVER
  //      * =======================================================
  //      */

  //     const result =
  //       await addFault(input);

  //     if (!result.success) {
  //       setError(
  //         result.message
  //       );

  //       return;
  //     }

  //     /**
  //      * =======================================================
  //      * SUCCESS
  //      * =======================================================
  //      */

  //     setSuccess(
  //       result.ticketNumber
  //         ? `Fault reported successfully. Ticket: ${result.ticketNumber}`
  //         : result.message
  //     );

  //     /**
  //      * Cleanup previews
  //      */

  //     selectedImages.forEach(
  //       (image) => {
  //         URL.revokeObjectURL(
  //           image.preview
  //         );
  //       }
  //     );

  //     setSelectedImages([]);

  //     /**
  //      * Navigate after success.
  //      */

  //     setTimeout(() => {
  //       router.push(
  //         "/admin/maintenance/faults"
  //       );

  //       router.refresh();
  //     }, 1200);
  //   } catch (error) {
  //     console.error(
  //       "Fault report form error:",
  //       error
  //     );

  //     setError(
  //       "Something went wrong while reporting the fault."
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  /**
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit
      )}
      className="space-y-6 p-6"
    >
      {/* =====================================================
          MACHINE
      ====================================================== */}

      <div className="rounded-lg border bg-white">

        <div className="border-b p-4">

          <h2 className="text-lg font-semibold">
            Machine
          </h2>

          <p className="text-sm text-gray-500">
            Select the machine that has the fault.
          </p>

        </div>

        <div className="p-6">

          <label className="label-style-4">
            Machine *
          </label>

          <select
            {...register(
              "machineId",
              {
                required:
                  "Machine is required.",
              }
            )}
            className="input-style-4"
          >
            <option value="">
              Select Machine
            </option>

            {machines.map(
              (machine) => (
                <option
                  key={machine.id}
                  value={
                    machine.id
                  }
                >
                  {
                    machine.machineCode
                  }{" "}
                  -{" "}
                  {
                    machine.machineName
                  }
                </option>
              )
            )}
          </select>

          {errors.machineId && (
            <p className="mt-1 text-sm text-red-500">
              {
                errors.machineId
                  .message
              }
            </p>
          )}

          {selectedMachine && (
            <div className="mt-4 rounded-md bg-gray-50 p-4">

              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">

                <div>
                  <span className="text-gray-500">
                    Department
                  </span>

                  <p className="font-medium">
                    {
                      selectedMachine.departmentName ||
                      "-"
                    }
                  </p>
                </div>

                <div>
                  <span className="text-gray-500">
                    Location
                  </span>

                  <p className="font-medium">
                    {
                      selectedMachine.location ||
                      "-"
                    }
                  </p>
                </div>

                <div>
                  <span className="text-gray-500">
                    Current Status
                  </span>

                  <p className="font-medium">
                    {
                      selectedMachine.status
                    }
                  </p>
                </div>

              </div>

            </div>
          )}

          {machines.length ===
            0 && (
            <p className="mt-2 text-sm text-red-500">
              No machines are available.
              Please add a machine first.
            </p>
          )}

        </div>

      </div>

      {/* =====================================================
          FAULT INFORMATION
      ====================================================== */}

      <div className="rounded-lg border bg-white">

        <div className="border-b p-4">

          <h2 className="text-lg font-semibold">
            Fault Information
          </h2>

          <p className="text-sm text-gray-500">
            Describe what is wrong with the machine.
          </p>

        </div>

        <div className="space-y-5 p-6">

          {/* TITLE */}

          <div>

            <label className="label-style-4">
              Fault Title *
            </label>

            <input
              {...register(
                "faultTitle",
                {
                  required:
                    "Fault title is required.",
                }
              )}
              className="input-style-4"
              placeholder="Machine motor not starting"
            />

            {errors.faultTitle && (
              <p className="mt-1 text-sm text-red-500">
                {
                  errors
                    .faultTitle
                    .message
                }
              </p>
            )}

          </div>

          {/* DESCRIPTION */}

          <div>

            <label className="label-style-4">
              Fault Description *
            </label>

            <textarea
              {...register(
                "faultDescription",
                {
                  required:
                    "Fault description is required.",
                }
              )}
              rows={5}
              className="input-style-4 resize-none"
              placeholder="Describe what happened, unusual sound, error message, smoke, vibration, etc."
            />

            {errors.faultDescription && (
              <p className="mt-1 text-sm text-red-500">
                {
                  errors
                    .faultDescription
                    .message
                }
              </p>
            )}

          </div>

          {/* PRIORITY */}

          <div>

            <label className="label-style-4">
              Priority *
            </label>

            <select
              {...register(
                "priority"
              )}
              className="input-style-4"
            >
              <option value="LOW">
                Low
              </option>

              <option value="MEDIUM">
                Medium
              </option>

              <option value="HIGH">
                High
              </option>

              <option value="CRITICAL">
                Critical
              </option>
            </select>

          </div>

        </div>

      </div>

      {/* =====================================================
          PHOTOS
      ====================================================== */}

      <div className="rounded-lg border bg-white">

        <div className="border-b p-4">

          <h2 className="text-lg font-semibold">
            Fault Photos
          </h2>

          <p className="text-sm text-gray-500">
            Take photos of the machine fault or select images from the device.
          </p>

        </div>

        <div className="p-6">

          {/* HIDDEN CAMERA INPUT */}

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => {
              addImages(
                event.target.files
              );

              event.currentTarget.value =
                "";
            }}
          />

          {/* HIDDEN GALLERY INPUT */}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              addImages(
                event.target.files
              );

              event.currentTarget.value =
                "";
            }}
          />

          {/* BUTTONS */}

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                cameraInputRef.current?.click()
              }
              className="rounded-md border bg-white px-5 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              📷 Take Photo
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="rounded-md border bg-white px-5 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              🖼️ Choose Images
            </button>

          </div>

          {/* IMAGE PREVIEWS */}

          {selectedImages.length >
            0 && (

            <div className="mt-5">

              <p className="mb-3 text-sm font-medium">
                Selected Photos (
                {
                  selectedImages.length
                }
                )
              </p>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">

                {selectedImages.map(
                  (image) => (

                    <div
                      key={image.id}
                      className="relative overflow-hidden rounded-lg border bg-gray-50"
                    >

                      <img
                        src={
                          image.preview
                        }
                        alt={
                          image.file.name
                        }
                        className="h-40 w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(
                            image.id
                          )
                        }
                        disabled={
                          loading
                        }
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm text-white hover:bg-black disabled:opacity-50"
                        aria-label="Remove photo"
                      >
                        ×
                      </button>

                      <div className="truncate px-2 py-2 text-xs text-gray-600">
                        {
                          image.file.name
                        }
                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          )}

          {selectedImages.length ===
            0 && (

            <div className="mt-5 rounded-md border border-dashed p-8 text-center">

              <div className="text-3xl">
                📷
              </div>

              <p className="mt-2 text-sm font-medium">
                No photos selected
              </p>

              <p className="mt-1 text-xs text-gray-500">
                You can add one or more photos of the machine fault.
              </p>

            </div>

          )}

          <p className="mt-3 text-xs text-gray-500">
            Maximum 10 MB per image.
          </p>

        </div>

      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          SUCCESS
      ====================================================== */}

      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* =====================================================
          BUTTONS
      ====================================================== */}

      <div className="flex justify-end gap-3">

        <button
          type="button"
          disabled={loading}
          onClick={() =>
            router.push(
              "/admin/maintenance/faults"
            )
          }
          className="rounded-md border px-5 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            loading ||
            machines.length === 0
          }
          className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? selectedImages.length >
              0
              ? "Uploading & Reporting..."
              : "Reporting..."
            : "Report Fault"}
        </button>

      </div>

    </form>
  );
}