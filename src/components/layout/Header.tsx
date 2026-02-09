import { LogoLink } from "@/components/layout/LogoLink";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { NavBar } from "@/components/layout/NavBar";

export function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto max-w-6xl p-4 flex items-center justify-between">
        <LogoLink />

        <div className="flex items-center gap-6">
          <NavBar />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
