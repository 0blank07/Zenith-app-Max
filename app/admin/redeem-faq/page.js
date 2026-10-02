import { requireBlogSessionUser } from '../../../src/lib/server/blog/auth.mjs';
import { getBlogDashboardCounts } from '../../../src/lib/server/blog/repository.mjs';
import { getRedeemDashboardCounts } from '../../../src/lib/server/redeem-codes/repository.mjs';
import { getAllFaqs } from '../../../src/lib/server/redeem-codes/faq-repository.mjs';
import AdminShell from '../../components/admin/AdminShell';
import AdminFaqTable from '../../components/admin/redeem/AdminFaqTable';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Redeem FAQs | Zenith Admin',
  robots: { index: false, follow: false }
};

export default async function AdminRedeemFaqPage() {
  const user = await requireBlogSessionUser({ nextPath: '/admin/redeem-faq', permission: 'admin-access' });
  const [counts, redeemCounts, faqs] = await Promise.all([
    getBlogDashboardCounts({}),
    getRedeemDashboardCounts(),
    getAllFaqs()
  ]);

  return (
    <AdminShell
      title="Redeem FAQs"
      description="Manage Frequently Asked Questions for FC Mobile Redeem Code pages."
      currentPath="/admin/redeem-faq"
      user={user}
      counts={{ ...counts, ...redeemCounts }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <Link 
          href="/admin/redeem-faq/new" 
          style={{ background: 'var(--color-primary)', color: '#000', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none', fontWeight: 600 }}
        >
          + Add New FAQ
        </Link>
      </div>
      <AdminFaqTable faqs={faqs} />
    </AdminShell>
  );
}
