# מערכת ניהול מחסן מוצרים 📦

אפליקציה לניהול מלאי מוצרים עם ממשק משתמש ידידותי, שרת Express ומסד נתונים Supabase.

## תכונות המערכת ✨

- 📋 צפייה ברשימת מוצרים במחסן
- ➕ הוספת מוצרים חדשים
- 💰 חישוב אוטומטי של ערך המלאי
- 📊 סטטיסטיקות מלאי בזמן אמת
- 🔄 סנכרון עם מסד נתונים בענן

## הגדרת הפרויקט 🚀

### 1. הכנת מסד הנתונים
1. היכנס ל-Supabase Dashboard
2. פתח את ה-SQL Editor
3. הרץ את הקוד מהקובץ `database_setup.sql`

### 2. הגדרת משתני סביבה
צור קובץ `.env.local` עם:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. התקנת תלויות
```bash
npm install
```

## הפעלת המערכת 🏃‍♂️

### הפעלת השרת (טרמינל 1)
```bash
npm run server
```
השרת יפעל על: http://localhost:8080

### הפעלת הקלינט (טרמינל 2)
```bash
npm start
```
האפליקציה תפתח על: http://localhost:3000

## מבנה הפרויקט 📁

```
my-app/
├── src/
│   └── App.js          # ממשק המשתמש הראשי
├── api/
│   └── getData.js      # API לניהול מוצרים
├── server.js           # שרת Express
├── database_setup.sql  # הגדרת מסד הנתונים
└── package.json        # תלויות הפרויקט
```

## API Endpoints 🔌

- `GET /api/products` - קבלת כל המוצרים
- `POST /api/products` - הוספת מוצר חדש

## טכנולוגיות 🛠️

- **Frontend**: React 19
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Styling**: CSS inline

## פיתוח נוסף 🔮

רעיונות להרחבה:
- עריכת ומחיקת מוצרים
- חיפוש וסינון
- קטגוריות מוצרים
- התראות מלאי נמוך
- דוחות ואנליטיקה