"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Volume2,
} from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizProps {
  language?: "english" | "arabic" | "hindi";
  onComplete?: (score: number, total: number) => void;
}

const SAMPLE_QUESTIONS: Record<string, QuizQuestion[]> = {
  english: [
    {
      id: "1",
      question: "Which of the following is a characteristic of a good teacher?",
      options: [
        "Only uses textbooks without innovation",
        "Encourages critical thinking and creativity",
        "Focuses only on rote learning",
        "Discourages student participation",
      ],
      correctAnswer: 1,
      explanation:
        "A good teacher encourages critical thinking and creativity in students, helping them learn beyond just memorizing facts.",
    },
    {
      id: "2",
      question: "What is the primary goal of formative assessment?",
      options: [
        "Assign final grades to students",
        "Provide feedback for improvement during the learning process",
        "Eliminate low-performing students",
        "Compare students with each other",
      ],
      correctAnswer: 1,
      explanation:
        "Formative assessment is meant to provide ongoing feedback to help students improve their learning throughout the course.",
    },
    {
      id: "3",
      question:
        "Which learning theory emphasizes the importance of social interaction?",
      options: [
        "Behaviorism",
        "Cognitivism",
        "Constructivism",
        "Connectivism",
      ],
      correctAnswer: 2,
      explanation:
        "Constructivism emphasizes that learning is an active process where learners construct knowledge through interaction with their environment and others.",
    },
    {
      id: "4",
      question: "What does 'differentiated instruction' mean?",
      options: [
        "Teaching the same content the same way to all students",
        "Tailoring instruction to meet the diverse needs and learning styles of students",
        "Separating students based on ability groups permanently",
        "Using only advanced teaching techniques",
      ],
      correctAnswer: 1,
      explanation:
        "Differentiated instruction involves adapting teaching methods to address the diverse needs, readiness levels, and learning preferences of individual students.",
    },
    {
      id: "5",
      question:
        "Which of the following best describes Bloom's Taxonomy (revised)?",
      options: [
        "A list of all teaching methods available",
        "A framework for categorizing cognitive levels from lower-order to higher-order thinking",
        "A grading system for schools",
        "A set of rules for classroom management",
      ],
      correctAnswer: 1,
      explanation:
        "Bloom's Taxonomy provides a framework for organizing learning objectives from simple (remember) to complex (create) cognitive levels.",
    },
  ],
  arabic: [
    {
      id: "1",
      question: "ما هي خصائص المعلم الجيد؟",
      options: [
        "يستخدم الكتب المدرسية فقط دون ابتكار",
        "يشجع التفكير الناقد والإبداع",
        "يركز على الحفظ الآلي فقط",
        "يثبط مشاركة الطلاب",
      ],
      correctAnswer: 1,
      explanation: "المعلم الجيد يشجع التفكير الناقد والإبداع لدى الطلاب.",
    },
    {
      id: "2",
      question: "ما هو الهدف الأساسي للتقويم التكويني؟",
      options: [
        "إعطاء الدرجات النهائية للطلاب",
        "تقديم تغذية راجعة للتحسن أثناء عملية التعلم",
        "إزالة الطلاب منخفضي الأداء",
        "مقارنة الطلاب مع بعضهم البعض",
      ],
      correctAnswer: 1,
      explanation:
        "التقويم التكويني يهدف إلى تقديم تغذية راجعة مستمرة لمساعدة الطلاب على التحسن.",
    },
    {
      id: "3",
      question: "أي نظرية تعليمية تؤكد على أهمية التفاعل الاجتماعي؟",
      options: [
        "السلوكية",
        "المعرفية",
        "البنائية",
        "الاتصالية",
      ],
      correctAnswer: 2,
      explanation:
        "النظرية البنائية تؤكد على أن التعلم عملية نشطة حيث يبني المتعلمون المعرفة من خلال التفاعل مع بيئتهم.",
    },
    {
      id: "4",
      question: "ماذا يعني التدريس المتمايز؟",
      options: [
        "تدريس نفس المحتوى بنفس الطريقة لجميع الطلاب",
        "تكييف التدريس لتلبية احتياجات الطلاب المتنوعة",
        "فصل الطلاب بناءً على القدرات بشكل دائم",
        "استخدام تقنيات تدريس متقدمة فقط",
      ],
      correctAnswer: 1,
      explanation:
        "التدريس المتمايز يعني تكييف طرق التدريس لتلبية احتياجات وأساليب التعلم المختلفة للطلاب.",
    },
    {
      id: "5",
      question: "ما الذي يصف تصنيف بلوم للأهداف التعليمية المراجع؟",
      options: [
        "قائمة بجميع طرق التدريس المتاحة",
        "إطار عمل لتصنيف مستويات التفكير من الأدنى إلى الأعلى",
        "نظام تقييم للمدارس",
        "مجموعة من قواعد إدارة الفصل الدراسي",
      ],
      correctAnswer: 1,
      explanation:
        "تصنيف بلوم يوفر إطار عمل لتنظيم الأهداف التعليمية من البسيط إلى المعقد.",
    },
  ],
  hindi: [
    {
      id: "1",
      question: "एक अच्छे शिक्षक की विशेषता क्या है?",
      options: [
        "केवल पाठ्यपुस्तकों का उपयोग करना",
        "आलोचनात्मक सोच और रचनात्मकता को प्रोत्साहित करना",
        "केवल रटने पर ध्यान देना",
        "छात्र भागीदारी को हतोत्साहित करना",
      ],
      correctAnswer: 1,
      explanation:
        "एक अच्छा शिक्षक छात्रों में आलोचनात्मक सोच और रचनात्मकता को प्रोत्साहित करता है।",
    },
    {
      id: "2",
      question: "निर्माणात्मक मूल्यांकन का प्राथमिक लक्ष्य क्या है?",
      options: [
        "अंतिम ग्रेड निर्धारित करना",
        "सीखने की प्रक्रिया में सुधार के लिए प्रतिक्रिया देना",
        "कम प्रदर्शन करने वाले छात्रों को हटाना",
        "छात्रों की तुलना करना",
      ],
      correctAnswer: 1,
      explanation:
        "निर्माणात्मक मूल्यांकन छात्रों को सीखने में सुधार करने में मदद करता है।",
    },
    {
      id: "3",
      question: "कौन सा सिद्धांत सामाजिक मिथ्या क्रिया पर बल देता है?",
      options: [
        "आचरणवाद",
        "संज्ञानात्मकता",
        "रचनावाद",
        "कनेक्टिविज्म",
      ],
      correctAnswer: 2,
      explanation:
        "रचनावाद पर जोर देता है कि सीखना एक सक्रिय प्रक्रिया है।",
    },
    {
      id: "4",
      question: "विभेदित निर्देश का अर्थ क्या है?",
      options: [
        "सभी छात्रों को एक ही तरीके से पढ़ाना",
        "छात्रों की विविध जरूरतों को पूरा करना",
        "क्षमता के आधार पर छात्रों को अलग करना",
        "केवल उन्नत तकनीकें का उपयोग करना",
      ],
      correctAnswer: 1,
      explanation:
        "विभेदित निर्देश विभिन्न छात्रों की आवश्यकताओं को पूरा करने का प्रयास है।",
    },
    {
      id: "5",
      question: "ब्लूम की संशोधित वर्गीकरण क्या वर्णित करती है?",
      options: [
        "सभी शिक्षण विधियों की सूची",
        "सोच के स्तरों की एक संरचना",
        "स्कूलों के लिए एक ग्रेडिंग सिस्टम",
        "कक्षा प्रबंधन के नियम",
      ],
      correctAnswer: 1,
      explanation:
        "ब्लूम की वर्गीकरण सोच के विभिन्न स्तरों को दर्शाती है।",
    },
  ],
};

const Quiz = ({ language = "english", onComplete }: QuizProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, number>
  >({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const isRTL = language === "arabic";

  const questions = SAMPLE_QUESTIONS[language] || SAMPLE_QUESTIONS.english;
  const currentQuestion = questions[currentQuestionIndex];

  const getLocalizedText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      english: {
        quiz: "Quiz",
        question: "Question",
        of: "of",
        selectAnswer: "Select an answer",
        next: "Next",
        submit: "Submit Quiz",
        results: "Quiz Results",
        yourScore: "Your Score",
        excellent: "Excellent!",
        good: "Good Job!",
        passing: "Passing Score!",
        tryAgain: "Keep Studying!",
        retake: "Retake Quiz",
        explanation: "Explanation",
        correctAnswer: "Correct!",
        incorrectAnswer: "Incorrect",
        review: "Review Your Answers",
      },
      arabic: {
        quiz: "الاختبار",
        question: "السؤال",
        of: "من",
        selectAnswer: "اختر إجابة",
        next: "التالي",
        submit: "إرسال الاختبار",
        results: "نتائج الاختبار",
        yourScore: "درجتك",
        excellent: "ممتاز!",
        good: "عمل جيد!",
        passing: "نجاح!",
        tryAgain: "استمر في الدراسة!",
        retake: "إعادة الاختبار",
        explanation: "التفسير",
        correctAnswer: "صحيح!",
        incorrectAnswer: "غير صحيح",
        review: "راجع إجاباتك",
      },
      hindi: {
        quiz: "क्विज",
        question: "प्रश्न",
        of: "का",
        selectAnswer: "एक उत्तर चुनें",
        next: "आगे",
        submit: "क्विज जमा करें",
        results: "परिणाम",
        yourScore: "आपका स्कोर",
        excellent: "उत्कृष्ट!",
        good: "अच्छा काम!",
        passing: "उत्तीर्ण!",
        tryAgain: "अध्ययन जारी रखें!",
        retake: "क्विज दोबारा लें",
        explanation: "व्याख्या",
        correctAnswer: "सही!",
        incorrectAnswer: "गलत",
        review: "अपने उत्तरों की समीक्षा करें",
      },
    };
    return texts[language]?.[key] || texts.english[key];
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResults(true);
    onComplete?.(correctCount, questions.length);
  };

  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const scorePercentage = (score / questions.length) * 100;

  if (showResults) {
    const getResultMessage = () => {
      if (scorePercentage >= 90) return getLocalizedText("excellent");
      if (scorePercentage >= 80) return getLocalizedText("good");
      if (scorePercentage >= 60) return getLocalizedText("passing");
      return getLocalizedText("tryAgain");
    };

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            {getLocalizedText("results")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10">
              <span className="text-4xl font-bold text-primary">
                {Math.round(scorePercentage)}%
              </span>
            </div>
            <p className="text-2xl font-bold">{getResultMessage()}</p>
            <p className="text-lg text-muted-foreground">
              {getLocalizedText("yourScore")}: {score} /{" "}
              {questions.length}
            </p>
          </div>

          <Progress value={scorePercentage} className="h-2" />

          <div className="space-y-4">
            <h3 className="font-semibold">{getLocalizedText("review")}</h3>
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 border rounded-lg space-y-2"
                dir={isRTL ? "rtl" : "ltr"}
              >
                <div className="flex items-start gap-2">
                  {selectedAnswers[q.id] === q.correctAnswer ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">
                      {idx + 1}. {q.question}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {getLocalizedText(
                        selectedAnswers[q.id] === q.correctAnswer
                          ? "correctAnswer"
                          : "incorrectAnswer",
                      )}{" "}
                      - {q.options[q.correctAnswer]}
                    </p>
                    {q.explanation && (
                      <p className="text-sm mt-2 p-2 bg-muted rounded">
                        <span className="font-semibold">
                          {getLocalizedText("explanation")}:
                        </span>{" "}
                        {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleRetake} className="w-full">
            {getLocalizedText("retake")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{getLocalizedText("quiz")}</CardTitle>
          <span className="text-sm text-muted-foreground">
            {currentQuestionIndex + 1} {getLocalizedText("of")}{" "}
            {questions.length}
          </span>
        </div>
        <Progress
          value={((currentQuestionIndex + 1) / questions.length) * 100}
          className="mt-4 h-2"
        />
      </CardHeader>
      <CardContent className="space-y-6">
        <div dir={isRTL ? "rtl" : "ltr"} className="space-y-4">
          <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>

          <RadioGroup
            value={
              selectedAnswers[currentQuestion.id]?.toString() || ""
            }
            onValueChange={(value) =>
              handleAnswerSelect(parseInt(value))
            }
          >
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedAnswers[currentQuestion.id] === index
                      ? "bg-primary/10 border-primary"
                      : "border-muted hover:border-primary/50"
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  <RadioGroupItem
                    value={index.toString()}
                    id={`option-${index}`}
                  />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleNext}
            disabled={
              selectedAnswers[currentQuestion.id] === undefined ||
              currentQuestionIndex === questions.length - 1
            }
            variant="outline"
            className="flex-1"
          >
            {getLocalizedText("next")}
          </Button>
          {currentQuestionIndex === questions.length - 1 && (
            <Button
              onClick={handleSubmit}
              disabled={answeredCount < questions.length}
              className="flex-1"
            >
              {getLocalizedText("submit")}
            </Button>
          )}
        </div>

        {answeredCount < questions.length && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {questions.length - answeredCount} remaining questions to answer
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default Quiz;
