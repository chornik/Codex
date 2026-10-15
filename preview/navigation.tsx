import { createContext, useContext, type AnchorHTMLAttributes } from "react";
type NavigationState = {
  path: string;
  search: string;
  push: (href: string) => void;
  refresh: () => void;
};
export const Navigation = createContext<NavigationState>({
  path: "/",
  search: "",
  push: () => {},
  refresh: () => {},
});
export function usePathname() {
  return useContext(Navigation).path;
}
export function useSearchParams() {
  return new URLSearchParams(useContext(Navigation).search);
}
export function useRouter() {
  const { push, refresh } = useContext(Navigation);
  return { push, refresh };
}
export default function Link({
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a {...props} href={href.startsWith("/") ? `#${href}` : href} />;
}

export function navigate(href: string) {
  window.location.hash = href;
}
