"use client";

import React, {
  useEffect,
  useRef,
  useState,
} from "react";
 
import imageCompression from "browser-image-compression";

import {
  GripVertical,
  ImagePlus,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import { createCarousel, deleteCarousel, fetchCarousels, updateCarousel, updateCarouselOrder, uploadCarouselImage } from "@/app/(universal)/action/carousel/carousel";
import toast from "react-hot-toast";

// ============================================================
// SERVER ACTIONS
// ============================================================

 

// ============================================================
// TYPES
// ============================================================

export type CarouselType = {
  id: string;
  image: string;
  title: string;
  description: string;
  link: string;
  sortOrder: number;
  active: boolean;
};

type CarouselImagesFormProps = {
  maxImages?: number;
};

// ============================================================
// HELPERS
// ============================================================

function createImageId() {
  return crypto.randomUUID();
}

function normaliseCarousels(
  carousels: CarouselType[]
): CarouselType[] {
  return [...carousels].map(
    (carousel, index) => ({
      ...carousel,
      sortOrder: index + 1,
    })
  );
}

// ============================================================
// COMPONENT
// ============================================================

export default function CarouselImagesForm({
  maxImages = 10,
}: CarouselImagesFormProps) {
  // ==========================================================
  // CAROUSELS
  // ==========================================================

  const [
    images,
    setImages,
  ] = useState<CarouselType[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    draggedIndex,
    setDraggedIndex,
  ] = useState<number | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  // ==========================================================
  // LOAD CAROUSELS
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    async function loadCarousels() {
      try {
        setLoading(true);

        const loaded =
          await fetchCarousels();

        if (cancelled) {
          return;
        }

        setImages(
          normaliseCarousels(
            loaded ?? []
          )
        );
      } catch (error) {
        console.error(
          "CAROUSEL_LOAD_ERROR",
          error
        );

        if (!cancelled) {
          alert(
            "Failed to load carousel images."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCarousels();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================================
  // UPLOAD ONE IMAGE
  // ==========================================================

  async function uploadImage(
    file: File,
    imageNumber: number
  ) {
    const imageId =
      createImageId();

    // ========================================================
    // COMPRESS / RESIZE
    // ========================================================

    const compressedFile =
      await imageCompression(
        file,
        {
          maxWidthOrHeight: 1200,
          maxSizeMB: 0.5,
          initialQuality: 0.85,
          useWebWorker: true,
        }
      );

    // ========================================================
    // FORM DATA
    // ========================================================

    const formData =
      new FormData();

    formData.append(
      "file",
      file,
      `${imageId}.jpg`
    );

    // ========================================================
    // UPLOAD TO CLOUDINARY
    // ========================================================

    const result =
      await uploadCarouselImage(
        formData
      );

 
if (!result.success) {
  throw new Error(
    result.error ||
      "Image upload failed."
  );
}

if (!result.url) {
  throw new Error(
    "Image upload did not return a URL."
  );
}

const newCarousel: CarouselType = {
  id: imageId,
  image: result.url,
  title: `Slide ${imageNumber}`,
  description: "",
  link: "",
  sortOrder: images.length + 1,
  active: true,
};
 

 


    // ========================================================
    // SAVE CAROUSEL DOCUMENT
    // ========================================================

    const saveResult =
      await createCarousel(
        newCarousel
      );

    if (
      !saveResult ||
      !saveResult.success
    ) {
      throw new Error(
        saveResult?.error ||
          "Could not save carousel."
      );
    }

    // ========================================================
    // ADD TO LOCAL GALLERY
    // ========================================================

    setImages((current) =>
      normaliseCarousels([
        ...current,
        {
          ...newCarousel,
          id:
            saveResult.id ||
            newCarousel.id,
        },
      ])
    );
  }

  // ==========================================================
  // ADD FILES
  // ==========================================================

  async function handleFiles(
    files: FileList | File[]
  ) {
    const selectedFiles =
      Array.from(files);

    if (
      selectedFiles.length === 0
    ) {
      return;
    }

    const availableSlots =
      maxImages - images.length;

    if (availableSlots <= 0) {
      alert(
        `Maximum ${maxImages} carousel images allowed.`
      );
      return;
    }

    // ========================================================
    // ONLY IMAGE FILES
    // ========================================================

    const validFiles =
      selectedFiles.filter(
        (file) =>
          file.type.startsWith(
            "image/"
          )
      );

    if (
      validFiles.length === 0
    ) {
      alert(
        "Please select valid image files."
      );
      return;
    }

    // ========================================================
    // LIMIT FILES
    // ========================================================

    const filesToUpload =
      validFiles.slice(
        0,
        availableSlots
      );

    if (
      validFiles.length >
      availableSlots
    ) {
      alert(
        `Only ${availableSlots} more image${
          availableSlots === 1
            ? ""
            : "s"
        } can be added.`
      );
    }

    // ========================================================
    // UPLOAD
    // ========================================================

    setUploading(true);

    try {
      for (
        let index = 0;
        index < filesToUpload.length;
        index++
      ) {
        const file =
          filesToUpload[index];

        if (!file) {
          continue;
        }

        await uploadImage(
          file,
          images.length + index + 1
        );
      }
    } catch (error) {
      console.error(
        "CAROUSEL_IMAGE_UPLOAD_ERROR",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to upload carousel image."
      );
    } finally {
      setUploading(false);
    }
  }

  // ==========================================================
  // FILE INPUT
  // ==========================================================

  function handleFileInputChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files =
      event.target.files;

    if (!files) {
      return;
    }

    void handleFiles(files);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  }

  // ==========================================================
  // REMOVE CAROUSEL
  // ==========================================================

  async function handleRemoveImage(
    index: number
  ) {
    const carousel =
      images[index];

    if (!carousel) {
      return;
    }

    const confirmed =
      window.confirm(
        `Remove "${
          carousel.title ||
          "this carousel"
        }"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      const result =
        await deleteCarousel(
          carousel.id
        );

      if (
        !result ||
        !result.success
      ) {
        throw new Error(
          result?.error ||
            "Could not delete carousel."
        );
      }

      // ======================================================
      // REMOVE LOCAL
      // ======================================================

      setImages((current) =>
        normaliseCarousels(
          current.filter(
            (_, itemIndex) =>
              itemIndex !== index
          )
        )
      );
    } catch (error) {
      console.error(
        "CAROUSEL_DELETE_ERROR",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to remove carousel."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================================
  // DRAG START
  // ==========================================================

  function handleDragStart(
    index: number
  ) {
    setDraggedIndex(index);
  }

  // ==========================================================
  // DRAG OVER
  // ==========================================================

  function handleDragOver(
    event: React.DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
  }

  // ==========================================================
  // DROP
  // ==========================================================

  function handleDrop(
    event: React.DragEvent<HTMLDivElement>,
    dropIndex: number
  ) {
    event.preventDefault();

    if (
      draggedIndex === null ||
      draggedIndex === dropIndex
    ) {
      setDraggedIndex(null);
      return;
    }

    setImages((current) => {
      const next = [
        ...current,
      ];

      const [
        moved,
      ] = next.splice(
        draggedIndex,
        1
      );

      if (!moved) {
        return current;
      }

      next.splice(
        dropIndex,
        0,
        moved
      );

      return normaliseCarousels(
        next
      );
    });

    setDraggedIndex(null);
  }

  // ==========================================================
  // DRAG END
  // ==========================================================

  function handleDragEnd() {
    setDraggedIndex(null);
  }

  // ==========================================================
  // UPDATE LOCAL FIELD
  // ==========================================================

  function updateField(
    index: number,
    field:
      | "title"
      | "description"
      | "link"
      | "active",
    value: string | boolean
  ) {
    setImages((current) =>
      current.map(
        (
          carousel,
          itemIndex
        ) =>
          itemIndex === index
            ? {
                ...carousel,
                [field]: value,
              }
            : carousel
      )
    );
  }

  // ==========================================================
  // SAVE
  // ==========================================================

  async function handleSave() {
    try {
      setSaving(true);

      const finalImages =
        normaliseCarousels(
          images
        );

      // ======================================================
      // SAVE EACH CAROUSEL
      // ======================================================

      for (
        const carousel of finalImages
      ) {
        const result =
          await updateCarousel(
            carousel.id,
            carousel
          );

        if (
          !result ||
          !result.success
        ) {
          throw new Error(
            result?.error ||
              `Could not save carousel "${carousel.title}".`
          );
        }
      }

      // ======================================================
      // SAVE ORDER
      // ======================================================

      await updateCarouselOrder(
        finalImages.map(
          (carousel) => ({
            id: carousel.id,
            sortOrder:
              carousel.sortOrder,
          })
        )
      );

      setImages(
        finalImages
      );

    toast.success("Carousel saved successfully");
    } catch (error) {
      console.error(
        "CAROUSEL_SAVE_ERROR",
        error
      );
      toast.error("Something went wrong");

      // alert(
      //   error instanceof Error
      //     ? error.message
      //     : "Failed to save carousel images."
      // );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================================
  // MAIN FORM
  // ==========================================================

  return (
    <div className="w-full">

      <div
        className="
          flex
          min-h-[600px]
          w-full
          flex-col
          overflow-hidden
          rounded-xl
          border
          bg-white
          shadow-sm
        "
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex items-center justify-between border-b px-5 py-4">

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Carousel Images
            </h2>

            <p className="mt-0.5 text-sm text-gray-500">
              Manage homepage carousel slides
            </p>
          </div>

        </div>

        {/* ==================================================
            BODY
        ================================================== */}

        <div className="flex-1 overflow-y-auto p-5">

          {loading ? (
            <div className="flex min-h-[250px] items-center justify-center">

              <Loader2 className="h-7 w-7 animate-spin text-gray-500" />

            </div>
          ) : (
            <>

              {/* ============================================
                  IMAGE COUNT + ADD BUTTON
              ============================================ */}

              <div className="mb-4 flex items-center justify-between">

                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Carousel Slides
                  </p>

                  <p className="text-xs text-gray-500">
                    {images.length} /{" "}
                    {maxImages} slides
                  </p>
                </div>

                <button
                  type="button"
                  disabled={
                    uploading ||
                    saving ||
                    images.length >=
                      maxImages
                  }
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-md
                    bg-rose-500
                    px-4
                    py-2
                    text-sm
                    font-medium
                    text-white
                    shadow-sm
                    transition
                    hover:bg-rose-600
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-4 w-4" />
                      Add Slide
                    </>
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={
                    handleFileInputChange
                  }
                />

              </div>

              {/* ============================================
                  EMPTY STATE
              ============================================ */}

              {images.length === 0 && (
                <button
                  type="button"
                  disabled={
                    uploading ||
                    saving
                  }
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="
                    flex
                    min-h-[280px]
                    w-full
                    flex-col
                    items-center
                    justify-center
                    rounded-xl
                    border-2
                    border-dashed
                    border-gray-300
                    bg-gray-50
                    transition
                    hover:border-rose-400
                    hover:bg-rose-50
                  "
                >
                  <ImagePlus className="mb-3 h-10 w-10 text-gray-400" />

                  <p className="text-sm font-medium text-gray-700">
                    Add carousel images
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Upload up to{" "}
                    {maxImages} slides
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Images will be resized before upload
                  </p>
                </button>
              )}

              {/* ============================================
                  CAROUSEL GRID
              ============================================ */}

              {images.length > 0 && (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  {images.map(
                    (
                      carousel,
                      index
                    ) => (
                      <div
                        key={carousel.id}
                        draggable
                        onDragStart={() =>
                          handleDragStart(
                            index
                          )
                        }
                        onDragOver={
                          handleDragOver
                        }
                        onDrop={(event) =>
                          handleDrop(
                            event,
                            index
                          )
                        }
                        onDragEnd={
                          handleDragEnd
                        }
                        className={`
                          overflow-hidden
                          rounded-xl
                          border
                          bg-white
                          shadow-sm
                          transition
                          ${
                            draggedIndex ===
                            index
                              ? "scale-[0.98] opacity-50"
                              : ""
                          }
                        `}
                      >

                        {/* ==================================
                            IMAGE
                        ================================== */}

                        <div className="relative aspect-[16/6] bg-gray-100">

                          <img
                            src={
                              carousel.image
                            }
                            alt={
                              carousel.title ||
                              `Carousel slide ${
                                index + 1
                              }`
                            }
                            className="
                              h-full
                              w-full
                              object-cover
                            "
                          />

                          {/* SORT */}

                          <div
                            className="
                              absolute
                              left-2
                              top-2
                              flex
                              h-7
                              min-w-7
                              items-center
                              justify-center
                              rounded-full
                              bg-black/70
                              px-2
                              text-xs
                              font-semibold
                              text-white
                            "
                          >
                            {index + 1}
                          </div>

                          {/* DRAG */}

                          <div
                            className="
                              absolute
                              right-2
                              top-2
                              cursor-grab
                              rounded-md
                              bg-black/60
                              p-1.5
                              text-white
                              active:cursor-grabbing
                            "
                            title="Drag to reorder"
                          >
                            <GripVertical className="h-4 w-4" />
                          </div>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              void handleRemoveImage(
                                index
                              )
                            }
                            disabled={
                              saving ||
                              uploading
                            }
                            className="
                              absolute
                              bottom-2
                              right-2
                              rounded-md
                              bg-red-600/90
                              p-2
                              text-white
                              shadow
                              transition
                              hover:bg-red-700
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                            title="Remove carousel"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                        </div>

                        {/* ==================================
                            DETAILS
                        ================================== */}

                        <div className="space-y-4 p-4">

                          {/* TITLE */}

                          <div>
                            <label
                              htmlFor={`carousel-title-${carousel.id}`}
                              className="
                                mb-1
                                block
                                text-xs
                                font-medium
                                text-gray-600
                              "
                            >
                              Title
                            </label>

                            <input
                              id={`carousel-title-${carousel.id}`}
                              value={
                                carousel.title
                              }
                              onChange={(
                                event
                              ) =>
                                updateField(
                                  index,
                                  "title",
                                  event.target.value
                                )
                              }
                              placeholder="Carousel title"
                              className="
                                h-9
                                w-full
                                rounded-md
                                border
                                border-gray-300
                                bg-white
                                px-3
                                text-sm
                                outline-none
                                transition
                                focus:border-rose-400
                                focus:ring-2
                                focus:ring-rose-100
                              "
                            />
                          </div>

                          {/* DESCRIPTION */}

                          <div>
                            <label
                              htmlFor={`carousel-description-${carousel.id}`}
                              className="
                                mb-1
                                block
                                text-xs
                                font-medium
                                text-gray-600
                              "
                            >
                              Description
                            </label>

                            <textarea
                              id={`carousel-description-${carousel.id}`}
                              value={
                                carousel.description
                              }
                              onChange={(
                                event
                              ) =>
                                updateField(
                                  index,
                                  "description",
                                  event.target.value
                                )
                              }
                              placeholder="Carousel description"
                              rows={3}
                              className="
                                w-full
                                rounded-md
                                border
                                border-gray-300
                                bg-white
                                px-3
                                py-2
                                text-sm
                                outline-none
                                transition
                                resize-none
                                focus:border-rose-400
                                focus:ring-2
                                focus:ring-rose-100
                              "
                            />
                          </div>

                          {/* LINK */}

                          <div>
                            <label
                              htmlFor={`carousel-link-${carousel.id}`}
                              className="
                                mb-1
                                block
                                text-xs
                                font-medium
                                text-gray-600
                              "
                            >
                              Link
                            </label>

                            <input
                              id={`carousel-link-${carousel.id}`}
                              value={
                                carousel.link
                              }
                              onChange={(
                                event
                              ) =>
                                updateField(
                                  index,
                                  "link",
                                  event.target.value
                                )
                              }
                              placeholder="/products"
                              className="
                                h-9
                                w-full
                                rounded-md
                                border
                                border-gray-300
                                bg-white
                                px-3
                                text-sm
                                outline-none
                                transition
                                focus:border-rose-400
                                focus:ring-2
                                focus:ring-rose-100
                              "
                            />
                          </div>

                          {/* ACTIVE + ORDER */}

                          <div className="flex items-center justify-between">

                            <label className="flex items-center gap-2">

                              <input
                                type="checkbox"
                                checked={
                                  carousel.active
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateField(
                                    index,
                                    "active",
                                    event.target.checked
                                  )
                                }
                                className="h-4 w-4"
                              />

                              <span className="text-sm text-gray-700">
                                Active
                              </span>

                            </label>

                            <div className="flex items-center gap-2">

                              <span className="text-xs text-gray-500">
                                Sort order
                              </span>

                              <span
                                className="
                                  rounded-md
                                  bg-gray-100
                                  px-2
                                  py-1
                                  text-xs
                                  font-semibold
                                  text-gray-700
                                "
                              >
                                {index + 1}
                              </span>

                            </div>

                          </div>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

              {/* ============================================
                  DRAG HELP
              ============================================ */}

              {images.length > 1 && (
                <p className="mt-4 text-xs text-gray-500">
                  Drag and drop slides to change their display order.
                </p>
              )}

            </>
          )}

        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="flex items-center justify-end gap-3 border-t bg-gray-50 px-5 py-4">

          <button
            type="button"
            onClick={() => {
              window.history.back();
            }}
            disabled={
              saving ||
              uploading
            }
            className="
              inline-flex
              items-center
              justify-center
              rounded-md
              border
              border-gray-300
              bg-white
              px-4
              py-2
              text-sm
              font-medium
              text-gray-700
              transition
              hover:bg-gray-100
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() =>
              void handleSave()
            }
            disabled={
              loading ||
              saving ||
              uploading
            }
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-md
              bg-rose-500
              px-5
              py-2
              text-sm
              font-medium
              text-white
              shadow-sm
              transition
              hover:bg-rose-600
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Carousel
              </>
            )}
          </button>

        </div>

      </div>

    </div>
  );
}