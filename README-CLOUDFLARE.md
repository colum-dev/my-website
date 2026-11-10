# اتصال فرم تماس با Cloudflare Pages + D1

## فایل‌های تغییر کرده
- `public/Contact.dc.html`: فرم فعلی به `POST /api/contact` متصل شده است.
- `functions/api/contact.js`: API سمت سرور برای اعتبارسنجی و ذخیره درخواست.
- `functions/schema.sql`: ساخت جدول دیتابیس D1.

## راه‌اندازی

1. در Cloudflare یک D1 Database بسازید.
2. فایل `functions/schema.sql` را در بخش Console دیتابیس اجرا کنید.
3. در تنظیمات پروژه Cloudflare Pages، از بخش Settings > Functions > D1 database bindings:
   - Variable name: `DB`
   - Database: دیتابیس ساخته‌شده
4. پروژه را مجدداً Deploy کنید.

API:
`POST /api/contact`

بدنه نمونه:
```json
{
  "name": "علی",
  "appUrl": "https://example.com",
  "contact": "@telegram_id",
  "need": "طراحی و توسعه اپلیکیشن"
}
```

## نکته
فایل‌های فعلی صفحات با پسوند `.dc.html` از نوع خروجی بسته‌بندی‌شده هستند. قبل از انتشار عمومی، مطمئن شوید همین فایل‌ها در مرورگر و روی دامنه واقعی به‌درستی رندر می‌شوند. برای اجرای ساده Cloudflare Pages، پوشه‌ای که فایل‌های سایت در آن قرار دارند باید به عنوان خروجی استاتیک تنظیم شود.
