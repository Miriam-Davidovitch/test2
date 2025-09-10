# מערכת הזמנות בשר - Backend

## התקנה
```bash
npm install
```

## הרצה מקומית
```bash
npm start
```

## משתני סביבה
צור קובץ `.env.local` עם:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

## פריסה ב-Vercel
1. העלה ל-GitHub
2. חבר ל-Vercel
3. הגדר משתני סביבה ב-Vercel
4. פרוס

## API Endpoints
- `GET /api/customer/:searchTerm` - חיפוש לקוח
- `POST /api/update-weight` - עדכון משקל
- `GET /test` - בדיקת שרת