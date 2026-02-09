import { NavBar } from "@/components/layout/NavBar";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Selena",
  description: "Beauty salon website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 mx-auto max-w-6xl w-full p-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
