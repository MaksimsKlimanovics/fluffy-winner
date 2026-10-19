import { useRouter as useMockRouter } from "../router";

export function usePathname(): string {
  return useMockRouter().location.path;
}

export function useSearchParams(): URLSearchParams {
  return useMockRouter().location.search;
}

export function useRouter() {
  const { navigate } = useMockRouter();
  return { push: navigate, replace: navigate };
}

export function notFound(): never {
  throw new Error("notFound");
}
