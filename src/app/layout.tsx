import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "AgentVault",
  description: "Marketplace MVP for production-ready AI agent templates"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="page-shell">
          <header className="site-header">
            <Link href="/" className="brand">
              AgentVault
            </Link>
            <nav>
              <Link href="/templates">Templates</Link>
              <Link href="/bundles">Bundles</Link>
              <Link href="/checkout">Checkout</Link>
              <Link href="/dashboard">Dashboard</Link>
            </nav>
          </header>

          <main>{children}</main>

          <footer className="site-footer">
            <p>AgentVault MVP implementation for pipeline stage validation.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
