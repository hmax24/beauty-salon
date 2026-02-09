export type NavLink = {
  labelKey: "home" | "services" | "contacts";
  href: string;
};

export const NAV_LINKS: NavLink[] = [
  { labelKey: "home", href: "/" },
  { labelKey: "services", href: "/services" },
  { labelKey: "contacts", href: "/contacts" },
];