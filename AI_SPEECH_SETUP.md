# 🎤 AI-Powered Speech Recognition Setup

Your macro tracker now supports two speech recognition options:

## 🔄 Current Options

### 1. **Web Speech API** (Red Microphone 🎤)
- ✅ **Already working** - Uses browser's built-in speech recognition
- ✅ **No API key needed** - Completely free
- ✅ **Fast** - Real-time processing
- ❌ **Confidence issues** - Fixed by removing confidence check
- ❌ **Browser dependent** - Chrome/Edge work best

### 2. **AI-Powered** (Blue Waveform 🌊) 
- ✅ **Already configured** - Uses your existing Gemini API key
- ✅ **More accurate** - Uses Google Gemini AI
- ✅ **Better food terminology** - Optimized for nutrition speech
- ✅ **Consistent results** - Works across all browsers
- ✅ **No extra cost** - Uses your existing Gemini quota

## 🚀 AI Speech Recognition Status

### ✅ **Already Ready!**
Your AI speech recognition is already configured and ready to use! Since you have `OPENAI_API_KEY` in your `.env.local` file, the blue waveform button will use OpenAI Whisper for transcription.

### 🎯 **No Setup Required**
- Your existing Gemini API key works for speech recognition
- No additional API keys needed
- No extra costs - uses your current Gemini quota
- Ready to use immediately!

## 🎯 How to Use

### Web Speech API (Red Microphone)
- Click the **red microphone** button
- Speak immediately when it shows "Listening..."
- It will automatically add text to your input

### AI Speech Recognition (Blue Waveform)
- Click the **blue waveform** button  
- Speak for up to 10 seconds (or click "Stop" early)
- Wait a moment for AI transcription
- More accurate text will be added to your input

## 🧪 Testing

Try saying these phrases:
- "100 grams of protein powder"
- "Grilled chicken breast with rice and broccoli"
- "One cup of oatmeal with blueberries"
- "Salmon fillet with sweet potato"

## 💡 Tips

- **Use AI for complex foods** - Better at understanding nutrition terms
- **Use Web Speech for speed** - Faster for simple inputs
- **Combine both** - Use whichever works better for you
- **Check your text** - Always review the transcribed text before submitting

## 🔧 Troubleshooting

### AI Speech Not Working?
1. Check your `.env.local` has the correct OpenAI API key
2. Restart your development server (`npm run dev`)
3. Check the browser console for error messages
4. Ensure you have microphone permissions

### Web Speech Issues?
1. Use Chrome or Edge browser
2. Allow microphone access when prompted
3. Speak clearly and not too fast
4. Try refreshing the page

## 💰 Cost Information

Google Gemini Audio Transcription:
- **Uses your existing Gemini quota** - no additional charges
- **Free tier available** - generous limits for personal use
- **10-second recording** = minimal quota usage
- **100 meal recordings** = still within most free quotas

Essentially free for typical usage! 