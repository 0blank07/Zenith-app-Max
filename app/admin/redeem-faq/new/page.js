import { requireBlogSessionUser } from '../../../../src/lib/server/blog/auth.mjs';
import AdminShell from '../../../components/admin/AdminShell';
import AdminFaqEditor from '../../../components/admin/redeem/AdminFaqEditor.client';

export const metadata = {
  title: 'Add New FAQ | Zenith Admin',
  robots: { index: false, follow: false }
};

export default async function NewFaqPage() {
  const user = await requireBlogSessionUser({ nextPath: '/admin/redeem-faq/new', permission: 'admin-access' });

  return (
    <AdminShell
      title="Add New FAQ"
      description="Create a new FAQ entry for a specific region."
      currentPath="/admin/redeem-faq"
      user={user}
      counts={{}}
      backLink="/admin/redeem-faq"
    >
      <div style={{ background: 'var(--color-surface)', padding: '32px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
        <AdminFaqEditor />
      </div>
    </AdminShell>
  );
}
