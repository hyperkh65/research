import "./globals.css";

export const metadata = {
  title: "Market Spy | Intelligence Platform",
  description: "Cross-platform product research and comparison",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
