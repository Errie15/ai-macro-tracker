# 🤖 AI Makro Tracker

En modern webbapplikation för att spåra makronutrienter med hjälp av artificiell intelligens. Bygg med Next.js, React, Firebase och Gemini AI.

## ✨ Funktioner

- **AI-driven näringsanalys** - Beskriv din måltid i fritext och få automatisk makrouppskattning
- **Anpassningsbara mål** - Ställ in dina egna dagliga mål för protein, kolhydrater, fett och kalorier
- **Realtidsspårning** - Se din dagliga progress jämfört med dina mål
- **Röstinmatning** - Använd tal-till-text för snabb måltidsloggning
- **Enkel hantering** - Lägg till och ta bort måltider enkelt

## 🚀 Kom igång

### Förutsättningar

- Node.js 18+ 
- npm eller yarn
- Gemini AI API-nyckel (gratis från Google)

### Installation

1. Klona projektet:
```bash
git clone <din-repo-url>
cd ai-macro-tracker
```

2. Installera beroenden:
```bash
npm install
```

3. Skapa en `.env.local` fil i rotmappen:
```env
NEXT_PUBLIC_GEMINI_API_KEY=din_gemini_api_nyckel_här
```

4. Starta utvecklingsservern:
```bash
npm run dev
```

5. Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare

### Skaffa Gemini API-nyckel

1. Gå till [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Skapa ett nytt projekt eller använd ett befintligt
3. Generera en API-nyckel
4. Kopiera nyckeln till din `.env.local` fil

## 📁 Projektstruktur

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── GoalsSettings.tsx
│   ├── MacroProgress.tsx
│   ├── MealInput.tsx
│   └── MealList.tsx
├── lib/
│   ├── firebase.ts
│   ├── gemini.ts
│   └── storage.ts
└── types/
    └── index.ts
```

## 🛠️ Teknikstack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini Pro
- **Backend**: Firebase (framtida användning)
- **Ikoner**: Lucide React

## 🔧 Utveckling

### Byggkommandon

```bash
# Utvecklingsserver
npm run dev

# Bygga för produktion
npm run build

# Starta produktionsserver
npm run start

# Linting
npm run lint
```

### Kodstil

- Använd TypeScript för all kod
- Följ komponentuppdelning (håll filer under 200 rader)
- Använd svenska för all text i appen
- Följ Tailwind CSS-konventioner

## 📝 Användning

1. **Ställ in mål**: Klicka på "Ställ In Mål" för att konfigurera dina dagliga makromål
2. **Logga måltider**: Använd textfältet för att beskriva din måltid (t.ex. "50g proteinpulver, en banan och 10g jordnötssmör")
3. **Röstinmatning**: Klicka på mikrofon-ikonen för att använda tal-till-text
4. **Följ progress**: Se din dagliga progress i realtid
5. **Hantera måltider**: Ta bort måltider om du behöver göra korrigeringar

## 🔒 Säkerhet

- API-nycklar lagras säkert som miljövariabler
- Ingen känslig data skickas till tredje part
- Lokal datalagring för användarintegritet

## 🤝 Bidra

Bidrag är välkomna! Vänligen:

1. Forka projektet
2. Skapa en feature-branch
3. Commit dina ändringar
4. Pusha till branchen
5. Öppna en Pull Request

## 📄 Licens

Detta projekt är licensierat under MIT-licensen.

## 🆘 Support

Om du stöter på problem, vänligen:
1. Kontrollera att din Gemini API-nyckel är korrekt
2. Se till att alla beroenden är installerade
3. Öppna ett issue på GitHub

---

Gjord med ❤️ av Erik & Erik 