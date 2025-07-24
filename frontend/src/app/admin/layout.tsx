import AdminLayout from '@/components/AdminLayout';
import AdminAuthGuard from '@/components/AdminAuthGuard';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminAuthGuard>
  );
} 