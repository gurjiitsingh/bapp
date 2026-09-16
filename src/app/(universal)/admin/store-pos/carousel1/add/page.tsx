import CarouselForm from "./CarouselForm";

export default function AddCarouselPage() {
  return (
    <div className="p-6">

      <div className="max-w-3xl mx-auto mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Add Carousel
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Add an image and information for the homepage carousel.
        </p>
      </div>

      <CarouselForm />

    </div>
  );
}
 
