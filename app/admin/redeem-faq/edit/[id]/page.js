import { requireBlogSessionUser } from '../../../../../src/lib/server/blog/auth.mjs';
import { getFaqById } from '../../../../../src/lib/server/redeem-codes/faq-repository.mjs';
import AdminShell from '../../../../components/admin/AdminShell';
import AdminFaqEditor from '../../../../components/admin/redeem/AdminFaqEditor.client';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Edit FAQ | Zenith Admin',
  robots: { index: false, follow: false }
};

export default async function EditFaqPage({ params }) {
  const user = await requireBlogSessionUser({ nextPath: `/admin/redeem-faq/edit/${params.id}`, permission: 'admin-access' });
  const faqId = parseInt(params.id, 10);
  
  if (isNaN(faqId)) {
    notFound();
  }

  const faq = await getFaqById(faqId);
  if (!faq) {
    notFound();
  }

  return (
    <AdminShell
      title="Edit FAQ"
      description={`Update FAQ #${faq.id} for the ${faq.scope} region.`}
      currentPath="/admin/redeem-faq"
      user={user}
      counts={{}}
      backLink="/admin/redeem-faq"
    >
      <div style={{ background: 'var(--color-surface)', padding: '32px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
        <AdminFaqEditor initialData={faq} />
      </div>
    </AdminShell>
  );
}
