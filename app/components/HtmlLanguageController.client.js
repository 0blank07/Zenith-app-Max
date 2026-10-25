'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const ARABIC_REDEEM_PATH = '/ae/kod-fifa';
const SPANISH_REDEEM_PATH = '/es/codigos-fc-mobile';
const THAI_REDEEM_PATH = '/th/fc-mobile-code';

function isArabicRedeemRoute(pathname) {
  return pathname === ARABIC_REDEEM_PATH || pathname.startsWith(`${ARABIC_REDEEM_PATH}/`);
}

function isSpanishRedeemRoute(pathname) {
  return pathname === SPANISH_REDEEM_PATH || pathname.startsWith(`${SPANISH_REDEEM_PATH}/`);
}

function isThaiRedeemRoute(pathname) {
  return pathname === THAI_REDEEM_PATH || pathname.startsWith(`${THAI_REDEEM_PATH}/`);
}

export default function HtmlLanguageController() {
  const pathname = usePathname() || '';

  useEffect(() => {
    const html = document.documentElement;
    if (!html) return;

    if (isArabicRedeemRoute(pathname)) {
      html.lang = 'ar';
      html.dir = 'rtl';
      return;
    }

    if (isSpanishRedeemRoute(pathname)) {
      html.lang = 'es';
      html.removeAttribute('dir');
      return;
    }

    if (isThaiRedeemRoute(pathname)) {
      html.lang = 'th';
      html.removeAttribute('dir');
      return;
    }

    html.lang = 'en';
    html.removeAttribute('dir');
  }, [pathname]);

  return null;
}
