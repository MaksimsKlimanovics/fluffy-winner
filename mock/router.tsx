import { createContext, useCallback, useContext, useState } from "react";

/** In-memory router standing in for the Next.js App Router inside the mock. */
type Location = { path: string; search: URLSearchParams; href: string };
type Router = { location: Location; navigate: (href: string) => void };

const RouterContext = createContext<Router | null>(null);

export function parseHref(href: string): Location {
  const [path, query = ""] = href.split("?");
  return { path: path || "/", search: new URLSearchParams(query), href };
}

export function RouterProvider({
  initial = "/",
  onNavigate,
  children,
}: {
  initial?: string;
  onNavigate?: (location: Location) => void;
  children: (location: Location, navigate: (href: string) => void) => React.ReactNode;
}) {
  const [location, setLocation] = useState(() => parseHref(initial));
  const navigate = useCallback(
    (href: string) => {
      const next = parseHref(href);
      setLocation(next);
      onNavigate?.(next);
    },
    [onNavigate],
  );
  return (
    <RouterContext.Provider value={{ location, navigate }}>{children(location, navigate)}</RouterContext.Provider>
  );
}

export function useRouter(): Router {
  const router = useContext(RouterContext);
  if (!router) throw new Error("useRouter outside RouterProvider");
  return router;
}
