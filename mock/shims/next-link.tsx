import { useRouter } from "../router";

/** next/link for the mock: same markup, navigation stays inside the in-memory router. */
export default function Link({
  href,
  children,
  onClick,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const { navigate } = useRouter();
  return (
    <a
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        e.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}
