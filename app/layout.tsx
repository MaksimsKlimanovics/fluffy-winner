import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { AppProvider } from "@/components/AppProvider";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin", "latin-ext", "cyrillic"], weight: ["400", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "Cipariņi — matemātika 1.–9. klasei",
  description:
    "Interaktīvi matemātikas un ģeometrijas uzdevumi ar dzīves piemēriem un AI palīgu Cipariņu skolēniem Latvijā.",
};

export const viewport: Viewport = {
  themeColor: "#5b5bf7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lv">
      <body className={nunito.className}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
