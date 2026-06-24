import InitButton from "./InitButton";

export default function Page() {
  return (
    <div className="p-8">
      <div className="max-w-xl mx-auto bg-white border rounded-xl p-6">

        <h1 className="text-2xl font-bold mb-3">
          Unit Conversion Setup
        </h1>

        <p className="text-gray-600 mb-6">
          Click the button below to add all default
          hardcoded unit conversions into Firestore.
        </p>

        <InitButton />

      </div>
    </div>
  );
}