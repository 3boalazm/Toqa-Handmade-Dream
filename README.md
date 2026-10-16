# تقى | مجوهرات هاند ميد

React / Express / tRPC / Drizzle starter, adapted from the Sandbox web-db-user template.

- `pnpm dev`: development server; honors `PORT` (default 3000).
- `pnpm build` / `pnpm start`: build and serve `dist/index.js` and `dist/public/`.
- `pnpm db:migrate`: apply checked-in migrations. `pnpm db:push`: generate and apply new schema changes.
- `pnpm check` / `pnpm test`: types and application tests.

Start with the Webdev skill's default-template guide. Platform login, storage, payments and service contracts live in its shared references; read the relevant capability before extending its helper.

`server/_core/publicConfig.ts` exposes only named public runtime values. Private keys stay server-side. The platform serves managed `/manus-storage/` assets; the application does not register a second proxy.

Platform configuration is readable and editable through `webdev.config`. Default settings are initial values, not enforced constraints. The agent may modify the files, commands and configuration or follow the flexible guide for another stack.

## صفحة الأمنيات السرية (Toqa)

الصفحة دي **مش مربوطة من أي مكان** في الموقع، ومحدش يقدر يفتحها من غير ما يعرف مكانها.
الطريقة الوحيدة للدخول: **نقطة صغيرة جدًا في آخر الصفحة** (في الفوتر، جنب الكوبيرايت).
اضغط عليها ويفتحلك `/wishes` ، وبعدها يطلب **كود** عشان يفتح.

- `client/src/pages/Wishes.tsx`: الصفحة نفسها (فورم + قائمة الأمنيات).
- `server/wishes.ts`: التخزين (MySQL عن طريق Drizzle، ولو مفيش داتابيز بيشتغل بملف JSON في `data/wishes.json`).
- `server/routers.ts`: `wishes.unlock` / `wishes.list` / `wishes.add` — كلهم محتاجين الكود.

### تغيير الكود

الكود بيتقرأ من متغير البيئة `WISHES_CODE`، والافتراضي `toqa`:

```bash
WISHES_CODE="your-own-code" pnpm dev
```

- `WISHES_CODE`: كود فتح الصفحة. غيّره قبل النشر.
- `WISHES_FILE`: مسار ملف بديل للأمنيات لما مفيش داتابيز (الافتراضي `data/wishes.json`).

### قاعدة البيانات

الجدول الجديد `wishes` موجود في `drizzle/schema.ts` والميجرايشن جاهزة في
`drizzle/0001_wishes.sql`. طبّقها بـ:

```bash
pnpm db:migrate
```

## النشر على Vercel

المشروع جاهز للنشر على Vercel من غير أي إعدادات زيادة:

- `vercel.json`: بيبني الواجهة بـ `pnpm build:static` والخرج في `dist/public`.
- `api/trpc/[...trpc].ts`: الـ tRPC API كـ Serverless Function (نفس مسارات
  السيرفر المحلي بالظبط، بما فيها صفحة الأمنيات).
- `api/health.ts`: فحص بسيط `/api/health`.
- مسارات الصفحات (`/`، `/wishes`، `/404`) بترجع `index.html` للـ SPA.

### متغيرات البيئة على Vercel

من **Project → Settings → Environment Variables** ضيف المتغيرات دي
(لـ Production و Preview):

| المتغير        | القيمة     | إجباري؟                                              |
| -------------- | ---------- | ---------------------------------------------------- |
| `WISHES_CODE`  | `toqa`     | لأ — الافتراضي في الكود `toqa` برضو، بس الأفضل تضيفه |
| `DATABASE_URL` | رابط MySQL | اختياري — من غيره الأمنيات بتتخزن في ملف JSON مؤقت   |

أهم متغير هو `WISHES_CODE` (كود فتح الصفحة السرية `/wishes`)، وقيمته المطلوبة
`toqa`. بعد أي تعديل للمتغيرات اعمل **Redeploy** عشان القيم تتطبق.

> ملاحظة: حتى لو متسبش `WISHES_CODE` خالص، الكود بيرجع للقيمة الافتراضية `toqa`
> تلقائيًا — يعني الصفحة بتتفتح بـ `toqa` في كل الأحوال.
