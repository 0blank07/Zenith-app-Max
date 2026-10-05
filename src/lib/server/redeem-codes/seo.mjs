import {
  REDEEM_ROUTE_CONFIG,
  REDEEM_ROUTE_KEY,
  REDEEM_ROUTE_REVALIDATE_SECONDS,
  getRedeemRouteConfigByKey
} from './constants.mjs';
import { getCachedRedeemHubPageData } from './public.mjs';

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function toTextArray(values) {
  return Array.isArray(values) ? values.map((value) => toText(value)).filter(Boolean) : [];
}

export function parseRedeemSearchParam(searchParams, key, options = {}) {
  const rawValue = Array.isArray(searchParams?.[key]) ? searchParams[key][0] : searchParams?.[key];
  const normalized = toText(rawValue);
  if (!normalized) {
    return options.defaultValue || '';
  }

  if (Array.isArray(options.allowedValues) && options.allowedValues.length) {
    return options.allowedValues.includes(normalized) ? normalized : options.defaultValue || '';
  }

  return normalized.slice(0, options.maxLength || 160);
}

const REDEEM_ALTERNATE_ROUTE_KEYS = Object.freeze([
  REDEEM_ROUTE_KEY.GLOBAL,
  REDEEM_ROUTE_KEY.THAILAND,
  REDEEM_ROUTE_KEY.UAE,
  REDEEM_ROUTE_KEY.SPAIN
]);

function buildLanguageAlternates() {
  const alternates = {
    'x-default': REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.GLOBAL].path
  };

  for (const routeKey of REDEEM_ALTERNATE_ROUTE_KEYS) {
    const routeConfig = REDEEM_ROUTE_CONFIG[routeKey];
    const hreflang = toText(routeConfig?.hreflang);
    const path = toText(routeConfig?.path);
    if (!hreflang || !path) continue;
    alternates[hreflang] = path;
  }

  return alternates;
}

function resolveLanguageAlternates(routeConfig) {
  const alternates = buildLanguageAlternates();
  if (routeConfig?.key === REDEEM_ROUTE_KEY.GLOBAL_TODAY) {
    return {
      ...alternates,
      en: REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.GLOBAL_TODAY].path
    };
  }

  return alternates;
}

export function getDynamicTitleAndH1(routeConfig) {
  const title = toText(routeConfig?.title, 'FC Mobile Redeem Codes | Zenith');
  const h1 = toText(routeConfig?.h1, 'FC Mobile Redeem Codes');
  
  const TARGET_KEYS = [
    REDEEM_ROUTE_KEY.GLOBAL,
    REDEEM_ROUTE_KEY.THAILAND,
    REDEEM_ROUTE_KEY.UAE,
    REDEEM_ROUTE_KEY.SPAIN
  ];

  if (TARGET_KEYS.includes(routeConfig?.key)) {
    const locale = toText(routeConfig?.locale, 'en-US');
    let monthYear = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date());
    monthYear = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
    
    return {
      title: `${title} (${monthYear})`,
      h1: `${h1} (${monthYear})`
    };
  }
  
  return { title, h1 };
}

export function buildRedeemRouteMetadata(routeConfig) {
  const canonicalPath = routeConfig?.path || REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.GLOBAL].path;
  const { title } = getDynamicTitleAndH1(routeConfig);
  const description = toText(routeConfig?.metaDescription);
  const locale = toText(routeConfig?.locale, 'en-US');

  return {
    title,
    description,
    keywords: [toText(routeConfig?.primaryKeyword), ...toTextArray(routeConfig?.secondaryKeywords)].filter(Boolean),
    alternates: {
      canonical: canonicalPath,
      languages: resolveLanguageAlternates(routeConfig)
    },
    robots: {
      index: true,
      follow: true
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalPath,
      locale: locale.replace('-', '_'),
      siteName: 'Zenith'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  };
}

export async function getRedeemRoutePageData(routeKey, { search = '', section = 'all' } = {}) {
  const routeConfig = getRedeemRouteConfigByKey(routeKey);
  if (!routeConfig) {
    return null;
  }

  return getCachedRedeemHubPageData(routeConfig, search, section);
}

export { REDEEM_ROUTE_REVALIDATE_SECONDS };
