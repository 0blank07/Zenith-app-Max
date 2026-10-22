import getSitemapData from '../../sitemap-logic';

export async function GET(request, { params }) {
  try {
    // Handle both /sitemap/0 and /sitemap/0.xml
    const id = String(params.id || '').replace('.xml', '');
    const entries = await getSitemapData(id);

    if (!entries || entries.length === 0) {
      return new Response('Not Found', { status: 404 });
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified.toISOString()}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    let newestLastMod = null;
    for (const entry of entries) {
      if (entry?.lastModified instanceof Date && !Number.isNaN(entry.lastModified.getTime())) {
        if (!newestLastMod || entry.lastModified > newestLastMod) {
          newestLastMod = entry.lastModified;
        }
      }
    }

    const headers = {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
    };
    if (newestLastMod) {
      headers['Last-Modified'] = newestLastMod.toUTCString();
    }

    return new Response(xml, { headers });
  } catch (error) {
    console.error(`[sitemap-id-route] Error generating sitemap for ID ${params.id}:`, error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}
