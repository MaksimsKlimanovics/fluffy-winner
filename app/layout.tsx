import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { AppProvider } from "@/components/AppProvider";
import { GroupProvider } from "@/components/group/GroupProvider";
import "./globals.css";

// Nunito is the fallback for SF Pro Rounded (ui-rounded), which Apple devices use natively.
const nunito = Nunito({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Cipariņi — matemātika 1.–9. klasei",
  description:
    "Interaktīvi matemātikas un ģeometrijas uzdevumi ar dzīves piemēriem un AI palīgu Cipariņu skolēniem Latvijā.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lv">
      <body className={nunito.variable}>
        <AppProvider>
          <GroupProvider>{children}</GroupProvider>
        </AppProvider>
      </body>
    </html>
  );
}
