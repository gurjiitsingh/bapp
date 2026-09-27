"use client";

import {
  ProductOptionType,
  updateProductOptions,
} from "@/app/(universal)/action/products/updateProductOptions";
import { useState } from "react";

type ProductOptionsEditorProps = {
  productId: string;
  initialOptions?: ProductOptionType[];
};

export default function ProductOptionsEditor({
  productId,
  initialOptions = [],
}: ProductOptionsEditorProps) {
  const [options, setOptions] =
    useState<ProductOptionType[]>(initialOptions);

  const [saving, setSaving] = useState(false);

  // =========================================================
  // ADD OPTION
  // =========================================================

  const addOption = () => {
    setOptions((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: "",
        values: [],
      },
    ]);
  };

  // =========================================================
  // UPDATE OPTION NAME
  // =========================================================

  const updateOptionName = (
    optionId: string,
    name: string
  ) => {
    setOptions((current) =>
      current.map((option) =>
        option.id === optionId
          ? {
              ...option,
              name,
            }
          : option
      )
    );
  };

  // =========================================================
  // DELETE OPTION
  // =========================================================

  const removeOption = (optionId: string) => {
    setOptions((current) =>
      current.filter(
        (option) => option.id !== optionId
      )
    );
  };

  // =========================================================
  // ADD OPTION VALUE
  // =========================================================

  const addValue = (optionId: string) => {
    setOptions((current) =>
      current.map((option) =>
        option.id === optionId
          ? {
              ...option,
              values: [
                ...option.values,
                {
                  id: crypto.randomUUID(),
                  name: "",
                  sortOrder:
                    option.values.length + 1,
                },
              ],
            }
          : option
      )
    );
  };

  // =========================================================
  // UPDATE OPTION VALUE
  // =========================================================

  const updateValue = (
    optionId: string,
    valueId: string,
    name: string
  ) => {
    setOptions((current) =>
      current.map((option) =>
        option.id === optionId
          ? {
              ...option,
              values: option.values.map(
                (value) =>
                  value.id === valueId
                    ? {
                        ...value,
                        name,
                      }
                    : value
              ),
            }
          : option
      )
    );
  };

  // =========================================================
  // DELETE OPTION VALUE
  // =========================================================

  const removeValue = (
    optionId: string,
    valueId: string
  ) => {
    setOptions((current) =>
      current.map((option) =>
        option.id === optionId
          ? {
              ...option,
              values: option.values
                .filter(
                  (value) =>
                    value.id !== valueId
                )
                .map((value, index) => ({
                  ...value,
                  sortOrder: index + 1,
                })),
            }
          : option
      )
    );
  };

  // =========================================================
  // SAVE OPTIONS FOR THIS PRODUCT
  // =========================================================

  const saveOptions = async () => {
    if (!productId) {
      alert("Product ID is missing.");
      return;
    }

    setSaving(true);

    try {
      const result = await updateProductOptions(
        productId,
        options
      );

      if (!result.success) {
        throw new Error(
          result.error ||
            "Failed to save product options."
        );
      }

      setOptions(result.options ?? []);

      alert(
        "Product options saved successfully."
      );
    } catch (error) {
      console.error(
        "Failed to save product options:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save product options."
      );
    } finally {
      setSaving(false);
    }
  };

  const hasOption = (name: string) => {
  return options.some(
    (option) =>
      option.name.trim().toLowerCase() ===
      name.toLowerCase()
  );
};

const addDefaultOption = (
  name: "Color" | "Size"
) => {
  if (hasOption(name)) {
    return;
  }

  setOptions((current) => [
    ...current,
    {
      id: crypto.randomUUID(),
      name,
      values: [],
    },
  ]);
};

return (
  <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">

    {/* =====================================================
        HEADER
    ===================================================== */}

    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      <div>
        <h2 className="text-lg font-semibold tracking-tight text-gray-900">
          Product Options
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Add options such as Color and Size.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">

        {/* ADD COLOR */}

        <button
          type="button"
          onClick={() => addDefaultOption("Color")}
          disabled={saving || hasOption("Color")}
          className="
            rounded-lg
            bg-gray-900
            px-4
            py-2
            text-sm
            font-medium
            text-white
            shadow-sm
            transition
            hover:bg-gray-800
            disabled:cursor-not-allowed
            disabled:bg-gray-200
            disabled:text-gray-400
          "
        >
          + Add Color
        </button>

        {/* ADD SIZE */}

        <button
          type="button"
          onClick={() => addDefaultOption("Size")}
          disabled={saving || hasOption("Size")}
          className="
            rounded-lg
            bg-gray-900
            px-4
            py-2
            text-sm
            font-medium
            text-white
            shadow-sm
            transition
            hover:bg-gray-800
            disabled:cursor-not-allowed
            disabled:bg-gray-200
            disabled:text-gray-400
          "
        >
          + Add Size
        </button>

        {/* ADD CUSTOM OPTION */}

        <button
          type="button"
          onClick={addOption}
          disabled={saving}
          className="
            rounded-lg
            bg-gray-50
            px-4
            py-2
            text-sm
            font-medium
            text-gray-700
            ring-1
            ring-gray-200
            transition
            hover:bg-gray-100
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          + Add Option
        </button>

      </div>
    </div>


    {/* =====================================================
        OPTIONS
    ===================================================== */}

    <div className="space-y-4">

      {options.map((option) => (

        <div
          key={option.id}
          className="
            rounded-xl
            bg-gray-50/70
            p-5
            ring-1
            ring-gray-100
          "
        >

          {/* OPTION HEADER */}

          <div className="flex items-center gap-3">

            

            <input
              type="text"
              value={option.name}
              onChange={(e) =>
                updateOptionName(
                  option.id,
                  e.target.value
                )
              }
              placeholder="Option name e.g. Color"
              disabled={saving}
              className="
                h-10
                flex-1
                rounded-lg
                bg-white
                px-3
                text-sm
                text-gray-900
                shadow-sm
                outline-none
                ring-1
                ring-gray-200
                transition
                placeholder:text-gray-400
                focus:ring-2
                focus:ring-gray-900/20
              "
            />

            <button
              type="button"
              onClick={() =>
                removeOption(option.id)
              }
              disabled={saving}
              className="
                rounded-lg
                px-3
                py-2
                text-sm
                font-medium
                text-red-500
                transition
                hover:bg-red-50
                hover:text-red-600
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              Remove
            </button>

          </div>


          {/* OPTION VALUES */}

          <div className="mt-4 space-y-2">

            {option.values.map((value) => (

              <div
                key={value.id}
                className="flex items-center gap-2"
              >

                {/* <input
  type="color"
  value={value.color || "#000000"}
  onChange={(e) =>
    updateValue(option.id, value.id, {
      color: e.target.value,
    })
  }
/> */}

                <input
                  type="text"
                  value={value.name}
                  onChange={(e) =>
                    updateValue(
                      option.id,
                      value.id,
                      e.target.value
                    )
                  }
                  placeholder="Value e.g. Black"
                  disabled={saving}
                  className="
                    h-10
                    flex-1
                    rounded-lg
                    bg-white
                    px-3
                    text-sm
                    text-gray-900
                    shadow-sm
                    outline-none
                    ring-1
                    ring-gray-200
                    transition
                    placeholder:text-gray-400
                    focus:ring-2
                    focus:ring-gray-900/20
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    removeValue(
                      option.id,
                      value.id
                    )
                  }
                  disabled={saving}
                  aria-label="Remove value"
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-lg
                    text-gray-400
                    transition
                    hover:bg-red-50
                    hover:text-red-500
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  ×
                </button>

              </div>

            ))}

          </div>


          {/* ADD VALUE */}

          <button
            type="button"
            onClick={() =>
              addValue(option.id)
            }
            disabled={saving}
            className="
              mt-4
              rounded-lg
              bg-white
              px-3
              py-2
              text-sm
              font-medium
              text-gray-700
              shadow-sm
              ring-1
              ring-gray-200
              transition
              hover:bg-gray-50
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            + Add Value
          </button>

        </div>

      ))}

    </div>


    {/* =====================================================
        SAVE
    ===================================================== */}

    {options.length > 0 && (

      <div className="flex justify-end pt-2">

        <button
          type="button"
          onClick={saveOptions}
          disabled={saving}
          className="
            rounded-xl
            bg-gray-900
            px-6
            py-2.5
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-gray-800
            hover:shadow
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {saving
            ? "Saving..."
            : "Save Options"}
        </button>

      </div>

    )}

  </div>
);
}