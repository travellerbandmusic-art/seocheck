# 📝 ادیتور TinyMCE با تحلیل SEO

یک ادیتور متن پیشرفته با قابلیت تحلیل خودکار SEO و بررسی خوانایی محتوا.

## 🏗️ ساختار پروژه

```
project/
├── index.html              # فایل HTML اصلی
├── css/
│   ├── main.css           # استایل‌های عمومی و Layout
│   ├── editor.css         # استایل‌های ادیتور
│   ├── seo-panel.css      # استایل‌های پنل SEO
│   └── modal.css          # استایل‌های مودال
├── js/
│   ├── config.js          # تنظیمات و ثابت‌های برنامه
│   ├── utils.js           # توابع کمکی (Utilities)
│   ├── seo-analyzer.js    # ماژول تحلیل SEO
│   ├── ui-handler.js      # مدیریت رابط کاربری
│   ├── editor.js          # مدیریت TinyMCE
│   └── main.js            # نقطه ورود اصلی
└── README.md              # مستندات پروژه
```

## 🎯 ویژگی‌های اصلی

### 1. تحلیل SEO
- ✅ بررسی کلمه کلیدی در H1
- ✅ بررسی کلمه کلیدی در پاراگراف اول
- ✅ محاسبه تراکم کلمه کلیدی
- ✅ بررسی کلمات کلیدی فرعی
- ✅ بررسی Alt تصاویر
- ✅ بررسی نسبت تصویر به متن
- ✅ بررسی رنگ آبی برای کلمه کلیدی

### 2. تحلیل خوانایی
- ✅ تشخیص جملات طولانی (بیش از 20 کلمه)
- ✅ تشخیص پاراگراف‌های طولانی (بیش از 150 کلمه)
- ✅ هایلایت بصری جملات و پاراگراف‌های طولانی

### 3. رابط کاربری
- ✅ نمایش امتیاز کلی SEO (0-100)
- ✅ نمایش آمار کلمات و کلیدواژه‌ها
- ✅ توضیحات تعاملی برای هر چک
- ✅ طراحی Responsive

## 📦 ماژول‌ها

### config.js
**مسئولیت**: تنظیمات و ثابت‌های برنامه

```javascript
- محدودیت‌های SEO (تراکم، طول جملات، و...)
- آستانه‌های امتیازدهی
- پیام‌های وضعیت
- تنظیمات TinyMCE
```

### utils.js
**مسئولیت**: توابع کمکی و Utility Functions

```javascript
- normalizeText()          // نرمال‌سازی متن
- extractText()            // استخراج متن از HTML
- countWords()             // شمارش کلمات
- findKeyword()            // جستجوی کلمه کلیدی
- hasKeywordInSection()    // بررسی وجود کلیدواژه در بخش خاص
- splitIntoSentences()     // تقسیم به جملات
- debounce()               // محدودسازی فراخوانی توابع
```

### seo-analyzer.js
**مسئولیت**: منطق اصلی تحلیل SEO

```javascript
- analyze()                     // تحلیل کامل محتوا
- performSEOChecks()            // انجام چک‌های SEO
- performReadabilityChecks()    // انجام چک‌های خوانایی
- calculateScore()              // محاسبه امتیاز کلی
- checkH1Keyword()              // چک H1
- checkKeywordDensity()         // چک تراکم
- checkImageRatio()             // چک نسبت تصویر
- ... سایر چک‌ها
```

### ui-handler.js
**مسئولیت**: مدیریت رابط کاربری

```javascript
- init()                       // مقداردهی اولیه
- updateAnalysisResults()      // به‌روزرسانی نتایج
- updateScore()                // به‌روزرسانی امتیاز
- renderChecks()               // رندر چک‌ها
- showInfoModal()              // نمایش مودال
- toggleSentenceHighlight()    // فعال/غیرفعال هایلایت جملات
- toggleParagraphHighlight()   // فعال/غیرفعال هایلایت پاراگراف‌ها
- applyHighlights()            // اعمال هایلایت‌ها
```

### editor.js
**مسئولیت**: مدیریت TinyMCE Editor

```javascript
- init()           // مقداردهی ادیتور
- getContent()     // دریافت محتوا
- setContent()     // تنظیم محتوا
- getBody()        // دریافت بدنه ادیتور
- clear()          // پاک کردن محتوا
```

### main.js
**مسئولیت**: نقطه ورود و هماهنگی ماژول‌ها

```javascript
- init()                // مقداردهی برنامه
- scheduleAnalysis()    // زمان‌بندی تحلیل
- performAnalysis()     // انجام تحلیل
```

## 🔧 نحوه افزودن ویژگی جدید

### 1. افزودن چک SEO جدید

**مرحله 1**: در `config.js` محدودیت‌های مورد نیاز را اضافه کنید:
```javascript
SEO_LIMITS: {
    // محدودیت جدید
    MAX_TITLE_LENGTH: 60
}
```

**مرحله 2**: در `seo-analyzer.js` متد چک را اضافه کنید:
```javascript
checkTitleLength(content) {
    // منطق چک
    return {
        status: 'success' | 'warning' | 'error',
        title: 'عنوان چک',
        tooltip: 'توضیحات',
        desc: 'توضیح کوتاه',
        detail: 'جزئیات اضافی (اختیاری)'
    };
}
```

**مرحله 3**: چک را به `performSEOChecks()` اضافه کنید:
```javascript
performSEOChecks(...) {
    const checks = [];
    // چک‌های قبلی
    checks.push(this.checkTitleLength(content));
    return checks;
}
```

### 2. افزودن تنظیمات جدید

**مرحله 1**: در `index.html` فیلد را اضافه کنید:
```html
<div class="config-group">
    <label>⚙️ تنظیم جدید</label>
    <input type="text" id="newSetting">
</div>
```

**مرحله 2**: در `ui-handler.js` المان را به `elements` اضافه کنید:
```javascript
elements: {
    // المان‌های قبلی
    newSetting: null
}
```

**مرحله 3**: در `cacheElements()` المان را کش کنید:
```javascript
cacheElements() {
    this.elements = {
        // ...
        newSetting: document.getElementById('newSetting')
    };
}
```

### 3. افزودن Utility جدید

در `utils.js`:
```javascript
const Utils = {
    // توابع قبلی...
    
    /**
     * توضیحات تابع
     */
    newUtilityFunction(param) {
        // منطق تابع
        return result;
    }
};
```

## 🎨 سفارشی‌سازی ظاهر

### تغییر رنگ‌های اصلی

در `css/seo-panel.css`:
```css
.seo-header {
    background: linear-gradient(135deg, #your-color1 0%, #your-color2 100%);
}
```

### تغییر فونت

در `css/main.css`:
```css
body {
    font-family: YourFont, sans-serif;
}
```

## 🐛 نحوه دیباگ

### 1. فعال کردن Console Logs

در `main.js` قبلاً console.log ها آماده است:
```javascript
console.log('📊 تحلیل انجام شد:', {
    score: ...,
    totalWords: ...,
    keywordCount: ...
});
```

### 2. بررسی جریان داده

```javascript
// در هر ماژول می‌توانید اضافه کنید:
console.log('Module Name - Function:', data);
```

### 3. استفاده از Browser DevTools

- **Elements**: بررسی ساختار DOM و استایل‌ها
- **Console**: مشاهده خطاها و لاگ‌ها
- **Network**: بررسی بارگذاری فایل‌ها
- **Sources**: دیباگ کد JavaScript

## 📊 معماری Data Flow

```
User Input (ادیتور/کلمات کلیدی)
    ↓
main.js → scheduleAnalysis() (با debounce)
    ↓
EditorManager.getContent() + UIHandler.getKeywords()
    ↓
SEOAnalyzer.analyze()
    ├→ Utils (توابع کمکی)
    └→ CONFIG (تنظیمات)
    ↓
Results Object
    ↓
UIHandler.updateAnalysisResults()
    └→ DOM Update
```

## ⚡ بهینه‌سازی عملکرد

### 1. Debouncing
تحلیل با تاخیر 500ms انجام می‌شود تا از تحلیل مداوم جلوگیری شود.

### 2. Event Delegation
در `ui-handler.js` از event delegation استفاده شده.

### 3. Caching
المان‌های DOM یکبار کش می‌شوند.

## 🔒 امنیت

### 1. XSS Protection
در `utils.js`:
```javascript
escapeHtml(text) {
    // محافظت در برابر XSS
}
```

### 2. Input Sanitization
تمام ورودی‌های کاربر sanitize می‌شوند.

## 📝 مثال استفاده

```javascript
// دریافت instance ادیتور
const editor = EditorManager.getInstance();

// تنظیم محتوا
editor.setContent('<p>محتوای جدید</p>');

// اجرای تحلیل دستی
App.performAnalysis();

// دریافت کلمات کلیدی
const keywords = UIHandler.getKeywords();
```

## 🤝 مشارکت

برای افزودن ویژگی جدید:
1. ماژول مربوطه را شناسایی کنید
2. تغییرات را اعمال کنید
3. تست کنید
4. مستندات را به‌روز کنید

## 📄 لایسنس

این پروژه تحت لایسنس GPL قرار دارد (مطابق TinyMCE).