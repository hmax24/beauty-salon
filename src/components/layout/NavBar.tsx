import Link from "next/link";
import { NAV_LINKS } from "@/config/nav";

export function NavBar() {
  return (
    <nav className="text-sm text-gray-600 flex gap-4">
      {NAV_LINKS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="hover:text-black transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}