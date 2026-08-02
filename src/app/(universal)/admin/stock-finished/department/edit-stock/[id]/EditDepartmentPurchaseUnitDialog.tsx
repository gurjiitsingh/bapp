'use client';

import { useState } from 'react';
import {
Dialog,
DialogContent,
DialogHeader,
DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { updateDepartmentPurchaseUnit } from '@/app/(universal)/action/production/departments/updata/updateDepartmentPurchaseUnit';

 
type Mapping = {
purchaseUnit: string;
consumptionUnit: string;
factor: number;
};

type InventoryItem = {
id: string;
name: string;
purchaseMappings: Mapping[];
};

type Props = {
open: boolean;
onOpenChange: (open: boolean) => void;
departmentStockId: string;
inventoryItem: InventoryItem;
};

export default function EditDepartmentPurchaseUnitDialog({
open,
onOpenChange,
departmentStockId,
inventoryItem,
}: Props) {

const [loading, setLoading] = useState(false);
const router = useRouter();

async function handleSelect(mapping: Mapping) {
setLoading(true);


const result =
  await updateDepartmentPurchaseUnit({
    departmentStockId,
    purchaseUnit: mapping.purchaseUnit,
    consumptionUnit: mapping.consumptionUnit,
    conversionFactor: Number(mapping.factor),
  });

setLoading(false);

if (!result.success) {
  alert(result.message);
  return;
}

onOpenChange(false);
router.refresh();


}

return ( <Dialog open={open} onOpenChange={onOpenChange}> <DialogContent className="sm:max-w-md">


    <DialogHeader>
      <DialogTitle>
        Select Purchase Unit - {inventoryItem.name}
      </DialogTitle>
    </DialogHeader>

    <div className="space-y-3">

      {inventoryItem.purchaseMappings?.map(
        (mapping, index) => (

          <button
            key={index}
            type="button"
            disabled={loading}
            onClick={() => handleSelect(mapping)}
            className="
              w-full rounded-xl border border-gray-300 bg-white
              px-4 py-3 text-left transition-all
              hover:border-rose-400 hover:bg-rose-50
              focus:outline-none focus:ring-2 focus:ring-rose-400
              disabled:opacity-50
            "
          >

            <div className="font-semibold capitalize text-gray-900">
              {mapping.purchaseUnit}
            </div>

            <div className="mt-1 text-sm text-gray-600">
              1 {mapping.purchaseUnit} =
              {' '}
              {mapping.factor}
              {' '}
              {mapping.consumptionUnit}
            </div>

          </button>

        )
      )}

    </div>

  </DialogContent>
</Dialog>


);
}
