# 🤖 Hälsocoach - AI Makro Tracker

Din personliga AI-assistent för hälsosam kost med modern glassmorphism-design och svenska språkstöd.

## ✨ Funktioner

- **Modern 2025 UI/UX Design** - Glassmorphism, exaggerated minimalism, mörkt läge som standard
- **AI-driven näringsanalys** - Använder Google Gemini för exakt makroanalys
- **Röstinmatning** - Beskriv dina måltider med svenskt språkstöd
- **Geststöd** - Svep för att navigera och rensa fält
- **Responsiv design** - Optimerad för enhandsanvändning på mobil
- **Offline-kompatibel** - Fungerar utan inloggning

## 🚀 Kom igång

1. **Klona projektet**
   ```bash
   git clone [repository-url]
   cd ai-macro-tracker
   ```

2. **Installera dependencies**
   ```bash
   npm install
   ```

3. **Konfigurera API-nyckel**
   
   Skapa en `.env.local` fil i projektets rot:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=din_api_nyckel_här
   ```
   
   **Hämta din Gemini API-nyckel:**
   - Gå till [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Skapa eller logga in på ditt Google-konto
   - Klicka på "Create API key"
   - Kopiera nyckeln till din `.env.local` fil

4. **Starta utvecklingsservern**
   ```bash
   npm run dev
   ```

5. **Öppna appen**
   Navigera till [http://localhost:3000](http://localhost:3000)

## 🎨 Design-funktioner

### Glassmorphism & Modern UI
- Frosted glass-effekter med backdrop blur
- Smooth animationer och mikro-interaktioner
- Pill-formade knappar med exaggerated roundness
- Count-up animationer för dynamisk feedback

### Mörkt/Ljust Tema
- Mörkt läge som standard för bättre batterilivslängd
- Adaptiv tema-toggle i hamburgermeny
- Förbättrad kontrast för ljust läge för bättre läsbarhet

### Mobiloptimering
- Enhandsanvändning med stora touchytor
- Floating action buttons för snabb åtkomst
- Touch-gester för intuitiv navigation
- Tumvänlig interaktion utan blockerade element

## 🍱 Bento-Grid Layout

Makronutrienter visas i färgkodade glassmorphism-block:
- 🔵 **Protein** - Blå gradient
- 🟢 **Kolhydrater** - Grön gradient  
- 🟣 **Fett** - Lila gradient
- 🟠 **Kalorier** - Orange gradient

## 🎙️ Röstinmatning

- Stöder svensk röstigenkänning
- Klicka på mikrofonikonen i inputfältet
- Säg din måltidsbeskrivning på svenska
- AI:n analyserar automatiskt näringsinnehållet

## 🎯 Geststöd

- **Svep nedåt** på inputfältet: Rensa innehållet
- **Svep vänster/höger**: Navigera i historik (kommer snart)
- **Tap-effekter**: Visuell feedback på alla interaktioner

## 🤖 AI-funktioner

- Exakt näringsanalys baserat på svenska livsmedel
- Intelligent portionsgissning
- Felhantering med användarvänliga meddelanden
- Fallback-värden om AI:n inte är tillgänglig

## 🛠️ Teknisk stack

- **Framework**: Next.js 14 med App Router
- **Styling**: Tailwind CSS med custom glassmorphism
- **AI**: Google Gemini 1.5 Flash
- **Icons**: Lucide React
- **Language**: TypeScript
- **Storage**: localStorage (offline-first)

## 📱 Browser-stöd

- Chrome/Edge (rekommenderas för bästa glassmorphism-stöd)
- Safari (iOS/macOS)
- Firefox
- Röstinmatning kräver Chrome/Edge

## 🔧 Felsökning

### API-nyckel fungerar inte
- Kontrollera att `.env.local` finns i projektets rot
- Se till att nyckeln börjar med `AIzaSy...`
- Starta om utvecklingsservern efter ändringar

### Röstinmatning fungerar inte
- Använd Chrome eller Edge-webbläsare
- Tillåt mikrofon-åtkomst när webbläsaren frågar
- Kontrollera att du är på en säker HTTPS-anslutning

### Glassmorphism-effekter syns inte
- Uppdatera till senaste versionen av webbläsaren
- Chrome/Safari har bäst stöd för backdrop-filter

## 📄 Licens

MIT License - Se LICENSE fil för detaljer.

---

Skapad med ❤️ för en hälsosammare livsstil 