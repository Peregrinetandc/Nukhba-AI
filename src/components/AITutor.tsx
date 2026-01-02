"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Mic,
  Send,
  Volume2,
  Languages,
  RotateCcw,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import VoiceInteraction from "./VoiceInteraction";
import FeedbackForm from "./FeedbackForm";
import { sendMessageToTutor } from "@/services/tutor";
import { useVoiceInteraction } from "@/hooks/useVoiceInteraction";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  language: "english" | "arabic" | "hindi";
}

interface AITutorProps {
  language?: "english" | "arabic" | "hindi";
  initialInteractionMode?: "text" | "voice";
  messages?: Message[];
  onLanguageChange?: (language: "english" | "arabic" | "hindi") => void;
}

// Helper function to get the welcome message
function getWelcomeMessage(lang: "english" | "arabic" | "hindi") {
  const messages = {
    english:
      "Hello! I'm your AI tutor. How can I help you with your exam preparation today?",
    arabic:
      "مرحبًا! أنا مدرسك الذكي. كيف يمكنني مساعدتك في التحضير للامتحان اليوم؟",
    hindi:
      "नमस्ते! मैं आपका AI शिक्षक हूं। आज मैं आपकी परीक्षा की तैयारी में कैसे मदद कर सकता हूं?",
  };
  return messages[lang] || messages.english;
}

const AITutor = ({
  language = "english",
  initialInteractionMode = "text",
  messages = [],
  onLanguageChange = () => {},
}: AITutorProps) => {
  const [currentLanguage, setCurrentLanguage] = useState<
    "english" | "arabic" | "hindi"
  >(language);
  const [interactionMode, setInteractionMode] = useState<"text" | "voice">(
    initialInteractionMode,
  );
  const [inputText, setInputText] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>(() =>
    messages.length > 0
      ? messages
      : [
          {
            id: "1",
            content: getWelcomeMessage(currentLanguage),
            sender: "ai",
            timestamp: new Date(),
            language: currentLanguage,
          },
        ],
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const isRTL = currentLanguage === "arabic";

  const {
    isListening,
    isSpeaking,
    transcript,
    error: voiceError,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    resetTranscript,
  } = useVoiceInteraction({
    language: currentLanguage,
  });

  const getLocalizedText = (key: string) => {
    const texts: Record<
      "english" | "arabic" | "hindi",
      Record<string, string>
    > = {
      english: {
        aiTutor: "AI Tutor",
        text: "Text",
        voice: "Voice",
        listen: "Listen",
        typePlaceholder: "Type your question here...",
        processing: "Processing...",
        aiResponse:
          "I understand your question. Here's what you need to know about this topic for your exam preparation...",
        voiceResponse:
          "I heard your question. Here's my response to help with your exam preparation...",
      },
      arabic: {
        aiTutor: "المدرس الذكي",
        text: "نص",
        voice: "صوت",
        listen: "استمع",
        typePlaceholder: "اكتب سؤالك هنا...",
        processing: "جاري المعالجة...",
        aiResponse:
          "أفهم سؤالك. إليك ما تحتاج إلى معرفته حول هذا الموضوع للتحضير للامتحان...",
        voiceResponse: "سمعت سؤالك. إليك ردي للمساعدة في التحضير للامتحان...",
      },
      hindi: {
        aiTutor: "AI शिक्षक",
        text: "टेक्स्ट",
        voice: "आवाज़",
        listen: "सुनें",
        typePlaceholder: "यहाँ अपना प्रश्न टाइप करें...",
        processing: "प्रसंस्करण...",
        aiResponse:
          "मैं आपका प्रश्न समझता हूं। यहाँ है जो आपको इस विषय के बारे में जानना चाहिए परीक्षा की तैयारी के लिए...",
        voiceResponse:
          "मैंने आपका प्रश्न सुना। यहाँ है मेरा उत्तर परीक्षा की तैयारी में मदद के लिए...",
      },
    };
    return texts[currentLanguage]?.[key] || texts.english[key];
  };

  const handleLanguageChange = (value: "english" | "arabic" | "hindi") => {
    setCurrentLanguage(value);
    onLanguageChange(value);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText,
      sender: "user",
      timestamp: new Date(),
      language: currentLanguage,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsProcessing(true);
    setApiError(null);

    try {
      const conversationHistory = chatMessages
        .filter((m) => m.sender !== "ai" || m.id !== "1")
        .slice(-10)
        .map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.content,
        }));

      conversationHistory.push({
        role: "user",
        content: inputText,
      });

      const response = await sendMessageToTutor(
        conversationHistory as any,
        currentLanguage,
      );

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response.answer,
        sender: "ai",
        timestamp: new Date(),
        language: currentLanguage,
      };

      setChatMessages((prevMessages) => [...prevMessages, aiResponse]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to get response from AI tutor";
      setApiError(errorMessage);
      console.error("Send message error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceMessage = async (transcription: string) => {
    if (!transcription.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: transcription,
      sender: "user",
      timestamp: new Date(),
      language: currentLanguage,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);
    setApiError(null);

    try {
      const conversationHistory = chatMessages
        .filter((m) => m.sender !== "ai" || m.id !== "1")
        .slice(-10)
        .map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.content,
        }));

      conversationHistory.push({
        role: "user",
        content: transcription,
      });

      const response = await sendMessageToTutor(
        conversationHistory as any,
        currentLanguage,
      );

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response.answer,
        sender: "ai",
        timestamp: new Date(),
        language: currentLanguage,
      };

      setChatMessages((prevMessages) => [...prevMessages, aiResponse]);

      await speak(response.answer);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to get response from AI tutor";
      setApiError(errorMessage);
      console.error("Voice message error:", error);
    } finally {
      setIsProcessing(false);
      resetTranscript();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    setChatMessages([
      {
        id: Date.now().toString(),
        content: getWelcomeMessage(currentLanguage),
        sender: "ai",
        timestamp: new Date(),
        language: currentLanguage,
      },
    ]);
  };

  useEffect(() => {
    setChatMessages([
      {
        id: "1",
        content: getWelcomeMessage(currentLanguage),
        sender: "ai",
        timestamp: new Date(),
        language: currentLanguage,
      },
    ]);
  }, [currentLanguage]);

  return (
    <Card className="w-full max-w-4xl mx-auto bg-background border shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            {getLocalizedText("aiTutor")}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select
              value={currentLanguage}
              onValueChange={handleLanguageChange as (value: string) => void}
            >
              <SelectTrigger className="w-[130px]">
                <Languages className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="arabic">العربية</SelectItem>
                <SelectItem value="hindi">हिन्दी</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={clearConversation}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {(apiError || voiceError) && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {apiError || voiceError}
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <Tabs
          value={interactionMode}
          onValueChange={setInteractionMode as (value: string) => void}
          className="w-full"
        >
          <div className="border-b px-6 py-2">
            <TabsList className="grid w-full max-w-[400px] grid-cols-2">
              <TabsTrigger value="text">{getLocalizedText("text")}</TabsTrigger>
              <TabsTrigger value="voice">
                {getLocalizedText("voice")}
              </TabsTrigger>
            </TabsList>
          </div>

          <div
            className="h-[500px] overflow-y-auto p-6 scroll-smooth"
            dir={isRTL ? "rtl" : "ltr"}
          >
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex mb-4 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex items-start max-w-[80%]">
                  {message.sender === "ai" && (
                    <Avatar className="mr-2">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=ai-tutor" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <div
                      className={`rounded-lg p-3 slide-up ${
                        message.sender === "user"
                          ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground"
                          : "bg-gradient-to-r from-muted to-muted/80"
                      }`}
                    >
                      {message.content}
                    </div>
                    {message.sender === "ai" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 hover:bg-primary/10"
                        onClick={() => speak(message.content)}
                        disabled={isSpeaking}
                      >
                        <Volume2 className="h-4 w-4 mr-1" />
                        {isSpeaking ? "Speaking..." : getLocalizedText("listen")}
                      </Button>
                    )}
                  </div>
                  {message.sender === "user" && (
                    <Avatar className="ml-2">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
                      <AvatarFallback>You</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start mb-4 slide-up">
                <div className="flex items-start max-w-[80%]">
                  <Avatar className="mr-2">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=ai-tutor" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg p-3 bg-gradient-to-r from-muted to-muted/80">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {getLocalizedText("processing")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t p-4">
            <TabsContent value="text" className="mt-0">
              <div className="flex space-x-2">
                <Input
                  placeholder={getLocalizedText("typePlaceholder")}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  dir={isRTL ? "rtl" : "ltr"}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isProcessing}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="voice" className="mt-0">
              <div className="flex flex-col space-y-4 p-4">
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    onClick={startListening}
                    disabled={isListening || isProcessing || isSpeaking}
                    size="lg"
                    className="rounded-full h-16 w-16"
                  >
                    <Mic className="h-6 w-6" />
                  </Button>
                  {isListening && (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-sm text-muted-foreground">
                        Listening...
                      </span>
                    </div>
                  )}
                  {isSpeaking && (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm text-muted-foreground">
                        Speaking...
                      </span>
                    </div>
                  )}
                </div>

                {transcript && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-semibold text-muted-foreground mb-1">
                      Recognized:
                    </p>
                    <p dir={isRTL ? "rtl" : "ltr"}>{transcript}</p>
                  </div>
                )}

                {transcript && !isListening && !isProcessing && (
                  <Button
                    onClick={() => {
                      handleVoiceMessage(transcript);
                    }}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    Send Response
                  </Button>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AITutor;
