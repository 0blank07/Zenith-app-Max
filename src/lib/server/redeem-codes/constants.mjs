export const REDEEM_CODE_STATUS = Object.freeze({
  ACTIVE: 'active',
  EXPIRED: 'expired'
});

export const REDEEM_CODE_STATUS_VALUES = Object.freeze(Object.values(REDEEM_CODE_STATUS));

export const REDEEM_CODE_SCOPE = Object.freeze({
  GLOBAL: 'global',
  INDIA: 'in',
  INDONESIA: 'id',
  MALAYSIA: 'my',
  VIETNAM: 'vn',
  THAILAND: 'th',
  PHILIPPINES: 'ph',
  USA: 'us',
  UAE: 'ae',
  PORTUGAL: 'pt',
  GERMANY: 'de',
  SPAIN: 'es',
  TURKEY: 'tr',
  RUSSIA: 'ru'
});

export const REDEEM_CODE_SCOPE_VALUES = Object.freeze(Object.values(REDEEM_CODE_SCOPE));

export const REDEEM_ROUTE_REVALIDATE_SECONDS = 60 * 60;
export const REDEEM_DEFAULT_PAGE_SIZE = 20;
export const REDEEM_MAX_PAGE_SIZE = 100;

export const REDEEM_CODE_SCOPE_OPTIONS = Object.freeze([
  { value: REDEEM_CODE_SCOPE.GLOBAL, label: 'Global' },
  { value: REDEEM_CODE_SCOPE.INDIA, label: 'India' },
  { value: REDEEM_CODE_SCOPE.INDONESIA, label: 'Indonesia' },
  { value: REDEEM_CODE_SCOPE.MALAYSIA, label: 'Malaysia' },
  { value: REDEEM_CODE_SCOPE.VIETNAM, label: 'Vietnam' },
  { value: REDEEM_CODE_SCOPE.THAILAND, label: 'Thailand' },
  { value: REDEEM_CODE_SCOPE.PHILIPPINES, label: 'Philippines' },
  { value: REDEEM_CODE_SCOPE.USA, label: 'USA' },
  { value: REDEEM_CODE_SCOPE.UAE, label: 'UAE' },
  { value: REDEEM_CODE_SCOPE.PORTUGAL, label: 'Portugal' },
  { value: REDEEM_CODE_SCOPE.GERMANY, label: 'Germany' },
  { value: REDEEM_CODE_SCOPE.SPAIN, label: 'Spain' },
  { value: REDEEM_CODE_SCOPE.TURKEY, label: 'Turkey' },
  { value: REDEEM_CODE_SCOPE.RUSSIA, label: 'Russia' }
]);

export const REDEEM_ROUTE_KEY = Object.freeze({
  GLOBAL: 'global',
  INDONESIA: 'indonesia',
  MALAYSIA: 'malaysia',
  VIETNAM: 'vietnam',
  THAILAND: 'thailand',
  UAE: 'uae',
  PORTUGAL: 'portugal',
  GERMANY: 'germany',
  SPAIN: 'spain',
  TURKEY: 'turkey',
  RUSSIA: 'russia'
});

export const REDEEM_ROUTE_CONFIG = Object.freeze({
  [REDEEM_ROUTE_KEY.GLOBAL]: {
    key: REDEEM_ROUTE_KEY.GLOBAL,
    path: '/fc-mobile-redeem-codes',
    scope: REDEEM_CODE_SCOPE.GLOBAL,
    includeGlobalScope: true,
    sharedGlobalCodes: true,
    todayOnly: false,
    countryLabel: 'Global',
    navLabel: 'Global',
    locale: 'en-US',
    hreflang: 'en',
    primaryKeyword: 'fc mobile redeem codes',
    secondaryKeywords: ['fc mobile redeem code', 'latest fc mobile redeem codes', 'fc mobile codes list'],
    title: 'FC Mobile Redeem Codes',
    metaDescription:
      'FC Mobile redeem codes with active, latest, and expired tracking. Built for players in every country without fake regional exclusives.',
    h1: 'FC Mobile Redeem Codes',
    intro:
      'Use this FC Mobile redeem code tracker to check active rewards first, then copy any working code in one tap.',
    globalCodeNote:
      'Most FC Mobile redeem codes are shared worldwide. For localized guides and community updates in Spanish, visit our Códigos FC Mobile hub.',
    copy: {
      eyebrow: 'Redeem code tracker',
      lastUpdatedLabel: 'List updated:'
    },
    faqEntries: [
      {
        question: 'Are these codes global or country-exclusive?',
        answer:
          'This list is primarily global. We do not claim country-exclusive codes unless EA explicitly publishes a regional restriction.'
      },
      {
        question: 'Why do country pages exist if the codes are global?',
        answer:
          'Country pages tailor context, wording, and FAQs for local players, while still using the same verified global code feed.'
      },
      {
        question: 'Can a global code still fail for some users?',
        answer:
          'Yes. Codes can expire quickly, hit redemption limits, or be limited by EA account eligibility, even when they are globally published.'
      }
    ],
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'FC Mobile Redeem Codes', path: '/fc-mobile-redeem-codes' }
    ]
  },
  [REDEEM_ROUTE_KEY.INDONESIA]: {
    key: REDEEM_ROUTE_KEY.INDONESIA,
    path: '/id/kode-redeem-fc-mobile',
    scope: REDEEM_CODE_SCOPE.INDONESIA,
    includeGlobalScope: true,
    sharedGlobalCodes: true,
    todayOnly: false,
    countryLabel: 'Indonesia',
    navLabel: 'Indonesia',
    locale: 'id-ID',
    hreflang: 'id',
    primaryKeyword: 'kode redeem fc mobile',
    secondaryKeywords: [
      'redeem fc mobile',
      'code redeem fc mobile',
      'kode redeem fc mobile hari ini',
      'kode redeem fc mobile 2025',
      'fc mobile redeem'
    ],
    title: 'Kode Redeem FC Mobile Indonesia | Daftar Kode Global',
    metaDescription:
      'Halaman kode redeem FC Mobile untuk pemain Indonesia dengan daftar kode global, update status aktif/expired, dan penjelasan yang jujur.',
    h1: 'Kode Redeem FC Mobile untuk Indonesia',
    intro:
      'Pantau kode redeem FC Mobile global yang bisa dicoba pemain Indonesia, lalu salin kode aktif dengan cepat dari satu halaman.',
    globalCodeNote:
      'Mayoritas kode berlaku global, bukan khusus Indonesia. Jika EA membatasi promo per wilayah, kami tandai langsung pada entri kode.',
    copy: {
      eyebrow: 'Pusat kode pemain Indonesia',
      lastUpdatedLabel: 'Terakhir diperbarui untuk pemain Indonesia:'
    },
    faqEntries: [
      {
        question: 'Apakah ini kode redeem FC Mobile khusus Indonesia?',
        answer:
          'Tidak selalu. Daftar ini berisi kode global yang umum dipakai semua region, kecuali EA menyatakan promo khusus negara tertentu.'
      },
      {
        question: 'Kenapa ada halaman Indonesia jika kodenya global?',
        answer:
          'Halaman ini dibuat untuk konteks lokal Indonesia: bahasa, FAQ, dan panduan penggunaan, sambil tetap memakai satu sumber kode global.'
      },
      {
        question: 'Kenapa kode bisa gagal saat dipakai di Indonesia?',
        answer:
          'Biasanya karena kode sudah kedaluwarsa, kuota habis, akun tidak memenuhi syarat, atau promo dibatasi EA untuk region tertentu.'
      }
    ],
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'FC Mobile Redeem Codes', path: '/fc-mobile-redeem-codes' },
      { name: 'Indonesia', path: '/id/kode-redeem-fc-mobile' }
    ]
  },
  [REDEEM_ROUTE_KEY.MALAYSIA]: {
    key: REDEEM_ROUTE_KEY.MALAYSIA,
    path: '/my/kod-redeem-fc-mobile',
    scope: REDEEM_CODE_SCOPE.MALAYSIA,
    includeGlobalScope: true,
    sharedGlobalCodes: true,
    todayOnly: false,
    countryLabel: 'Malaysia',
    navLabel: 'Malaysia',
    locale: 'ms-MY',
    hreflang: 'ms',
    primaryKeyword: 'kod redeem fc mobile',
    secondaryKeywords: ['kod redeem fc mobile malaysia', 'kod fc mobile malaysia', 'tebus kod fc mobile malaysia', 'ea kod redeem malaysia'],
    title: 'Kod Redeem FC Mobile Malaysia | Senarai Global Terkini',
    metaDescription:
      'Halaman tebus kod FC Mobile khusus untuk Malaysia. Ikuti senarai kod global dengan konteks tempatan, panduan FAQ unik, dan status kod terkini.',
    h1: 'Kod Redeem FC Mobile untuk Malaysia',
    intro:
      'Gunakan halaman Malaysia ini untuk mengikuti kod redeem FC Mobile global dengan konteks tempatan yang lebih sesuai untuk pemain MY.',
    globalCodeNote:
      'Sebahagian besar adalah kod kempen global. Kami hanya menandakan kod khas Malaysia apabila EA menetapkan sekatan serantau yang jelas.',
    copy: {
      eyebrow: 'Panduan pemain Malaysia',
      lastUpdatedLabel: 'Kemas kini terakhir untuk pemain Malaysia:'
    },
    faqEntries: [
      {
        question: 'Adakah kod redeem FC Mobile ini eksklusif untuk Malaysia?',
        answer:
          'Tidak. Halaman ini kebanyakannya memaparkan kod FC Mobile global untuk pemain Malaysia. Sebarang had kawasan EA akan dinyatakan dengan jelas.'
      },
      {
        question: 'Mengapa terdapat halaman Malaysia jika senarainya adalah global?',
        answer:
          'Ia menyediakan teks, carian dan konteks FAQ khas untuk Malaysia sambil menggunakan sumber data global yang sama.'
      },
      {
        question: 'Bolehkah kod global gagal untuk akaun pemain Malaysia?',
        answer:
          'Ya. Ia boleh gagal jika sudah tamat tempoh, had penebusan habis, dihadkan kepada akaun, atau terikat dengan kempen EA yang mengecualikan rantau kelayakan anda.'
      }
    ],
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'Kod Redeem FC Mobile', path: '/fc-mobile-redeem-codes' },
      { name: 'Malaysia', path: '/my/kod-redeem-fc-mobile' }
    ]
  },
  [REDEEM_ROUTE_KEY.VIETNAM]: {
    key: REDEEM_ROUTE_KEY.VIETNAM,
    path: '/vn/code-fc-mobile-vn',
    scope: REDEEM_CODE_SCOPE.VIETNAM,
    includeGlobalScope: false,
    sharedGlobalCodes: false,
    todayOnly: false,
    countryLabel: 'Vietnam',
    navLabel: 'Vietnam',
    locale: 'vi-VN',
    hreflang: 'vi',
    primaryKeyword: 'code fc mobile vn',
    secondaryKeywords: ['code fc mobile vn hôm nay', 'code fc mobile vn mới nhất'],
    title: 'Code FC Mobile VN | Cập Nhật Mới Nhất Hôm Nay (Tháng 8 2026)',
    metaDescription:
      'Tổng hợp danh sách code FC Mobile VN mới nhất hôm nay. Nhận ngay quà tặng độc quyền với các mã code chưa hết hạn trong tháng 8 2026.',
    h1: 'Code FC Mobile VN',
    intro:
      'Theo dõi các code FC Mobile VN mới nhất hôm nay. Nhanh chóng kiểm tra phần thưởng đang hoạt động và sao chép các code hiện có dành cho FC Mobile tại Việt Nam.',
    globalCodeNote: '',
    copy: {
      eyebrow: 'Trang code cho game thủ Việt',
      lastUpdatedLabel: 'Cập nhật lần cuối cho người chơi Việt Nam:'
    },
    faqEntries: [
      {
        question: 'Code trên trang này có phải chỉ dành cho Việt Nam không?',
        answer:
          'Không. Đây chủ yếu là mã toàn cầu cho FC Mobile. Chỉ khi EA thông báo giới hạn khu vực, chúng tôi mới đánh dấu mã theo vùng.'
      },
      {
        question: 'Vì sao vẫn cần trang Việt Nam nếu mã là toàn cầu?',
        answer:
          'Trang Việt Nam giúp tối ưu nội dung theo cách tìm kiếm địa phương, FAQ tiếng Việt và hướng dẫn phù hợp người chơi trong nước.'
      },
      {
        question: 'Khi nào mã toàn cầu có thể không dùng được ở Việt Nam?',
        answer:
          'Mã có thể lỗi khi đã hết hạn, hết lượt, tài khoản không đủ điều kiện, hoặc chiến dịch EA áp dụng hạn chế theo vùng.'
      }
    ],
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'FC Mobile Redeem Codes', path: '/fc-mobile-redeem-codes' },
      { name: 'Vietnam', path: '/vn/code-fc-mobile-vn' }
    ]
  },
  [REDEEM_ROUTE_KEY.THAILAND]: {
    key: REDEEM_ROUTE_KEY.THAILAND,
    path: '/th/fc-mobile-code',
    scope: REDEEM_CODE_SCOPE.THAILAND,
    includeGlobalScope: true,
    sharedGlobalCodes: true,
    todayOnly: false,
    countryLabel: 'Thailand',
    navLabel: 'Thailand',
    locale: 'th-TH',
    hreflang: 'th',
    primaryKeyword: 'โค้ด fc mobile',
    secondaryKeywords: [
      'โค้ด fc mobile ล่าสุด',
      'โค้ดfc mobile',
      'fc mobile โค้ด ฟรี',
      'fc mobile โค้ดฟรี',
      'โค้ด fc mobile ล่าสุด ที่ ใช้ได้',
      'แจกโค้ด fc mobile',
      'โค้ดฟีฟ่า',
      'code fifa',
      'โค้ดฟีฟ่าล่าสุด',
      'fc mobile code',
      'code fc mobile ล่าสุด',
      'แจก รหัส ฟีฟ่า'
    ],
    title: 'โค้ด FC Mobile ล่าสุด | รวมโค้ดฟรี แจกโค้ด FC Mobile ที่ใช้ได้จริง',
    metaDescription:
      'รวมโค้ด FC Mobile ล่าสุด 2569 และโค้ดฟีฟ่าที่ใช้ได้จริง แจกโค้ด FC Mobile ฟรี อัปเดตทุกวัน พร้อมวิธีแลกโค้ดรับแพ็กนักเตะและเหรียญฟรี',
    h1: 'โค้ด FC Mobile ล่าสุด ที่ใช้ได้',
    intro:
      'รวมโค้ด FC Mobile ล่าสุด ที่ใช้ได้จริง แจกโค้ด FC Mobile ฟรีสำหรับผู้เล่นไทย อัปเดตรายวันจาก EA เช็กโค้ดที่ยังไม่หมดอายุ พร้อมวิธีแลกโค้ดรับรางวัลทันที',
    globalCodeNote:
      'โค้ด FC Mobile และโค้ดฟีฟ่าส่วนใหญ่เป็นโค้ดระดับโลก (Global Code) ซึ่งผู้เล่นในไทยสามารถกดแลกรับแพ็กนักเตะและเหรียญฟรีได้ตามปกติ',
    copy: {
      eyebrow: 'ศูนย์รวมโค้ดสำหรับผู้เล่นไทย',
      lastUpdatedLabel: 'อัปเดตล่าสุดสำหรับผู้เล่นไทย:',
      guideSections: [
        {
          title: 'รางวัลจากการแลกโค้ด FC Mobile ฟรี มีอะไรบ้าง?',
          intro:
            'การแลกโค้ดโปรโมชันของ FC Mobile ช่วยให้คุณอัปเกรดทีมได้แบบฟรีๆ โดยไม่ต้องเติมเงิน รางวัลที่ได้รับเป็นประจำได้แก่:',
          bullets: [
            'แพ็กนักเตะระดับสูงการันตี (OVR 105–115)',
            'เหรียญฟรี (Coins) และ อัญมณี (Gems) สำหรับเปิดการ์ดในร้านค้า',
            'โทเคนอัปเกรดนักเตะ (Dudek & Mascherano Rank Up)',
            'ตั๋วดราฟต์ (Draft Vouchers) และคะแนนฝึกซ้อม (Training Points)',
            'ชุดแข่งและโลโก้พิเศษประจำกิจกรรม'
          ]
        },
        {
          title: 'ทำไมโค้ด FC Mobile ถึงใช้งานไม่ได้? รวมวิธีแก้ไข',
          intro:
            'หากใส่โค้ดแล้วระบบขึ้นข้อผิดพลาด ลองตรวจสอบสาเหตุดังนี้:',
          bullets: [
            'โค้ดหมดอายุแล้ว: โค้ดส่วนใหญ่เปิดให้แลกในระยะเวลาสั้นๆ หรือมีโควตาจำกัด',
            'เคยแลกโค้ดนี้ไปแล้ว: 1 โค้ดสามารถแลกได้เพียง 1 ครั้งต่อ 1 บัญชี EA',
            'เข้าสู่ระบบผิดบัญชี: ตรวจสอบว่าบัญชี EA ที่ล็อกอิน เชื่อมต่อกับไอดีเกม FC Mobile ของคุณจริง',
            'พิมพ์ตัวอักษรผิด: แนะนำให้กดปุ่ม "คัดลอกโค้ด" เพื่อป้องกันการเว้นวรรคเกิน'
          ]
        },
        {
          title: 'ติดตามโค้ด FC Mobile ล่าสุด และกิจกรรมแจกโค้ดได้จากที่ไหน?',
          paragraphs: [
            'EA Sports จะแจกโค้ดพิเศษระหว่างการถ่ายทอดสดทัวร์นาเมนต์ FC Pro ใน YouTube/Twitch และกิจกรรมสำคัญตามเทศกาลต่างๆ',
            'ทีมงาน ZenithFCM รวบรวมและตรวจสอบโค้ดใหม่ทุกวัน เพื่อให้คุณได้รับโค้ด FC Mobile ล่าสุดที่ใช้ได้จริงก่อนใคร'
          ]
        }
      ]
    },
    faqEntries: [
      {
        question: 'โค้ด FC Mobile ล่าสุดที่ใช้ได้วันนี้มีโค้ดอะไรบ้าง?',
        answer:
          'คุณสามารถดูรายการโค้ด FC Mobile ล่าสุดที่ใช้งานได้จริงที่ด้านบนของหน้านี้ ทีมงานอัปเดตสถานะ Active และ Expired แบบเรียลไทม์ทุกวัน'
      },
      {
        question: 'วิธีแลกโค้ด FC Mobile ในเว็บ EA ทำอย่างไรทีละขั้นตอน?',
        answer:
          '1) กดคัดลอกโค้ดที่ต้องการจากหน้านี้ 2) ไปที่เว็บแลกรับของ EA (redeem.fcm.ea.com) 3) ล็อกอินด้วยบัญชี EA ที่เชื่อมกับเกม 4) วางโค้ดแล้วกดยืนยัน 5) เข้าเกม FC Mobile แล้วรับของรางวัลในกล่องจดหมาย'
      },
      {
        question: 'โค้ด FC Mobile กับ โค้ดฟีฟ่า คือสิ่งเดียวกันหรือไม่?',
        answer:
          'คือเกมเดียวกัน FC Mobile คือชื่อใหม่ของ FIFA Mobile โค้ดทั้งหมดใช้แลกรับรางวัลในเกมเดียวกันผ่านเว็บไซต์ทางการของ EA'
      },
      {
        question: 'ทำไมแลกโค้ดสำเร็จแล้วของรางวัลยังไม่เข้าเกม?',
        answer:
          'โดยปกติของรางวัลจะเข้าทันทีในกล่องจดหมาย หากยังไม่เข้า ให้ลองปิดแอปเกมแล้วเปิดใหม่ หรือรอระบบประมวลผลประมาณ 5-10 นาที'
      },
      {
        question: 'โค้ดระดับโลก (Global Code) ผู้เล่นไทยสามารถกดแลกได้ไหม?',
        answer:
          'แลกได้แน่นอน โค้ดส่วนใหญ่เปิดให้ใช้งานทั่วโลกรวมถึงประเทศไทย เว้นแต่จะมีโค้ดเฉพาะเซิร์ฟเวอร์ที่ EA ระบุเงื่อนไขไว้เป็นพิเศษ'
      }
    ],
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'FC Mobile Redeem Codes', path: '/fc-mobile-redeem-codes' },
      { name: 'Thailand', path: '/th/fc-mobile-code' }
    ]
  },
  [REDEEM_ROUTE_KEY.UAE]: {
    key: REDEEM_ROUTE_KEY.UAE,
    path: '/ae/kod-fifa',
    scope: REDEEM_CODE_SCOPE.UAE,
    includeGlobalScope: true,
    sharedGlobalCodes: true,
    todayOnly: false,
    countryLabel: 'UAE',
    navLabel: 'العربية',
    locale: 'ar-AE',
    hreflang: 'ar',
    textDirection: 'rtl',
    primaryKeyword: 'كود فيفا',
    secondaryKeywords: [
      'اكواد فيفا',
      'اكواد فيفا موبايل',
      'اكواد اف سي موبايل',
      'كود فيفا موبايل',
      'كودات فيفا',
      'استرداد اكواد فيفا',
      'اكواد فيفا موبايل 26',
      'كود فيفا 26 مجانا',
      'أكواد fc mobile مجانا',
      'استبدال اكواد فيفا',
      'اكواد لعبه اف سي موبايل'
    ],
    title: 'اكواد فيفا موبايل (FC Mobile) | اكواد شغالة وطريقة الاسترداد',
    metaDescription:
      'أحدث اكواد فيفا موبايل 2026 واكواد اف سي موبايل الشغالة مجاناً. استرداد اكواد فيفا بسهولة للحصول على حزم لاعبين، جواهر ونقاط مجانية.',
    h1: 'اكواد فيفا موبايل و FC Mobile الشغالة',
    intro:
      'تابع أحدث اكواد فيفا موبايل واكواد اف سي موبايل 2026 الشغالة مجانا اليوم. نوفر قائمة محدثة باستمرار مع شرح طريقة استرداد اكواد فيفا 26 للحصول على حزم لاعبين وجواهر مجانية في جميع الدول العربية.',
    globalCodeNote:
      'معظم اكواد فيفا موبايل واكواد FC Mobile هي اكواد عالمية تعمل لدى كافة اللاعبين في مصر، السعودية، اليمن، الجزائر، المغرب، العراق، وكافة الدول العربية.',
    copy: {
      breadcrumbLabel: 'مسار التنقل',
      eyebrow: 'اكواد فيفا موبايل المجانية',
      lastUpdatedLabel: 'آخر تحديث لاكواد فيفا:',
      browsePagesTitle: 'تصفح الصفحات الإقليمية',
      searchLabel: 'ابحث عن كود فيفا أو الكود',
      searchPlaceholder: 'ابحث عن اكواد فيفا موبايل أو FC Mobile...',
      sectionFilterLabel: 'تصفية القسم',
      sectionAll: 'كل الأقسام',
      sectionActive: 'الفعالة فقط',
      sectionLatest: 'الأحدث فقط',
      sectionExpired: 'المنتهية فقط',
      applyButton: 'تطبيق',
      activeTitle: 'أحدث اكواد فيفا موبايل الشغالة',
      activeCountSuffix: 'كود شغال',
      activeEmpty: 'لا يوجد كود فعال حاليًا.',
      latestTitle: 'أحدث اكواد فيفا موبايل',
      latestTodayTitle: 'أحدث اكواد فيفا المنشورة اليوم',
      latestCountSuffix: 'مدرج',
      latestEmpty: 'لا توجد اكواد حديثة مطابقة.',
      expiredTitle: 'اكواد فيفا المنتهية',
      expiredCountSuffix: 'مؤرشف',
      expiredEmpty: 'لا توجد اكواد منتهية مؤرشفة بعد.',
      faqTitle: 'الأسئلة الشائعة حول اكواد فيفا',
      statusActive: 'شغال',
      statusExpired: 'منتهي',
      publishedLabel: 'تاريخ النشر',
      expiresLabel: 'تاريخ الانتهاء',
      guideSections: [
        {
          title: 'ما هي الجوائز التي تمنحها اكواد فيفا موبايل واكواد اف سي موبايل مجاناً؟',
          intro:
            'توفر اكواد فيفا موبايل واكواد اف سي موبايل (FC Mobile Codes) للاعبين فرصة تطوير تشكيلاتهم وفتح حزم مميزة مجاناً دون الحاجة لشحن نقاط FC Points. تشمل المكافآت عادة:',
          bullets: [
            'حزم لاعبين مميزين بريت عالي (OVR 105–115)',
            'جواهر مجانية (Gems) وعملات نقدية (Coins) لشراء الحزم من المتجر',
            'قطع توكن الترقية (Rank Up Dudek & Mascherano) ونقاط التدريب',
            'قسائم المسودة (Draft Vouchers) للمشاركة في التحديات الأسبوعية',
            'أطقم وشعارات حصرية للنوادي والمنتخبات العالمية'
          ]
        },
        {
          title: 'لماذا لا يعمل كود فيفا أو كود اف سي موبايل؟ أسباب شائعة',
          intro:
            'إذا أدخلت كود فيفا موبايل وظهرت لك رسالة خطأ أثناء الاسترداد، فتحقق من الأسباب التالية:',
          bullets: [
            'انتهاء صلاحية الكود: أغلب اكواد فيفا تستمر لأيام قليلة أو تنتهي فور استنفاد الحد الأقصى للمطالبات العالمية.',
            'استخدام الكود مسبقاً: يمكن استرداد كود الهدية مرة واحدة فقط لكل حساب EA.',
            'تسجيل الدخول بحساب غير مربوط: تأكد من تسجيل الدخول بحساب EA المرتبط بلعبة FC Mobile على هاتفك.',
            'خطأ في كتابة الكود: الأكواد حساسة لحالة الأحرف (كبيرة/صغيرة). استخدم زر "نسخ الكود" لتجنب الفراغات الزائدة.'
          ]
        },
        {
          title: 'أين تجد أحدث كودات فيفا موبايل واكواد اف سي موبايل الجديدة 2026؟',
          paragraphs: [
            'تنشر شركة EA Sports كودات فيفا موبايل الجديدة أثناء البث المباشر لبطولات FC Pro على يوتيوب وتويتش، وخلال الأحداث الموسمية مثل TOTY و TOTS، والمناسبات الاحتفالية في المجتمع.',
            'يقوم فريق ZenithFCM بمراقبة جميع المصادر الرسمية لتحديث هذه الصفحة على مدار الساعة بأحدث اكواد فيفا موبايل واكواد اف سي موبايل 2026 الشغالة فور صدورها.'
          ]
        }
      ]
    },
    faqEntries: [
      {
        question: 'ما هي أحدث اكواد فيفا موبايل واكواد اف سي موبايل 2026 الشغالة اليوم؟',
        answer:
          'تظهر أحدث اكواد فيفا موبايل 2026 واكواد اف سي موبايل الشغالة في أعلى هذه الصفحة، حيث يتم تحديثها والتحقق منها يومياً لضمان عملها وتوفير كود فيفا 26 مجانا لجميع اللاعبين.'
      },
      {
        question: 'كيف يتم استرداد اكواد فيفا موبايل في موقع EA خطوة بخطوة؟',
        answer:
          '1) انسخ كود فيفا موبايل الجديد من القائمة. 2) اضغط على زر الاسترداد للانتقال إلى موقع EA الرسمي (redeem.fcm.ea.com). 3) سجل دخول بحساب EA المرتبط بلعبة FC Mobile. 4) الصق الكود واضغط استرداد. 5) افتح اللعبة واستلم جوائزك من صندوق البريد داخل اللعبة.'
      },
      {
        question: 'هل اكواد فيفا واكواد لعبه اف سي موبايل مجانية وتعمل في جميع الدول العربية؟',
        answer:
          'نعم، جميع كودات فيفا واكواد اف سي موبايل مجانية 100% وهي اكواد عالمية تعمل لجميع اللاعبين في مصر، اليمن، الجزائر، المغرب، السعودية، الإمارات، العراق، وكافة الدول العربية دون أي قيود إقليمية.'
      },
      {
        question: 'ما الفرق بين كود فيفا موبايل وكود FC Mobile؟',
        answer:
          'فيفا موبايل (FIFA Mobile) واف سي موبايل (FC Mobile) هما نفس اللعبة بعد قيام شركة EA Sports بتغيير الاسم التجاري. اكواد فيفا تعمل على نفس الحسابات ونفس الموقع الرسمي لاسترداد الهدايا.'
      },
      {
        question: 'ماذا أفعل إذا ظهر خطأ أو تعذر استبدال اكواد فيفا؟',
        answer:
          'إذا ظهر لك خطأ أثناء استبدال اكواد فيفا، فهذا يعني غالباً أن الكود انتهت صلاحيته أو اكتمل الحد الأقصى للمطالبات. تأكد من تجربة الأكواد الشغالة الأخرى في قائمتنا ومتابعة تحديثاتنا اليومية للحصول على كودات فيفا الجديدة فور صدورها.'
      }
    ],
    breadcrumb: [
      { name: 'الرئيسية', path: '/' },
      { name: 'اكواد فيفا موبايل', path: '/fc-mobile-redeem-codes' },
      { name: 'اكواد FC Mobile', path: '/ae/kod-fifa' }
    ]
  },
  [REDEEM_ROUTE_KEY.PORTUGAL]: {
    key: REDEEM_ROUTE_KEY.PORTUGAL,
    path: '/pt/codigo-de-resgate-fc-mobile',
    scope: REDEEM_CODE_SCOPE.PORTUGAL,
    includeGlobalScope: true,
    sharedGlobalCodes: true,
    todayOnly: false,
    countryLabel: 'Portugal',
    navLabel: 'Portugal',
    locale: 'pt-PT',
    hreflang: 'pt',
    primaryKeyword: 'codigo de resgate fc mobile',
    secondaryKeywords: ['codigos fc mobile portugal', 'codigo de resgate fifa mobile'],
    title: 'Código de Resgate FC Mobile Portugal | Códigos Globais',
    metaDescription:
      'Página de códigos de resgate do FC Mobile para jogadores em Portugal. Lista global com atualizações de status e explicações honestas sobre disponibilidade.',
    h1: 'Códigos de Resgate FC Mobile para Portugal',
    intro:
      'Acompanhe os códigos de resgate globais do FC Mobile que os jogadores em Portugal podem testar e copie os códigos ativos rapidamente.',
    globalCodeNote:
      'A maioria dos códigos é global e não exclusiva de Portugal. Se a EA restringir uma promoção por região, informaremos claramente.',
    copy: {
      eyebrow: 'Guia de códigos para Portugal',
      lastUpdatedLabel: 'Última atualização para jogadores em Portugal:'
    },
    faqEntries: [
      {
        question: 'Estes códigos são exclusivos para Portugal?',
        answer:
          'Não. Esta página monitora principalmente os lançamentos globais do FC Mobile. Qualquer restrição de região da EA será indicada claramente.'
      },
      {
        question: 'Por que Portugal tem sua própria página se a lista é global?',
        answer:
          'Para fornecer contexto e explicações em português de Portugal, mantendo uma fonte de dados global compartilhada.'
      },
      {
        question: 'Um código global pode falhar em contas portuguesas?',
        answer:
          'Sim. Pode falhar se estiver expirado, com limite de uso atingido, conta não elegível ou se houver uma campanha com restrição regional.'
      }
    ],
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'FC Mobile Redeem Codes', path: '/fc-mobile-redeem-codes' },
      { name: 'Portugal', path: '/pt/codigo-de-resgate-fc-mobile' }
    ]
  },
  [REDEEM_ROUTE_KEY.GERMANY]: {
    key: REDEEM_ROUTE_KEY.GERMANY,
    path: '/de/fc-mobile-einloesecodes',
    scope: REDEEM_CODE_SCOPE.GERMANY,
    includeGlobalScope: true,
    sharedGlobalCodes: true,
    todayOnly: false,
    countryLabel: 'Germany',
    navLabel: 'Germany',
    locale: 'de-DE',
    hreflang: 'de',
    primaryKeyword: 'FC Mobile Einlösecodes',
    secondaryKeywords: ['fc mobile codes deutschland', 'ea fc mobile einlösecode'],
    title: 'FC Mobile Einlösecodes Deutschland | Globale Code-Liste',
    metaDescription:
      'FC Mobile Einlösecodes für Spieler in Deutschland. Globale Liste mit ehrlichen Erklärungen und täglichen Updates zu aktiven und abgelaufenen Codes.',
    h1: 'FC Mobile Einlösecodes für Deutschland',
    intro:
      'Verfolge globale FC Mobile Einlösecodes für deutsche Spieler. Kopiere aktive Codes schnell und prüfe, welche bereits abgelaufen sind.',
    globalCodeNote:
      'Die meisten Codes sind global und nicht exklusiv für Deutschland. Wenn EA eine Aktion regional beschränkt, weisen wir darauf hin.',
    copy: {
      eyebrow: 'Code-Guide für deutsche Spieler',
      lastUpdatedLabel: 'Zuletzt aktualisiert für Spieler in Deutschland:'
    },
    faqEntries: [
      {
        question: 'Sind diese FC Mobile Einlösecodes exklusiv für Deutschland?',
        answer:
          'Nein. Wir listen hier hauptsächlich globale FC Mobile Codes auf. Falls EA einen Code regional beschränkt, wird dies deutlich markiert.'
      },
      {
        question: 'Warum gibt es eine deutsche Seite, wenn die Codes global sind?',
        answer:
          'Sie bietet deutsche Texte, lokale Erklärungen und FAQs, nutzt aber weiterhin dieselbe globale Datenquelle für Codes.'
      },
      {
        question: 'Kann ein globaler Code in Deutschland fehlschlagen?',
        answer:
          'Ja. Ein Code kann fehlschlagen, wenn er abgelaufen ist, das Einlöselimit erreicht hat oder EA bestimmte Regionen ausschließt.'
      }
    ],
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'FC Mobile Redeem Codes', path: '/fc-mobile-redeem-codes' },
      { name: 'Germany', path: '/de/fc-mobile-einloesecodes' }
    ]
  },
  [REDEEM_ROUTE_KEY.SPAIN]: {
    key: REDEEM_ROUTE_KEY.SPAIN,
    path: '/es/codigos-fc-mobile',
    scope: REDEEM_CODE_SCOPE.SPAIN,
    includeGlobalScope: true,
    sharedGlobalCodes: true,
    todayOnly: false,
    countryLabel: 'Latinoamérica y España',
    navLabel: 'Español',
    locale: 'es-ES',
    hreflang: 'es',
    primaryKeyword: 'Códigos FC Mobile',
    secondaryKeywords: [
      'codigos de fc mobile',
      'códigos fc mobile hoy',
      'códigos de canje de fc mobile',
      'fc mobile codigos',
      'codigo fc mobile',
      'recompensas fc mobile'
    ],
    title: 'Códigos FC Mobile: Recompensas y Canje Gratis',
    metaDescription:
      'Consulta los últimos códigos de FC Mobile con recompensas gratis, jugadores garantizados, gemas y vouchers. Guía paso a paso y solución a problemas de canje.',
    h1: 'Códigos FC Mobile: Lista de Canje y Recompensas Activas',
    intro:
      '¿Buscas los códigos FC Mobile hoy para conseguir recompensas gratis? Consulta nuestra lista actualizada de fc mobile códigos activos, recompensas garantizadas, tutorial paso a paso y respuestas a problemas habituales para jugadores de Latinoamérica y España.',
    globalCodeNote:
      'Los códigos de canje son una de las formas más sencillas de conseguir recompensas gratis en FC Mobile sin gastar FC Points ni Coins. La mayoría de los códigos son globales y aplican a todas las cuentas vinculadas.',
    copy: {
      eyebrow: 'Guía de Códigos para Latinoamérica y España',
      lastUpdatedLabel: 'Última actualización verificada:',
      guideSections: [
        {
          title: '¿Por qué vale la pena canjear los códigos de FC Mobile?',
          intro:
            'Los códigos promocionales de FC Mobile ofrecen a los jugadores la oportunidad de mejorar sus plantillas y desbloquear contenido exclusivo sin coste adicional. Dependiendo del evento activo de EA Sports, las recompensas pueden incluir:',
          bullets: [
            'Sobres de jugadores garantizados de alta valoración (OVR 110–118)',
            'Draft Vouchers para participar en torneos competitivos',
            'Gemas (Gems) y Monedas (Coins) gratis para la tienda',
            'Rank Up Tokens (Rup) y puntos de entrenamiento para subir de rango',
            'Kits y camisetas exclusivas de clubes y selecciones',
            'Objetos de eventos por tiempo limitado y fragmentos (Shards)'
          ]
        },
        {
          title: '¿Por qué no funciona mi código de canje?',
          intro:
            'Si introduces un código y la página de EA muestra un error, revisa las causas más frecuentes:',
          bullets: [
            'El código ha expirado: Los códigos de FC Mobile suelen durar pocos días o tienen un límite máximo de canjes globales.',
            'Ya has canjeado el código: La gran mayoría de los códigos solo se pueden reclamar una única vez por cuenta.',
            'Cuenta de EA incorrecta: Asegúrate de iniciar sesión con la cuenta de EA que tienes vinculada a tu perfil en la app de FC Mobile.',
            'Error al escribir el código: Los códigos distinguen mayúsculas y no deben contener espacios al inicio o al final. Te recomendamos usar nuestro botón "Copiar código".'
          ]
        },
        {
          title: '¿Dónde encontrar más códigos oficiales de FC Mobile?',
          paragraphs: [
            'Los nuevos códigos de canje de FC Mobile suelen aparecer durante grandes eventos de temporada (como TOTY, TOTS, eventos de aniversario), transmisiones oficiales en directo en Twitch y YouTube, celebraciones de la comunidad y colaboraciones especiales de EA Sports.',
            'En ZenithFCM monitoreamos todas las fuentes oficiales de EA para actualizar esta página al instante con los códigos FC Mobile hoy. Añade esta página a tus marcadores para no perderte ningún código antes de que expire.'
          ]
        }
      ]
    },
    faqEntries: [
      {
        question: '¿Cuáles son los últimos códigos de canje de FC Mobile activos hoy?',
        answer:
          'Los códigos de canje activos más recientes se muestran en la parte superior de esta página en tiempo real. En ZenithFCM actualizamos la lista diariamente verificando qué códigos de FC Mobile siguen funcionando hoy y cuáles han expirado.'
      },
      {
        question: '¿Cómo puedo canjear códigos en FC Mobile paso a paso?',
        answer:
          'Para canjear tus códigos: 1) Elige y copia un código activo de nuestra lista. 2) Abre la web oficial de canje de EA (redeem.fcm.ea.com). 3) Inicia sesión con la cuenta de EA vinculada a tu juego. 4) Pega el código en la casilla correspondiente y confirma. 5) Abre FC Mobile y recoge tus recompensas en el buzón del juego.'
      },
      {
        question: '¿Por qué no funciona mi código de canje de FC Mobile?',
        answer:
          'Si tu código no funciona, comprueba si ya ha caducado, si ya lo canjeaste previamente en tu cuenta, o si has iniciado sesión con una cuenta de EA diferente a la vinculada a tu juego. También asegúrate de no introducir espacios adicionales.'
      },
      {
        question: '¿Qué recompensas gratuitas ofrecen los códigos promocionales?',
        answer:
          'Los códigos pueden otorgar sobres de jugadores garantizados con alta media OVR, Draft Vouchers, Gemas, Rank Up Tokens (Rup), monedas (Coins), puntos de habilidad y camisetas exclusivas de temporada.'
      },
      {
        question: '¿Los códigos de canje de FC Mobile caducan?',
        answer:
          'Sí. La mayoría de los códigos de canje están disponibles durante un tiempo muy limitado o cuentan con un cupo máximo de canjes globales. Por ello, es recomendable canjearlos tan pronto como se publiquen.'
      },
      {
        question: '¿Dónde se publican los nuevos códigos de FC Mobile?',
        answer:
          'EA Sports publica códigos sorpresa durante directos oficiales de Twitch/YouTube, eventos de temporada del juego, campañas en redes sociales y festividades especiales. En ZenithFCM recopilamos y verificamos todos los códigos nuevos al instante.'
      },
      {
        question: '¿Estos códigos funcionan en Latinoamérica y España?',
        answer:
          'Sí. La inmensa mayoría de los códigos de FC Mobile son globales y funcionan perfectamente en cuentas de España y todos los países de habla hispana en Latinoamérica (México, Argentina, Colombia, Chile, Perú, etc.). Si un código fuese regional, lo especificaremos con una etiqueta.'
      }
    ],
    breadcrumb: [
      { name: 'Inicio', path: '/' },
      { name: 'FC Mobile Redeem Codes', path: '/fc-mobile-redeem-codes' },
      { name: 'Códigos FC Mobile', path: '/es/codigos-fc-mobile' }
    ]
  },
  [REDEEM_ROUTE_KEY.TURKEY]: {
    key: REDEEM_ROUTE_KEY.TURKEY,
    path: '/tr/fc-mobil-kullanim-kodlari',
    scope: REDEEM_CODE_SCOPE.TURKEY,
    includeGlobalScope: true,
    sharedGlobalCodes: true,
    todayOnly: false,
    countryLabel: 'Turkey',
    navLabel: 'Turkey',
    locale: 'tr-TR',
    hreflang: 'tr',
    primaryKeyword: 'FC Mobil Kullanım Kodları',
    secondaryKeywords: ['fc mobile promosyon kodları türkiye', 'fc mobil kodları'],
    title: 'FC Mobil Kullanım Kodları Türkiye | Küresel Kod Listesi',
    metaDescription:
      'Türkiye\'deki oyuncular için FC Mobil kullanım kodları. Güncel durum güncellemeleri ve bölgesel erişim hakkında dürüst açıklamalar içeren küresel liste.',
    h1: 'Türkiye için FC Mobil Kullanım Kodları',
    intro:
      'Türkiye\'deki oyuncuların test edebileceği küresel FC Mobil kullanım kodlarını takip edin ve aktif kodları hızla kopyalayın.',
    globalCodeNote:
      'Kodların çoğu küreseldir, Türkiye\'ye özel değildir. EA bir promosyonu bölgeyle sınırlarsa, bunu açıkça belirtiriz.',
    copy: {
      eyebrow: 'Türk oyuncu rehberi',
      lastUpdatedLabel: 'Türkiye\'deki oyuncular için son güncelleme:'
    },
    faqEntries: [
      {
        question: 'Bu kodlar sadece Türkiye\'ye mi özel?',
        answer:
          'Hayır. Bu sayfa ağırlıklı olarak küresel FC Mobil kodlarını izler. Herhangi bir EA bölge kısıtlaması açıkça belirtilecektir.'
      },
      {
        question: 'Kodlar küreselse neden Türkiye için ayrı bir sayfa var?',
        answer:
          'Türkçe açıklamalar ve SSS içeriği sunarken aynı paylaşılan küresel kod veritabanını kullanmak için.'
      },
      {
        question: 'Küresel bir kod Türkiye\'deki hesaplarda başarısız olabilir mi?',
        answer:
          'Evet. Süresi dolmuşsa, kullanım sınırına ulaşmışsa, hesabınız uygun değilse veya EA bölgenizi hariç tutmuşsa başarısız olabilir.'
      }
    ],
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'FC Mobile Redeem Codes', path: '/fc-mobile-redeem-codes' },
      { name: 'Turkey', path: '/tr/fc-mobil-kullanim-kodlari' }
    ]
  },
  [REDEEM_ROUTE_KEY.RUSSIA]: {
    key: REDEEM_ROUTE_KEY.RUSSIA,
    path: '/ru/fc-mobile-promo-code',
    scope: REDEEM_CODE_SCOPE.RUSSIA,
    includeGlobalScope: true,
    sharedGlobalCodes: true,
    todayOnly: false,
    countryLabel: 'Russia',
    navLabel: 'Russia',
    locale: 'ru-RU',
    hreflang: 'ru',
    primaryKeyword: 'промокод фк мобайл',
    secondaryKeywords: ['FC Mobile promo code', 'промокоды fc mobile', 'fc mobile коды россия'],
    title: 'Промокод ФК Мобайл (FC Mobile) Россия | Глобальные коды',
    metaDescription:
      'Глобальный промокод ФК Мобайл (FC Mobile) для игроков в России. Честная информация о доступности, статусе кодов и ежедневные обновления.',
    h1: 'Промокод ФК Мобайл для России',
    intro:
      'Отслеживайте глобальные промокоды FC Mobile для российских игроков. Проверяйте активные награды и быстро копируйте доступные коды.',
    globalCodeNote:
      'Большинство кодов являются глобальными, а не эксклюзивными для России. Если EA ограничит акцию по региону, мы четко укажем это.',
    copy: {
      eyebrow: 'Гид для игроков из России',
      lastUpdatedLabel: 'Последнее обновление для игроков из России:'
    },
    faqEntries: [
      {
        question: 'Эти промокоды эксклюзивны для России?',
        answer:
          'Нет. В основном здесь представлены глобальные коды FC Mobile. Любые региональные ограничения от EA будут четко отмечены.'
      },
      {
        question: 'Зачем нужна страница для России, если коды глобальные?',
        answer:
          'Она предоставляет тексты и пояснения на русском языке для удобства игроков, используя ту же глобальную базу кодов.'
      },
      {
        question: 'Может ли глобальный код не сработать на российском аккаунте?',
        answer:
          'Да. Код может не сработать из-за истечения срока действия, лимита активаций, условий аккаунта или региональных ограничений от EA.'
      }
    ],
    breadcrumb: [
      { name: 'Home', path: '/' },
      { name: 'FC Mobile Redeem Codes', path: '/fc-mobile-redeem-codes' },
      { name: 'Russia', path: '/ru/fc-mobile-promo-code' }
    ]
  }
});

export const REDEEM_LAUNCHED_LINKS = Object.freeze(
  [
    REDEEM_ROUTE_KEY.GLOBAL,
    REDEEM_ROUTE_KEY.THAILAND,
    REDEEM_ROUTE_KEY.UAE,
    REDEEM_ROUTE_KEY.SPAIN

  ].map((routeKey) => ({
    label: REDEEM_ROUTE_CONFIG[routeKey].navLabel,
    href: REDEEM_ROUTE_CONFIG[routeKey].path
  }))
);

export const REDEEM_SCOPE_TO_PUBLISHED_PATHS = Object.freeze({
  [REDEEM_CODE_SCOPE.GLOBAL]: [
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.GLOBAL].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.THAILAND].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.UAE].path,
    REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.SPAIN].path

  ],
  [REDEEM_CODE_SCOPE.INDONESIA]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.INDONESIA].path],
  [REDEEM_CODE_SCOPE.MALAYSIA]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.MALAYSIA].path],
  [REDEEM_CODE_SCOPE.VIETNAM]: [],
  [REDEEM_CODE_SCOPE.THAILAND]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.THAILAND].path],
  [REDEEM_CODE_SCOPE.UAE]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.UAE].path],
  [REDEEM_CODE_SCOPE.PORTUGAL]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.PORTUGAL].path],
  [REDEEM_CODE_SCOPE.GERMANY]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.GERMANY].path],
  [REDEEM_CODE_SCOPE.SPAIN]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.SPAIN].path],
  [REDEEM_CODE_SCOPE.TURKEY]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.TURKEY].path],
  [REDEEM_CODE_SCOPE.RUSSIA]: [REDEEM_ROUTE_CONFIG[REDEEM_ROUTE_KEY.RUSSIA].path]
});

export const REDEEM_SECTION_FILTER_OPTIONS = Object.freeze([
  { value: 'all', label: 'All sections' },
  { value: 'active', label: 'Active only' },
  { value: 'latest', label: 'Latest only' },
  { value: 'expired', label: 'Expired only' }
]);

export function getRedeemScopeLabel(scope) {
  return REDEEM_CODE_SCOPE_OPTIONS.find((entry) => entry.value === scope)?.label || 'Unknown scope';
}

export function getRedeemRouteConfigByKey(routeKey) {
  return REDEEM_ROUTE_CONFIG[routeKey] || null;
}
