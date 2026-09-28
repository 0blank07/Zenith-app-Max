export const DEFAULT_TOP_TICKER_TEXT = 'We’re looking for volunteers to contribute to ZenithFCM through coding, reviews, and blog writing. Interested? Contact us: admin@zenithfcm.com';

function parseBoolean(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

export function getTopTickerConfig() {
  const enabled = parseBoolean(process.env.ZENITH_TOP_TICKER_ENABLED);
  const customText = String(process.env.ZENITH_TOP_TICKER_TEXT || '').trim();

  return {
    enabled,
    text: customText || DEFAULT_TOP_TICKER_TEXT
  };
}
