# 🤖 Hälsocoach - AI Makro Tracker

Om servern inte går att starta npm run dev, ta bort .next filen och kör " npm install " 

Din personliga AI-assistent för hälsosam kost med modern glassmorphism-design och svenska språkstöd.

## ✨ Funktioner

- **Modern 2025 UI/UX Design** - Glassmorphism, exaggerated minimalism, mörkt läge som standard
- **AI-driven näringsanalys** - Använder Google Gemini för exakt makroanalys
- **USDA Matsökning** - Sök i USDA FoodData Central för exakta näringsvärden
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

3. **Konfigurera API-nycklar**
   
   Skapa en `.env.local` fil i projektets rot:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   NEXT_PUBLIC_USDA_API_KEY=din_usda_api_nyckel_här
   ```
   
   **Hämta API-nycklar:**
   
   **OpenAI API (för AI-analys med webbsökning):**
   - Gå till [OpenAI API Platform](https://platform.openai.com/api-keys)
   - Skapa eller logga in på ditt OpenAI-konto
   - Klicka på "Create new secret key"
   - Kopiera nyckeln till din `.env.local` fil
   
   **USDA FoodData Central API (för matsökning):**
   - Gå till [Data.gov API signup](https://api.data.gov/signup/)
   - Registrera dig med din e-post
   - Aktivera API-nyckeln via e-post
   - Kopiera nyckeln till din `.env.local` fil
   - **OBS:** Du kan också använda "DEMO_KEY" för test, men den har begränsade förfrågningar

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

**Förbättrad näringsanalys med webbsökning:**

- **Automatisk webbsökning**: AI:n söker på webben efter aktuella officiella näringsvärden för varje identifierat livsmedel
- **Verifierbara resultat**: Resultaten matchar vad användare kan hitta genom att googla samma livsmedel
- **Officiella källor**: Prioriterar märkesvarors officiella hemsidor och USDA-data
- **Intelligent parsing**: Delar upp måltidsbeskrivningar i individuella livsmedel automatiskt
- **Källangivelse**: Varje livsmedel visar exakt källa (t.ex. "McDonald's official website", "USDA FoodData Central")

**Tekniska detaljer:**
- Använder OpenAI GPT-4o mini:s inbyggda webbsökning
- Parsing av måltidsbeskrivningar till individuella livsmedel
- Intelligent portionsgissning baserat på beskrivning
- Exakt näringsberäkning per portion
- Felhantering med användarvänliga meddelanden

Se detaljerad prompt i `api/analyze-meal/route.ts`

## 🔍 USDA Matsökning

**Ny funktionalitet för exakta näringsvärden:**

- Sök i USDA FoodData Central-databasen med över 1 miljon livsmedel
- Få exakta näringsvärden för protein, kolhydrater, fett och kalorier
- Anpassa portionsstorlek i gram för personlig precision
- Stöd för märkesvaror, Foundation Foods och SR Legacy data
- Automatisk näringsberäkning baserat på 100g-värden

**Så här använder du matsökningen:**
1. Klicka på "Sök Livsmedel" på huvudsidan
2. Skriv in livsmedlet du söker (t.ex. "chicken breast", "banana")
3. Välj från sökresultaten
4. Ange vikten i gram för din portion
5. Se exakta näringsvärden och lägg till i din dagbok

**Testning i konsolen:**
```javascript
// Öppna utvecklarverktygen (F12) och testa:
window.testUSDA.examples.searchChicken()        // Sök kyckling
window.testUSDA.examples.getBananaNutrition()   // Få bananens näringsvärden
window.testUSDA.search("chocolate")             // Sök choklad
window.testUSDA.getNutrition("apple", 150)      // Äpple 150g
```

## 🛠️ Teknisk stack

- **Framework**: Next.js 14 med App Router
- **Styling**: Tailwind CSS med custom glassmorphism
- **AI**: OpenAI GPT-4o mini med webbsökning
- **Näringsdata**: USDA FoodData Central API + Webbsökning
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


Onboardingprocess: RUBIK: Välkommen till My macros , BRÖDTEXT: vill du ha hjälp att bestämma dina macros eller vet du redan vad du har för behov, kapp ja jag vill ha hjälp  , knapp nej, jag vet redan mina behov. 


Åtaganden: 

Erik O - tar reda på GPDR Regler/datbaslagring ang "personuppgifter", Feneral terms of condition för app store Android store ett,  Hur vi lägger upp alla app stores, 


Erik H - Satsta på funktionalitet istället för nice to have grejer, Den enkla onboardingprocessen är ställa in mål vilket man bara gör genom att ange protin fett och kolhydrater, man får automatiskt uträkniat kcal. 


Must have, api funktionalitet som faktiskt ger korrekta svar, inlogg, datbas, Layout kugghjul/settings, navbar. 
N allt annat (fulla onboardingprocessen är nice to have)
 

Navbar : Progress Måltider Kalender + 

Hamburgermeny byts mot kugghjul ,  Mål auth grejer, evenutulela premiumtillögsgrejer. språk, Tema 


User settings: 

Relevans av kalendern, Framtida eventuell implementering håller kolla på vikt och ger rekomendation baserat på macros och vikt. . 

Utmanningar : Notiser, ta reda på hur man gör det(Erik H) 


USP: Håller koll på users vikt och ger rekomendationer om ändring av dagliga macrosmål baserat på userns specifika data och mål. 


AI Modeller: 
 Tillgängliga AI-modeller:
GPT-4o-mini ⚡ (nuvarande)
Hastighet: Snabbast
Kostnad: Billigast
Precision: Mycket bra för nutrition
Bäst för: Snabba, vardagliga meals
GPT-4o 🚀
Hastighet: Lite långsammare
Kostnad: ~10x dyrare
Precision: Bästa möjliga
Bäst för: Komplexa meals, restaurang-rätter
GPT-3.5-turbo 💰
Hastighet: Snabb
Kostnad: Billigast av alla
Precision: Okej men mindre tillförlitlig
⚙️ Vill du ändra modell?
Jag kan lätt ändra så du kan:
Alternativ 1: Fast modell - byt till GPT-4o för bästa precision
Alternativ 2: Dynamisk - låt dig välja modell i appen (t.ex. en dropdown i settings)
Alternativ 3: Smart - använd GPT-4o-mini för enkla meals, GPT-4o för komplexa
💡 Min rekommendation:
GPT-4o-mini är perfekt för ditt use case - snabb, billig och mycket bra på nutrition. Men om du vill ha absolut bästa precision för komplexa måltider, kan vi byta till GPT-4o.
Vad föredrar du? Behålla GPT-4o-mini för hastighet/kostnad, eller vill du ha precision med GPT-4o?


