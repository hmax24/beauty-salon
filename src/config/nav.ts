export type NavLink = {
  labelKey: "home" | "services" | "contacts"| "booking";
  href: string;
};

export const NAV_LINKS: NavLink[] = [
  { labelKey: "home", href: "/" },
  { labelKey: "services", href: "/services" },
  { labelKey: "contacts", href: "/contacts" },
  { labelKey: "booking", href: "/booking" }

];