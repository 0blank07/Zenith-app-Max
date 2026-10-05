function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function cleanJsonLdValue(value) {
  if (Array.isArray(value)) {
    const cleaned = value.map((entry) => cleanJsonLdValue(entry)).filter((entry) => entry !== undefined);
    return cleaned.length ? cleaned : undefined;
  }

  if (value && typeof value === 'object') {
    const cleanedEntries = Object.entries(value)
      .map(([key, entry]) => [key, cleanJsonLdValue(entry)])
      .filter(([, entry]) => entry !== undefined);

    if (!cleanedEntries.length) {
      return undefined;
    }

    return Object.fromEntries(cleanedEntries);
  }

  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return value;
}

export function serializeJsonLd(schema) {
  return JSON.stringify(cleanJsonLdValue(schema));
}

export function buildRedeemBreadcrumbSchema(
  items = [],
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com',
  { inLanguage = '' } = {}
) {
  const normalizedItems = items
    .map((item, index) => {
      const name = toText(item?.name);
      const path = toText(item?.path);
      if (!name || !path) return null;

      return {
        '@type': 'ListItem',
        position: index + 1,
        name,
        item: new URL(path.startsWith('/') ? path : `/${path}`, siteUrl).toString()
      };
    })
    .filter(Boolean);

  if (!normalizedItems.length) {
    return null;
  }

  return cleanJsonLdValue({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    inLanguage: toText(inLanguage),
    itemListElement: normalizedItems
  });
}

export function buildRedeemFaqSchema(faqItems = [], { inLanguage = '' } = {}) {
  const entities = (Array.isArray(faqItems) ? faqItems : [])
    .map((entry) => {
      const question = toText(entry?.question);
      const answer = toText(entry?.answer);
      if (!question || !answer) return null;

      return {
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer
        }
      };
    })
    .filter(Boolean);

  if (!entities.length) {
    return null;
  }

  return cleanJsonLdValue({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: toText(inLanguage),
    mainEntity: entities
  });
}

function toAbsoluteUrl(path, siteUrl = 'https://zenithfcm.com') {
  const base = toText(siteUrl) || 'https://zenithfcm.com';
  const validBase = base.startsWith('http://') || base.startsWith('https://') ? base : `https://${base}`;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  try {
    return new URL(cleanPath, validBase).toString();
  } catch {
    return `${validBase.replace(/\/+$/, '')}${cleanPath}`;
  }
}

export function buildRedeemOrganizationSchema(
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com'
) {
  const resolvedSiteUrl = toText(siteUrl) || 'https://zenithfcm.com';

  return cleanJsonLdValue({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ZenithFCM',
    alternateName: 'Zenith',
    url: toAbsoluteUrl('/', resolvedSiteUrl),
    logo: toAbsoluteUrl('/assets/images/zenith_logo_main.png', resolvedSiteUrl),
    email: 'zenithfcmofficial@gmail.com',
    sameAs: [
      'https://x.com/zenithfcm',
      'https://discord.gg/HM2JajuQjQ',
      'https://www.instagram.com/zenithfcm/'
    ],
    description:
      'The ultimate FC Mobile database, market tracker, and squad building platform for enthusiasts worldwide.',
    publishingPrinciples: toAbsoluteUrl('/about-us', resolvedSiteUrl)
  });
}

export function buildRedeemCollectionSchema(
  { title, description, path, entries = [], inLanguage = '' } = {},
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenithfcm.com'
) {
  const normalizedPath = toText(path);
  if (!normalizedPath) return null;

  const resolvedSiteUrl = toText(siteUrl) || 'https://zenithfcm.com';
  const normalizedEntries = Array.isArray(entries) ? entries : [];
  const listEntries = normalizedEntries
    .map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: toText(entry?.title),
      dateCreated: toText(entry?.publishedAt),
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'status', value: toText(entry?.status) },
        { '@type': 'PropertyValue', name: 'scope', value: toText(entry?.scopeLabel) }
      ]
    }))
    .filter((entry) => entry.name);
  const modifiedCandidates = normalizedEntries
    .map((entry) => toText(entry?.updatedAt || entry?.publishedAt || entry?.expiresAt))
    .filter(Boolean)
    .map((value) => new Date(value))
    .filter((value) => !Number.isNaN(value.getTime()))
    .map((value) => value.toISOString());
  const dateModified = modifiedCandidates.length ? modifiedCandidates.sort().at(-1) : '';

  return cleanJsonLdValue({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    inLanguage: toText(inLanguage),
    name: toText(title),
    description: toText(description),
    dateModified,
    url: toAbsoluteUrl(normalizedPath, resolvedSiteUrl),
    author: {
      '@type': 'Person',
      name: 'ASTA',
      jobTitle: 'Lead FC Mobile Analyst',
      worksFor: {
        '@type': 'Organization',
        name: 'ZenithFCM',
        url: toAbsoluteUrl('/', resolvedSiteUrl)
      }
    },
    reviewedBy: {
      '@type': 'Organization',
      name: 'ZenithFCM Editorial Team',
      url: toAbsoluteUrl('/about-us', resolvedSiteUrl)
    },
    publisher: {
      '@type': 'Organization',
      name: 'ZenithFCM',
      url: toAbsoluteUrl('/', resolvedSiteUrl),
      logo: {
        '@type': 'ImageObject',
        url: toAbsoluteUrl('/assets/images/zenith_logo_main.png', resolvedSiteUrl)
      },
      sameAs: [
        'https://x.com/zenithfcm',
        'https://discord.gg/HM2JajuQjQ',
        'https://www.instagram.com/zenithfcm/'
      ]
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: listEntries.length,
      itemListElement: listEntries
    }
  });
}

