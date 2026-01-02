import { useState, useRef, useCallback, useEffect } from "react";

interface UseVoiceInteractionProps {
  language?: "english" | "arabic" | "hindi";
  onTranscription?: (text: string) => void;
  onError?: (error: string) => void;
}

interface UseVoiceInteractionReturn {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  resetTranscript: () => void;
}

const LANGUAGE_CODES: Record<string, string> = {
  english: "en-US",
  arabic: "ar-SA",
  hindi: "hi-IN",
};

export function useVoiceInteraction({
  language = "english",
  onTranscription,
  onError,
}: UseVoiceInteractionProps = {}): UseVoiceInteractionReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const initRecognition = useCallback(() => {
    if (typeof window === "undefined") return null;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const errorMsg =
        "Speech Recognition not supported in this browser. Please use Chrome, Edge, or Safari.";
      setError(errorMsg);
      onError?.(errorMsg);
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = LANGUAGE_CODES[language] || "en-US";

    let finalTranscript = "";

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event: any) => {
      let errorMsg = "An error occurred during speech recognition";

      switch (event.error) {
        case "no-speech":
          errorMsg = "No speech detected. Please try again.";
          break;
        case "audio-capture":
          errorMsg =
            "No microphone found. Ensure your microphone is connected.";
          break;
        case "network":
          errorMsg = "Network error. Please check your connection.";
          break;
        case "permission-denied":
          errorMsg =
            "Microphone access denied. Please allow microphone access in your browser settings.";
          break;
        case "not-allowed":
          errorMsg =
            "Please allow microphone access when prompted by your browser.";
          break;
        default:
          errorMsg = `Speech recognition error: ${event.error}`;
      }

      setError(errorMsg);
      onError?.(errorMsg);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscript.trim()) {
        setTranscript(finalTranscript.trim());
        onTranscription?.(finalTranscript.trim());
      }
    };

    return recognition;
  }, [language, onTranscription, onError]);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition();
    }

    if (!recognitionRef.current) {
      setError("Speech recognition not available");
      return;
    }

    try {
      setTranscript("");
      setError(null);
      recognitionRef.current.start();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to start listening";
      setError(errorMsg);
      onError?.(errorMsg);
    }
  }, [initRecognition, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error("Error stopping recognition:", err);
      }
    }
    setIsListening(false);
  }, []);

  const speak = useCallback(
    async (text: string) => {
      if (typeof window === "undefined") return;

      if (!("speechSynthesis" in window)) {
        const errorMsg = "Text-to-Speech not supported in this browser";
        setError(errorMsg);
        onError?.(errorMsg);
        return;
      }

      try {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = LANGUAGE_CODES[language] || "en-US";
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => {
          setIsSpeaking(true);
          setError(null);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
        };

        utterance.onerror = (event: any) => {
          const errorMsg = `Text-to-Speech error: ${event.error}`;
          setError(errorMsg);
          onError?.(errorMsg);
          setIsSpeaking(false);
        };

        synthesisRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to speak text";
        setError(errorMsg);
        onError?.(errorMsg);
      }
    },
    [language, onError],
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error("Error cleaning up recognition:", err);
        }
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = LANGUAGE_CODES[language] || "en-US";
    }
  }, [language]);

  return {
    isListening,
    isSpeaking,
    transcript,
    error,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    resetTranscript,
  };
}
