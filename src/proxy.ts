import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["ua", "ru", "en", "nl", "de"],
  defaultLocale: "nl",
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};