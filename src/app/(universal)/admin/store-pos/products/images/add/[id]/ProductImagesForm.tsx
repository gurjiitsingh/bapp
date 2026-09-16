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

import type {
  ProductImageType,
} from "@/lib/types/productType";

// ============================================================
// SERVER ACTIONS
// ============================================================

import {
  deleteProductImage,
  fetchProductImages,
  updateProductImages,
  uploadProductImage,
} from "@/app/(universal)/action/products/images/productImages";

 

// ============================================================
// TYPES
// ============================================================

type ProductImagesFormProps = {
  productId: string;
  productName: string;
  onSaved?: (
    images: ProductImageType[]
  ) => void;
  maxImages?: number;
};

// ============================================================
// HELPERS
// ============================================================

function createImageId() {
  return crypto.randomUUID();
}

function normaliseImages(
  images: ProductImageType[]
): ProductImageType[] {
  return [...images].map(
    (image, index) => ({
      ...image,
      sortOrder: index + 1,
    })
  );
}

// ============================================================
// COMPONENT
// ============================================================

export default function ProductImagesForm({
  productId,
  productName,
  onSaved,
  maxImages = 4,
}: ProductImagesFormProps) {
  // ==========================================================
  // IMAGES
  // ==========================================================

  const [
    images,
    setImages,
  ] = useState<ProductImageType[]>([]);

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
  // LOAD IMAGES
  // ==========================================================

  useEffect(() => {
    if (!productId) {
      return;
    }

    let cancelled = false;

    async function loadImages() {
      try {
        setLoading(true);

        const loaded =
          await fetchProductImages(
            productId
          );

        if (cancelled) {
          return;
        }

        setImages(
          normaliseImages(
            loaded ?? []
          )
        );
      } catch (error) {
        console.error(
          "PRODUCT_IMAGES_LOAD_ERROR",
          error
        );

        if (!cancelled) {
          alert(
            "Failed to load product images."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadImages();

    return () => {
      cancelled = true;
    };
  }, [productId]);

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

    /*
     * Maximum width OR height = 500px.
     *
     * Aspect ratio is preserved.
     *
     * Example:
     * 1200 x 800  -> 500 x 333
     * 800 x 1200  -> 333 x 500
     * 1000 x 1000 -> 500 x 500
     */
    const compressedFile =
      await imageCompression(
        file,
        {
          maxWidthOrHeight: 500,
          maxSizeMB: 0.2,
          initialQuality: 0.8,
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
      compressedFile,
      `${imageId}.jpg`
    );

    // ========================================================
    // UPLOAD TO FIREBASE STORAGE
    // ========================================================

    const result =
      await uploadProductImage(
        productId,
        imageId,
        formData
      );

    if (
      !result ||
      !result.url
    ) {
      throw new Error(
        result?.error ||
          "Image upload did not return a URL."
      );
    }

    // ========================================================
    // ADD TO LOCAL GALLERY
    // ========================================================

    const newImage:
      ProductImageType = {
      id: imageId,
    //  productId,
      url: result.url,
      name:
        file.name ||
        `Image ${imageNumber}`,
      sortOrder:
        images.length + 1,
    };

    setImages((current) =>
      normaliseImages([
        ...current,
        newImage,
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
        `Maximum ${maxImages} images allowed.`
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
    // LIMIT TO AVAILABLE SLOTS
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
        "PRODUCT_IMAGE_UPLOAD_ERROR",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to upload product image."
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

    /*
     * Allow selecting the same file again.
     */
    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  }

  // ==========================================================
  // REMOVE IMAGE
  // ==========================================================

  async function handleRemoveImage(
    index: number
  ) {
    const image =
      images[index];

    if (!image) {
      return;
    }

    const confirmed =
      window.confirm(
        `Remove "${
          image.name ||
          "this image"
        }"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      // ======================================================
      // DELETE FROM STORAGE
      // ======================================================

      await deleteProductImage(
        productId,
        image.id
      );

      // ======================================================
      // REMOVE FROM LOCAL STATE
      // ======================================================

      setImages((current) =>
        normaliseImages(
          current.filter(
            (_, itemIndex) =>
              itemIndex !== index
          )
        )
      );
    } catch (error) {
      console.error(
        "PRODUCT_IMAGE_DELETE_ERROR",
        error
      );

      alert(
        "Failed to remove image."
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

      return normaliseImages(
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
  // IMAGE NAME
  // ==========================================================

  function handleNameChange(
    index: number,
    value: string
  ) {
    setImages((current) =>
      current.map(
        (
          image,
          itemIndex
        ) =>
          itemIndex === index
            ? {
                ...image,
                name: value,
              }
            : image
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
        normaliseImages(
          images
        );

      // ======================================================
      // SAVE IMAGE ARRAY TO PRODUCT DOCUMENT
      // ======================================================

      const result =
        await updateProductImages(
          productId,
          finalImages
        );

      if (
        !result ||
        !result.success
      ) {
        throw new Error(
          result?.errors?.general ||
            result?.errors?.images ||
            "Could not save product images."
        );
      }

      const savedImages =
        result.images ??
        finalImages;

      setImages(
        normaliseImages(
          savedImages
        )
      );

      onSaved?.(
        savedImages
      );

      alert(
        "Product images saved successfully."
      );
    } catch (error) {
      console.error(
        "PRODUCT_IMAGES_SAVE_ERROR",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save product images."
      );
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
              Product Images
            </h2>

            {productName && (
              <p className="mt-0.5 text-sm text-gray-500">
                {productName}
              </p>
            )}
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
                    Gallery Images
                  </p>

                  <p className="text-xs text-gray-500">
                    {images.length} /{" "}
                    {maxImages} images
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
                      Add Image
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
                    Add product images
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Upload up to{" "}
                    {maxImages} images
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Images will be resized to maximum 500px
                  </p>
                </button>
              )}

              {/* ============================================
                  IMAGE GRID
              ============================================ */}

              {images.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  {images.map(
                    (
                      image,
                      index
                    ) => (
                      <div
                        key={image.id}
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

                        {/* IMAGE */}

                        <div className="relative aspect-square bg-gray-100">

                          <img
                            src={image.url}
                            alt={
                              image.name ||
                              `Product image ${
                                index + 1
                              }`
                            }
                            className="h-full w-full object-cover"
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
                            title="Remove image"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                        </div>

                        {/* IMAGE DETAILS */}

                        <div className="space-y-3 p-3">

                          <div>
                            <label
                              htmlFor={`image-name-${image.id}`}
                              className="
                                mb-1
                                block
                                text-xs
                                font-medium
                                text-gray-600
                              "
                            >
                              Image Name
                            </label>

                            <input
                              id={`image-name-${image.id}`}
                              value={
                                image.name
                              }
                              onChange={(
                                event
                              ) =>
                                handleNameChange(
                                  index,
                                  event.target.value
                                )
                              }
                              placeholder="e.g. Front View"
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

                          <div className="flex items-center justify-between">

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
                    )
                  )}

                </div>
              )}

              {/* ============================================
                  DRAG HELP
              ============================================ */}

              {images.length > 1 && (
                <p className="mt-4 text-xs text-gray-500">
                  Drag and drop images to change their display order.
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
                Save Images
              </>
            )}
          </button>

        </div>

      </div>
    </div>
  );
}