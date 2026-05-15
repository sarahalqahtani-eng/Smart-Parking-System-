# Smart Parking System — جامعة اليمامة

نظام مواقف ذكي متكامل: ويب سايت + قاعدة بيانات Supabase + ESP32 + موديل ذكاء اصطناعي.

---

## 📁 محتويات المشروع

```
smart-parking/
├── index.html              ← الصفحة الرئيسية (خريطة + حالة مباشرة)
├── reservation.html        ← صفحة الحجز + التحكم بالبوابة
├── ai-analyzer.html        ← صفحة تحليل الصور بالذكاء الاصطناعي
├── css/
│   └── styles.css          ← التصميم (سماوي + أخضر + أبيض)
├── js/
│   ├── config.js           ← إعدادات Supabase و ESP32
│   ├── translations.js     ← الترجمة (عربي/إنجليزي)
│   ├── common.js           ← الهيدر + اللوقو + الإعدادات
│   ├── home.js
│   ├── reservation.js
│   └── ai-analyzer.js
├── assets/
│   ├── logo.png            ← لوقو جامعة اليمامة
│   └── parking-banner.jpg
├── backend/                ← خادم الذكاء الاصطناعي (Flask)
│   ├── app.py
│   ├── requirements.txt
│   └── parking_ai_model.keras
├── esp32/
│   └── smart_parking_esp32.ino  ← كود ESP32 الموحد
└── database/
    └── migration.sql       ← SQL لتحديث قاعدة البيانات
```

---

## 🚀 خطوات التشغيل (افعلها بالترتيب)

### 1️⃣ تحديث قاعدة البيانات Supabase

افتح [Supabase Dashboard](https://supabase.com/dashboard) → مشروعك → **SQL Editor** → افتح ملف:
```
database/migration.sql
```
انسخ محتواه والصقه في الـ SQL Editor واضغط **Run**.

هذا الملف:
- يضيف أعمدة `user_name`, `user_phone`, `user_plate` لجدول `reservations`
- يضيف 4 مواقف تجريبية (A1, A2, A3, A4) لجدول `parking_spots`
- يفعّل سياسات RLS مفتوحة (للديمو فقط)

---

### 2️⃣ تشغيل خادم الذكاء الاصطناعي

في الـ Terminal، روح لمجلد `backend`:

```bash
cd backend
pip install -r requirements.txt
python app.py
```

ستظهر رسالة:
```
* Running on http://0.0.0.0:5000
```

اتركه شغال. هذا الخادم يستقبل الصور ويرجّع النتيجة من الموديل.

> **ملاحظة:** الموديل حجمه ~22MB ومرفق داخل المجلد `backend/`.

---

### 3️⃣ رفع كود ESP32

افتح Arduino IDE:

1. ركّب الإضافات اللازمة:
   - **ESP32 Board** (في Boards Manager)
   - **ESP32Servo** by Kevin Harrington (في Library Manager)

2. افتح الملف:
   ```
   esp32/smart_parking_esp32.ino
   ```

3. عدّل في أول الكود:
   ```cpp
   const char* WIFI_SSID     = "Sara Q";
   const char* WIFI_PASSWORD = "77777778";
   ```
   ضع شبكة الواي فاي اللي عندك.

4. ارفع الكود (Upload). افتح **Serial Monitor** على Baud Rate `115200`.

5. راح يطبع لك عنوان IP، مثل:
   ```
   WiFi Connected!
   IP Address: 192.168.1.42
   ```
   **احفظ هذا العنوان** — راح تحتاجه في الخطوة التالية.

---

### 4️⃣ فتح الويب سايت

افتح ملف `index.html` بالمتصفح (Chrome / Edge).

**طريقتين:**

**(أ) الطريقة الأبسط:** انقر مرتين على `index.html`. سيفتح في المتصفح مباشرة.

**(ب) طريقة موصى بها (لتجنب مشاكل CORS):** شغّل سيرفر محلي بسيط:
```bash
# داخل مجلد smart-parking
python3 -m http.server 8080
```
ثم افتح: <http://localhost:8080>

---

### 5️⃣ ربط ESP32 بالويب سايت

في الصفحة الرئيسية فوق على اليمين (أو اليسار في الواجهة العربية):
1. اضغط على أيقونة **⚙ الإعدادات**.
2. أدخل:
   - **ESP32 IP Address:** العنوان من الـ Serial Monitor (مثل `192.168.1.42`)
   - **AI Backend URL:** `http://localhost:5000`
3. اضغط **Save**.

الموقع سيُعاد تحميله، وراح تشوف:
- 🟢 **Live · Connected** = الحساس متصل
- المواقف الأربعة بحالتها (Spot A1 يتحدث فوراً حسب الحساس)

---

## 🎯 شرح كل صفحة

### 🏠 الصفحة الرئيسية (`index.html`)
- لوقو متحرك يظهر بالبداية (intro animation)
- هيدر ثابت + قائمة (الرئيسية / الحجز / الذكاء)
- بانر مع صورة الباركنق
- **خريطة الجامعة** بـ SVG (البوابة + 4 مواقف ملوّنة حسب الحالة)
- **شبكة المواقف** بتحديث مباشر (كل 2 ثانية تستعلم من ESP32)
- زر تبديل اللغة (EN ↔ AR) وإعدادات الاتصال

### 📝 صفحة الحجز (`reservation.html`)
- فورم: الاسم، الجوال، اللوحة، مدة الحجز
- اختيار موقف (المشغول معطّل تلقائياً)
- بعد التأكيد:
  - حفظ في جدول `reservations`
  - عرض شاشة التحكم بالبوابة
  - زرّين **Open Parking** و **Lock Parking**
  - الحالة المباشرة للبوابة (Open / Locked) من ESP32

### 🤖 صفحة الذكاء (`ai-analyzer.html`)
- ارفع صورة (Click أو Drag & Drop)
- الخادم يحلّلها بالموديل MobileNetV2
- النتيجة + نسبة الموثوقية بشريط متحرّك
- سجل آخر 6 تحاليل من جدول `ai_analysis`

---

## 🗄️ هيكلة قاعدة البيانات

| الجدول | الاستخدام |
|--------|-----------|
| `parking_spots` | المواقف وحالاتها الحالية |
| `reservations`  | حجوزات المستخدمين |
| `iot_logs`      | سجل قراءات الحساس |
| `gate_commands` | سجل أوامر فتح/قفل البوابة |
| `ai_analysis`   | نتائج تحليل الصور |

---

## 🔧 تخصيصات شائعة

### تغيير حد الكشف عن السيارة
في `esp32/smart_parking_esp32.ino` غيّر:
```cpp
#define OCCUPIED_DISTANCE_CM 15   // غيّرها للقيمة المناسبة
```

### إضافة موقف خامس
1. عدّل `js/home.js`:
   ```javascript
   const SPOT_NAMES = ['A1', 'A2', 'A3', 'A4', 'A5'];
   ```
2. أضف الموقف في SVG الخريطة داخل `renderMap()`.

### استخدام موديل آخر
استبدل ملف `backend/parking_ai_model.keras` بموديلك (نفس الـ input/output شكلاً).

---

## ❓ مشاكل شائعة

**❌ "Sensor Offline" مع إن ESP32 شغال:**
- تأكد إن الجوال/اللابتوب على نفس شبكة الواي فاي.
- جرّب تفتح `http://ESP32-IP/status` في المتصفح مباشرة. لازم يطلع رد.
- لو مفتوح الويب سايت بـ `file://`، بعض المتصفحات تحجب طلبات HTTP. استخدم الطريقة (ب) في الخطوة 4.

**❌ "Could not connect to AI backend":**
- تأكد إن `python app.py` لا زال شغال.
- جرّب: <http://localhost:5000/health> في المتصفح. لازم يرجع `{"status":"ok"}`.

**❌ خطأ Supabase RLS:**
- شغّل `database/migration.sql` كاملاً مرة ثانية.

---

## 👤 الفريق
نظام المواقف الذكية · جامعة اليمامة · 2026
