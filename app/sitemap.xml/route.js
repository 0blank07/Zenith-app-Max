import { generateSitemaps, STATIC_SITEMAP_ID } from '../sitemap-logic';
import { getRedeemLatestModifiedDates } from '../../src/lib/server/redeem-codes/repository.mjs';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com';

export async function GET() {
  try {
    const [sitemaps, redeemDates] = await Promise.all([
      generateSitemaps(),
      getRedeemLatestModifiedDates().catch(() => null)
    ]);

    const latestRedeemDate = redeemDates?.latest instanceof Date ? redeemDates.latest : null;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(({ id }) => {
  const isStatic = id === STATIC_SITEMAP_ID;
  const lastmodTag = isStatic && latestRedeemDate
    ? `\n    <lastmod>${latestRedeemDate.toISOString()}</lastmod>`
    : '';
  return `  <sitemap>
    <loc>${siteUrl}/sitemap/${id}.xml</loc>${lastmodTag}
  </sitemap>`;
}).join('\n')}
</sitemapindex>`;

    const headers = {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
    };
    if (latestRedeemDate) {
      headers['Last-Modified'] = latestRedeemDate.toUTCString();
    }

    return new Response(xml, { headers });
  } catch (error) {
    console.error('[sitemap-route] Error generating sitemap index:', error);
    return new Response('Error generating sitemap index', { status: 500 });
  }
}
