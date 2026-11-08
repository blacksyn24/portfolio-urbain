import type { Metadata } from "next";
import { AdminProvider } from "@/components/admin/AdminProvider";
import { Shell } from "@/components/admin/Shell";

export const metadata: Metadata = { title: "Dashboard — Portfolio", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <Shell>{children}</Shell>
    </AdminProvider>
  );
}
