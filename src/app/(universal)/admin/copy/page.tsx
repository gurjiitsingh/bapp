import AddParentTypeToProducts from './components/AddParentTypeToProducts';
import CopyProductsWithStatus from './components/CopyProductsWithStatus';


export default function Page() {
  return (
    <div className="space-y-6">
      <CopyProductsWithStatus />

      {/* 🔥 New Script */}
      <AddParentTypeToProducts />
    </div>
  );
}