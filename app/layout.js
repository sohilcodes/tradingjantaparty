import "./globals.css";

export const metadata = {
  title: "Trading Janta Party",
  description: "Trading signal dashboard"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
