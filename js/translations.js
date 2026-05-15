/* ==========================================================================
   Smart Parking — Translations (EN / AR)
   ========================================================================== */

const TRANSLATIONS = {
  en: {
    // Brand
    brand: 'Smart Parking',
    university: 'Al Yamamah University',

    // Navigation
    nav_home: 'Home',
    nav_reservation: 'Reservation',
    nav_ai: 'AI Analyzer',
    lang_toggle: 'AR',

    // Hero
    hero_tagline: 'Smart Parking System',
    hero_title: 'Find Your Spot. Instantly.',
    hero_subtitle: 'IoT-powered parking with real-time availability across campus.',

    // Map
    map_label: 'Live Campus Map',
    map_title: 'Campus Parking Map',
    map_subtitle: 'Tap the map below to see which spots are available right now.',
    map_gate: 'Main Gate',
    legend_available: 'Available',
    legend_occupied: 'Occupied',
    legend_reserved: 'Reserved',

    // Available Spots
    spots_label: 'Live Sensor Data',
    spots_title: 'Available Parking',
    spots_subtitle: 'Real-time updates from our ultrasonic sensor network.',
    spot_available: 'Available',
    spot_occupied: 'Occupied',
    spot_distance: 'Distance',
    live_connected: 'Live · Connected',
    live_offline: 'Sensor Offline',
    spot_a1: 'Spot A1',
    spot_a2: 'Spot A2',
    spot_a3: 'Spot A3',
    spot_a4: 'Spot A4',

    // Reservation
    reservation_label: 'Reserve a Spot',
    reservation_title: 'Book Your Parking',
    reservation_subtitle: 'Fill in your details and pick an available spot.',
    full_name: 'Full Name',
    full_name_ph: 'e.g. Sara Al-Mutairi',
    phone: 'Phone Number',
    phone_ph: '05XXXXXXXX',
    plate: 'License Plate',
    plate_ph: 'e.g. ABC 1234',
    duration: 'Duration',
    duration_30: '30 minutes',
    duration_60: '1 hour',
    duration_120: '2 hours',
    duration_240: '4 hours',
    select_spot: 'Select a Spot',
    confirm_reservation: 'Confirm Reservation',
    gate_control: 'Gate Control',
    gate_open: 'Open',
    gate_locked: 'Locked',
    open_parking: 'Open Parking',
    lock_parking: 'Lock Parking',
    reservation_success: 'Reservation confirmed!',
    fill_all_fields: 'Please fill all fields and select a spot.',
    spot_unavailable: 'This spot is currently occupied.',

    // AI Analyzer
    ai_label: 'AI Powered',
    ai_title: 'AI Spot Analyzer',
    ai_subtitle: 'Upload a parking spot image and let our model classify it.',
    ai_upload_text: 'Click or drop an image here',
    ai_upload_hint: 'PNG or JPG · Maximum 5MB',
    analyzing: 'Analyzing...',
    ai_result_label: 'Classification Result',
    ai_confidence_label: 'Confidence Score',
    analyze_another: 'Analyze Another Image',
    ai_history_title: 'Recent Analyses',
    ai_history_empty: 'No analyses yet. Upload an image to start.',
    ai_error: 'Could not connect to AI backend. Is it running?',

    // Settings
    settings_title: 'Connection Settings',
    settings_subtitle: 'Configure your ESP32 and AI backend endpoints.',
    esp32_ip_label: 'ESP32 IP Address',
    esp32_ip_ph: 'e.g. 192.168.1.42',
    ai_backend_label: 'AI Backend URL',
    ai_backend_ph: 'e.g. http://localhost:5000',
    save: 'Save',
    cancel: 'Cancel',
    settings_saved: 'Settings saved!',
    esp32_not_configured: 'ESP32 IP not set. Open settings to configure.',

    // Footer
    footer: 'Smart Parking System · Al Yamamah University',
  },

  ar: {
    brand: 'الموقف الذكي',
    university: 'جامعة اليمامة',

    nav_home: 'الرئيسية',
    nav_reservation: 'الحجز',
    nav_ai: 'تحليل بالذكاء',
    lang_toggle: 'EN',

    hero_tagline: 'نظام المواقف الذكية',
    hero_title: 'احجز موقفك بضغطة زر',
    hero_subtitle: 'مواقف ذكية متصلة بإنترنت الأشياء مع تحديث فوري للحالة.',

    map_label: 'خريطة مباشرة',
    map_title: 'خريطة مواقف الجامعة',
    map_subtitle: 'انقر على الخريطة لمشاهدة المواقف المتاحة الآن.',
    map_gate: 'البوابة الرئيسية',
    legend_available: 'متاح',
    legend_occupied: 'مشغول',
    legend_reserved: 'محجوز',

    spots_label: 'بيانات الحساسات',
    spots_title: 'المواقف المتاحة',
    spots_subtitle: 'تحديثات لحظية من شبكة الحساسات.',
    spot_available: 'متاح',
    spot_occupied: 'مشغول',
    spot_distance: 'المسافة',
    live_connected: 'متصل · مباشر',
    live_offline: 'الحساس غير متصل',
    spot_a1: 'الموقف A1',
    spot_a2: 'الموقف A2',
    spot_a3: 'الموقف A3',
    spot_a4: 'الموقف A4',

    reservation_label: 'احجز موقفك',
    reservation_title: 'حجز الموقف',
    reservation_subtitle: 'املأ بياناتك واختر الموقف المناسب.',
    full_name: 'الاسم الكامل',
    full_name_ph: 'مثال: سارة المطيري',
    phone: 'رقم الجوال',
    phone_ph: '05XXXXXXXX',
    plate: 'رقم اللوحة',
    plate_ph: 'مثال: أ ب ج 1234',
    duration: 'مدة الحجز',
    duration_30: '30 دقيقة',
    duration_60: 'ساعة واحدة',
    duration_120: 'ساعتين',
    duration_240: '4 ساعات',
    select_spot: 'اختر الموقف',
    confirm_reservation: 'تأكيد الحجز',
    gate_control: 'التحكم بالبوابة',
    gate_open: 'مفتوحة',
    gate_locked: 'مقفلة',
    open_parking: 'فتح الموقف',
    lock_parking: 'قفل الموقف',
    reservation_success: 'تم تأكيد الحجز!',
    fill_all_fields: 'يرجى تعبئة جميع الحقول واختيار موقف.',
    spot_unavailable: 'هذا الموقف مشغول حالياً.',

    ai_label: 'مدعوم بالذكاء الاصطناعي',
    ai_title: 'محلل المواقف بالذكاء',
    ai_subtitle: 'ارفع صورة موقف وسيخبرك النموذج إن كان فاضي أو مشغول.',
    ai_upload_text: 'انقر أو اسحب صورة هنا',
    ai_upload_hint: 'PNG أو JPG · الحد الأقصى 5 ميجا',
    analyzing: 'جاري التحليل...',
    ai_result_label: 'نتيجة التصنيف',
    ai_confidence_label: 'نسبة الموثوقية',
    analyze_another: 'تحليل صورة أخرى',
    ai_history_title: 'آخر التحاليل',
    ai_history_empty: 'لا توجد تحاليل بعد. ارفع صورة للبدء.',
    ai_error: 'تعذر الاتصال بخادم الذكاء الاصطناعي. هل هو يعمل؟',

    settings_title: 'إعدادات الاتصال',
    settings_subtitle: 'اضبط عناوين ESP32 وخادم الذكاء الاصطناعي.',
    esp32_ip_label: 'عنوان IP لـ ESP32',
    esp32_ip_ph: 'مثال: 192.168.1.42',
    ai_backend_label: 'رابط خادم الذكاء',
    ai_backend_ph: 'مثال: http://localhost:5000',
    save: 'حفظ',
    cancel: 'إلغاء',
    settings_saved: 'تم حفظ الإعدادات!',
    esp32_not_configured: 'لم يتم ضبط ESP32. افتح الإعدادات لتعيين العنوان.',

    footer: 'نظام المواقف الذكية · جامعة اليمامة',
  }
};

// Current language (default English; reads from localStorage)
let CURRENT_LANG = localStorage.getItem('lang') || 'en';

function t(key) {
  return (TRANSLATIONS[CURRENT_LANG] && TRANSLATIONS[CURRENT_LANG][key]) || key;
}

function setLanguage(lang) {
  CURRENT_LANG = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;
  document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
  applyTranslations();
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    el.placeholder = t(key);
  });
}
