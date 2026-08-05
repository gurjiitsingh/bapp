// app/salemanger/layout.tsx
export default function SaleManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-100 min-h-screen flex justify-center">
      
      {/* 📱 Mobile Container */}
      <div className="
        w-full 
        max-w-md 
        bg-white 
        min-h-screen 
        shadow-md 
        flex 
        flex-col
      ">
        {children}
      </div>

    </div>
  );
}