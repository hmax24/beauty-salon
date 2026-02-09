import Link from "next/link";
import { NavBar } from "@/components/layout/NavBar";

export function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto max-w-6xl p-4 flex items-center justify-between">
        <Link href="/" className="font-semibold">
          Selena
        </Link>
        <NavBar />
      </div>
    </header>
  );
}