import AdminShell from '../../components/admin/AdminShell';
import { requireBlogSessionUser } from '../../../src/lib/server/blog/auth.mjs';
import { getBlogDashboardCounts } from '../../../src/lib/server/blog/repository.mjs';
import { getRedeemDashboardCounts } from '../../../src/lib/server/redeem-codes/repository.mjs';
import { getStreamDashboardCounts } from '../../../src/lib/server/streams/repository.mjs';
import { getPartnerDashboardCounts } from '../../../src/lib/server/partners/repository.mjs';
import { listSquadThemes } from '../../../src/lib/server/squad-themes.mjs';
import ThemeManager from './ThemeManager.client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Squad Themes | Zenith Admin',
  robots: { index: false, follow: false }
};

function getAuthorScope(user) {
  return user?.role === 'admin' ? {} : { authorId: user?.id };
}

export default async function AdminThemesPage() {
  const user = await requireBlogSessionUser({ nextPath: '/admin/themes' });
  const scope = getAuthorScope(user);

  const [counts, redeemCounts, streamCounts, partnerCounts, themes] = await Promise.all([
    getBlogDashboardCounts(scope),
    getRedeemDashboardCounts(),
    getStreamDashboardCounts(),
    getPartnerDashboardCounts(),
    listSquadThemes()
  ]);

  const allCounts = {
    ...counts,
    ...redeemCounts,
    streamingTotal: streamCounts.total,
    partnersTotal: partnerCounts.total
  };

  return (
    <AdminShell
      title="Squad Builder Themes"
      description="Manage background themes for the Squad Builder."
      currentPath="/admin/themes"
      user={user}
      counts={allCounts}
    >
      <ThemeManager initialThemes={themes} />
    </AdminShell>
  );
}
