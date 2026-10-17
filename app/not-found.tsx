import Link from "next/link";
import { Mascot } from "@/components/Mascot";

export default function NotFound() {
  return (
    <main className="notfound">
      <Mascot size={120} mood="thinking" />
      <h1>404</h1>
      <p>Šāda lapa nav atrasta · Такая страница не найдена</p>
      <Link href="/" className="btn primary">
        ← Cipariņi
      </Link>
    </main>
  );
}
