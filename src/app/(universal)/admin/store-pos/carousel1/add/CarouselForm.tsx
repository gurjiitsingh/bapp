"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Save, X } from "lucide-react";

import { addCarousel } from "@/app/(universal)/action/carousel/carousel1";

export default function CarouselForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [active, setActive] = useState(true);

  const [error, setError] = useState("");

  // =========================================================
  // IMAGE SELECT
  // =========================================================

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    setError("");

    const previewUrl = URL.createObjectURL(file);

    setPreview(previewUrl);
  }

  // =========================================================
  // REMOVE IMAGE
  // =========================================================

  function handleRemoveImage() {
    setPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // =========================================================
  // SAVE
  // =========================================================

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setError("Please select an image.");
      return;
    }

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append(
        "description",
        description.trim()
      );
      formData.append("link", link.trim());
      formData.append("sortOrder", sortOrder);
      formData.append(
        "active",
        active ? "true" : "false"
      );

      formData.append(
        "image",
        file,
        file.name
      );

      const result = await addCarousel(formData);

      if (result?.errors) {
        const firstError =
          Object.values(result.errors)[0];

        setError(
          firstError || "Could not save carousel."
        );

        return;
      }

      if (result?.success) {
        alert(
          result.message ||
            "Carousel saved successfully."
        );

        // Reset form
        setTitle("");
        setDescription("");
        setLink("");
        setSortOrder("0");
        setActive(true);

        setPreview(null);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }

    } catch (error) {
      console.error(
        "❌ Carousel save failed:",
        error
      );

      setError(
        "Unexpected error while saving carousel."
      );

    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* =====================================================
            IMAGE
        ===================================================== */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Carousel Image
          </label>

          <div
            className="
              border-2
              border-dashed
              border-gray-300
              rounded-xl
              p-4
              bg-gray-50
            "
          >

            {preview ? (
              <div className="relative">

                <div className="relative w-full aspect-[16/6] overflow-hidden rounded-lg bg-white">
                  <Image
                    src={preview}
                    alt="Carousel preview"
                    fill
                    className="object-cover"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="
                    absolute
                    top-2
                    right-2
                    flex
                    items-center
                    justify-center
                    w-8
                    h-8
                    rounded-full
                    bg-red-500
                    text-white
                    hover:bg-red-600
                  "
                >
                  <X size={16} />
                </button>

              </div>
            ) : (
              <div className="text-center py-10">

                <p className="text-sm text-gray-500 mb-4">
                  Select carousel image
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="
                    block
                    mx-auto
                    text-sm
                    text-gray-600
                  "
                />

              </div>
            )}

          </div>
        </div>

        {/* =====================================================
            TITLE
        ===================================================== */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="Enter carousel title"
            className="
              w-full
              rounded-lg
              border
              border-gray-300
              px-3
              py-2
              outline-none
              focus:border-blue-500
            "
          />
        </div>

        {/* =====================================================
            DESCRIPTION
        ===================================================== */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Enter carousel description"
            rows={4}
            className="
              w-full
              rounded-lg
              border
              border-gray-300
              px-3
              py-2
              outline-none
              resize-y
              focus:border-blue-500
            "
          />
        </div>

        {/* =====================================================
            LINK
        ===================================================== */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Link
          </label>

          <input
            type="text"
            value={link}
            onChange={(event) =>
              setLink(event.target.value)
            }
            placeholder="/products"
            className="
              w-full
              rounded-lg
              border
              border-gray-300
              px-3
              py-2
              outline-none
              focus:border-blue-500
            "
          />
        </div>

        {/* =====================================================
            SORT ORDER
        ===================================================== */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort Order
          </label>

          <input
            type="number"
            value={sortOrder}
            onChange={(event) =>
              setSortOrder(event.target.value)
            }
            className="
              w-full
              rounded-lg
              border
              border-gray-300
              px-3
              py-2
              outline-none
              focus:border-blue-500
            "
          />
        </div>

        {/* =====================================================
            ACTIVE
        ===================================================== */}

        <div className="flex items-center gap-3">

          <input
            id="active"
            type="checkbox"
            checked={active}
            onChange={(event) =>
              setActive(event.target.checked)
            }
            className="h-4 w-4"
          />

          <label
            htmlFor="active"
            className="text-sm font-medium text-gray-700"
          >
            Active
          </label>

        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =====================================================
            SAVE BUTTON
        ===================================================== */}

        <button
          type="submit"
          disabled={saving}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-lg
            bg-rose-500
            px-5
            py-2.5
            text-sm
            font-medium
            text-white
            hover:bg-rose-600
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {saving ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Carousel
            </>
          )}
        </button>

      </form>

    </div>
  );
}
 
