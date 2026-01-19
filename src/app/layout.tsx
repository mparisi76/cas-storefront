// app/layout.tsx
import Header from "@/components/Header"; // Adjust path based on your structure
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        {/* You can add a Footer here later */}
      </body>
    </html>
  );
}