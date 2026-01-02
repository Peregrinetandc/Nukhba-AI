interface TutorMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface TutorResponse {
  answer: string;
  followUpQuestions: string[];
}

const SYSTEM_PROMPT = {
  english: `You are a friendly, patient exam tutor specializing in helping students prepare for competitive exams like UGC NET, UPSC, and entrance tests.

Your role is to:
1. Explain complex concepts in simple, easy-to-understand language
2. Use real-world examples when relevant
3. Break down difficult topics into smaller parts
4. Suggest related topics to study
5. Encourage the student and build their confidence

Always provide clear, structured responses. When answering questions:
- Start with a direct answer
- Explain the "why" behind the answer
- Give examples if helpful
- Suggest 2-3 follow-up questions the student might find useful

Keep your tone warm, encouraging, and conversational.`,

  arabic: `أنت مدرس ودود وصبور متخصص في مساعدة الطلاب على التحضير للامتحانات التنافسية مثل شهادة اللغة العربية والاختبارات الأخرى.

دورك هو:
1. شرح المفاهيم المعقدة بلغة بسيطة وسهلة الفهم
2. استخدام أمثلة من الحياة الواقعية عند الضرورة
3. تقسيم الموضوعات الصعبة إلى أجزاء أصغر
4. اقتراح موضوعات ذات صلة للدراسة
5. تشجيع الطالب وبناء ثقته بنفسه

قدم دائمًا ردودًا واضحة ومنظمة. عند الإجابة على الأسئلة:
- ابدأ بإجابة مباشرة
- اشرح "السبب" وراء الإجابة
- قدم أمثلة إن لزم الأمر
- اقترح 2-3 أسئلة متابعة قد يجدها الطالب مفيدة

حافظ على نبرة دافئة وتشجيعية وودية.`,

  hindi: `आप एक मित्रवत और धैर्यवान परीक्षा शिक्षक हैं जो UGC NET, UPSC और अन्य प्रवेश परीक्षाओं की तैयारी में छात्रों की मदद करने में माहिर हैं।

आपकी भूमिका है:
1. जटिल अवधारणाओं को सरल, समझने में आसान भाषा में समझाना
2. जब प्रासंगिक हो तो वास्तविक दुनिया के उदाहरण का उपयोग करना
3. कठिन विषयों को छोटे भागों में विभाजित करना
4. अध्ययन के लिए संबंधित विषयों का सुझाव देना
5. छात्र को प्रोत्साहित करना और उनका आत्मविश्वास बढ़ाना

हमेशा स्पष्ट, संरचित प्रतिक्रियाएं प्रदान करें। प्रश्नों का उत्तर देते समय:
- सीधे उत्तर से शुरू करें
- उत्तर के पीछे का "कारण" समझाएं
- यदि मददगार हो तो उदाहरण दें
- 2-3 अनुवर्ती प्रश्नों का सुझाव दें जो छात्र को उपयोगी लग सकते हैं

गर्म, प्रोत्साहक और बातचीत का स्वर बनाए रखें।`,
};

export async function sendMessageToTutor(
  messages: TutorMessage[],
  language: "english" | "arabic" | "hindi" = "english",
): Promise<TutorResponse> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OpenAI API key not found. Please set OPENAI_API_KEY environment variable.",
    );
  }

  const systemPrompt = SYSTEM_PROMPT[language];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `OpenAI API error: ${error.error?.message || "Unknown error"}`,
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";

    const tutorResponse = parseAIResponse(content);

    return tutorResponse;
  } catch (error) {
    console.error("Tutor service error:", error);
    throw error;
  }
}

function parseAIResponse(content: string): TutorResponse {
  const lines = content.split("\n").filter((line) => line.trim());

  let answer = "";
  const followUpQuestions: string[] = [];

  let isInFollowUpSection = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (
      trimmedLine.toLowerCase().includes("follow-up") ||
      trimmedLine.toLowerCase().includes("questions") ||
      trimmedLine.startsWith("Q:") ||
      /^\d+\.\s*\?/.test(trimmedLine)
    ) {
      isInFollowUpSection = true;
      continue;
    }

    if (isInFollowUpSection) {
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        const questionText = trimmedLine.replace(/^[\d\.\-\*]\s*/, "").trim();
        if (questionText) {
          followUpQuestions.push(questionText);
        }
      }
    } else {
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        answer += (answer ? " " : "") + trimmedLine;
      }
    }
  }

  if (!answer) {
    answer = content;
  }

  if (followUpQuestions.length === 0) {
    followUpQuestions.push(
      "What are the key points I should remember?",
      "Can you provide more examples?",
      "How does this relate to other topics?",
    );
  }

  return {
    answer: answer.trim(),
    followUpQuestions: followUpQuestions.slice(0, 3),
  };
}

export async function generateExamQuestions(
  topic: string,
  language: "english" | "arabic" | "hindi" = "english",
  count: number = 5,
): Promise<
  Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
  }>
> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OpenAI API key not found. Please set OPENAI_API_KEY environment variable.",
    );
  }

  const systemPrompt = `Generate ${count} multiple choice questions on the topic "${topic}" in ${language} suitable for exam preparation.
Format each question as JSON with fields: id, question, options (array of 4 strings), correctAnswer (0-3 index).`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: systemPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `OpenAI API error: ${error.error?.message || "Unknown error"}`,
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "[]";

    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const questions = JSON.parse(jsonMatch ? jsonMatch[0] : "[]");
      return questions;
    } catch {
      console.error("Failed to parse questions JSON:", content);
      return [];
    }
  } catch (error) {
    console.error("Generate questions error:", error);
    throw error;
  }
}
