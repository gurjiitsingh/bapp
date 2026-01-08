export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-black font-mono text-[12px]">
        {children}
      </body>
    </html>
  );
}
