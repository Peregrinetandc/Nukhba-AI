# Nukhba AI - Implementation Guide

## Overview
Nukhba AI is a fully functional exam preparation MVP with AI-powered tutoring, voice interaction, and quiz modules. The application is production-ready with real OpenAI integration.

## What's Been Implemented

### 1. AI Tutor Service (`src/services/tutor.ts`)
- **OpenAI Integration**: Uses GPT-3.5-turbo for cost-effective, fast responses
- **Multi-Language Support**: English, Arabic, and Hindi system prompts
- **Smart Response Parsing**: Extracts structured answers with follow-up questions
- **Conversation History**: Maintains context for multi-turn conversations
- **Error Handling**: Comprehensive error messages for debugging

**Key Functions:**
- `sendMessageToTutor()` - Sends user messages to OpenAI and receives tutor responses
- `generateExamQuestions()` - Generates multiple-choice questions on topics
- `parseAIResponse()` - Extracts answer and follow-up questions from AI responses

### 2. Voice Interaction Hook (`src/hooks/useVoiceInteraction.ts`)
- **Speech Recognition**: Uses browser's native Web Speech API
- **Text-to-Speech**: Uses browser's speechSynthesis API
- **Multi-Language Support**: Dynamic locale switching (en-US, ar-SA, hi-IN)
- **Error Handling**: Browser permission errors, microphone access, network issues
- **State Management**: Tracks listening, speaking, transcript, and errors

**Key Features:**
- Auto-detects browser support for speech APIs
- Graceful fallback error messages
- Cleanup on component unmount
- Dynamic language switching

### 3. AI Tutor Component Integration (`src/components/AITutor.tsx`)
- **Text Chat**: Type questions and get real AI responses
- **Voice Interaction**: Speak questions and hear AI answers
- **Real-time Error Display**: Shows API and voice errors to users
- **Language Switching**: Instantly change interface and AI response language
- **Message History**: Maintains conversation context
- **Listen Button**: Replay any AI response with text-to-speech

**Interaction Flow:**
1. Text Mode: Type → Send → AI responds
2. Voice Mode: Click mic → Speak → AI listens → AI responds → AI speaks answer

### 4. Quiz Module (`src/components/Quiz.tsx`)
- **15 Sample Questions**: 5 questions per language (English, Arabic, Hindi)
- **Real State Management**: Track answers and calculate scores
- **Detailed Results**: Shows percentage, explanations, and review
- **Multi-Language**: Full localization for all text
- **Progress Tracking**: Visual progress bar and question counter
- **Immediate Feedback**: Shows correct/incorrect answers with explanations

**Exam Topics Covered:**
- Teaching methodologies
- Educational psychology
- Assessment strategies
- Learning theories
- Classroom practices

### 5. Environment Configuration
- `.env.example` - Template for required environment variables
- Updated `.env` - Ready for OpenAI API key

## Setup Instructions

### 1. Get OpenAI API Key
1. Go to [OpenAI API Keys](https://platform.openai.com/account/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-`)

### 2. Configure Environment
```bash
# Update .env file with your OpenAI API key
OPENAI_API_KEY=sk-your-actual-key-here
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Feature Usage

### AI Tutor Mode
1. **Text Chat:**
   - Type your exam questions in the text input
   - Press Enter or click Send
   - AI tutor responds with detailed explanations
   - Click "Listen" to hear the response

2. **Voice Chat:**
   - Switch to the "Voice" tab
   - Click the microphone button
   - Speak your question clearly
   - AI listens and responds verbally
   - See recognized text in real-time

### Language Support
- **English**: Default language
- **العربية (Arabic)**: RTL text support, Arabic voice recognition
- **हिन्दी (Hindi)**: Devanagari script support, Hindi speech synthesis

### Quiz Mode
1. Answer 5 questions per language
2. Receive immediate feedback
3. View detailed results with explanations
4. Retake quiz to improve score

## Technical Architecture

### Technology Stack
- **Frontend**: Next.js 14.2.18 (React 18.3.1)
- **Styling**: Tailwind CSS with Radix UI components
- **AI**: OpenAI API (gpt-3.5-turbo)
- **Voice**: Web Speech API (Chrome, Edge, Safari)
- **State Management**: React hooks
- **Database**: Supabase (ready for future integration)

### API Endpoints
- OpenAI: `https://api.openai.com/v1/chat/completions`
- Supabase: Already configured for future user data storage

### File Structure
```
src/
├── components/
│   ├── AITutor.tsx           # Main tutoring interface
│   ├── Quiz.tsx              # Quiz module
│   ├── VoiceInteraction.tsx   # Legacy voice component
│   └── ui/                    # Radix UI components
├── services/
│   └── tutor.ts              # OpenAI integration
├── hooks/
│   └── useVoiceInteraction.ts # Voice API wrapper
└── app/
    ├── page.tsx              # Main page
    └── layout.tsx            # Root layout
```

## Browser Compatibility

### Voice Features Require:
- **Chrome/Chromium**: Full support
- **Edge**: Full support
- **Safari**: Full support (iOS 14.5+)
- **Firefox**: Limited support (Speech Recognition missing)

### Desktop/Mobile:
- Fully responsive design
- Touch-friendly voice buttons
- Mobile-optimized chat interface

## Performance Optimization

1. **AI Responses**: Cached conversation history (last 10 messages)
2. **Voice**: Efficient audio stream processing
3. **UI**: Lazy loading with Suspense boundaries
4. **Bundle**: Optimized with Next.js Code Splitting

## Security Best Practices

1. **API Keys**: Stored in environment variables (not exposed to client)
2. **User Data**: Ready for RLS (Row Level Security) with Supabase
3. **CORS**: Handled by backend API calls
4. **Input Validation**: All user inputs sanitized before API calls

## Future Enhancements

1. **User Authentication**: Supabase Auth integration
2. **Progress Tracking**: Store quiz scores and learning history
3. **Personalized Recommendations**: ML-based topic suggestions
4. **Offline Mode**: Service workers for offline studying
5. **Community Features**: Share quiz results and compete with others
6. **Advanced Analytics**: Track learning patterns and weak areas

## Troubleshooting

### OpenAI API Errors
- **"API key not found"**: Add OPENAI_API_KEY to .env
- **"Quota exceeded"**: Check OpenAI account credit balance
- **"Rate limited"**: Wait a moment and retry

### Voice Recognition Issues
- **"Permission denied"**: Browser blocked microphone access
  - Solution: Allow microphone in browser settings
- **"No speech detected"**: Microphone not working or too quiet
  - Solution: Check microphone is on, speak clearly
- **"Not supported"**: Using unsupported browser
  - Solution: Use Chrome, Edge, or Safari

### Language Issues
- **Wrong language recognition**: Ensure correct language selected before speaking
- **RTL text issues**: Refresh page if alignment looks wrong

## API Response Examples

### Tutor Response Format
```json
{
  "answer": "A good teacher encourages critical thinking and creativity...",
  "followUpQuestions": [
    "What are the key points I should remember?",
    "Can you provide more examples?",
    "How does this relate to other topics?"
  ]
}
```

### Quiz Question Format
```json
{
  "id": "1",
  "question": "Which is a characteristic of a good teacher?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 1,
  "explanation": "A good teacher encourages..."
}
```

## Contributing

To add new features:
1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and test locally
3. Run `npm run build` to verify
4. Submit pull request with description

## License

© 2025 Nukhba AI. All rights reserved.

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify OpenAI API key is valid
3. Ensure microphone permissions are granted
4. Clear browser cache if issues persist

---

**Last Updated**: January 2025
**Version**: 1.0.0 (MVP)
