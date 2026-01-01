"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Mic, MicOff, Play, Square, Volume2, Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface VoiceInteractionProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
  onLanguageChange?: (language: "english" | "arabic" | "hindi") => void;
  isListening?: boolean;
  aiResponseAudio?: string;
  language?: "english" | "arabic" | "hindi";
}

const VoiceInteraction = ({
  onRecordingComplete = () => {},
  onLanguageChange = () => {},
  isListening = false,
  aiResponseAudio = "",
  language = "english",
}: VoiceInteractionProps) => {
  const isRTL = language === "arabic";

  const getLocalizedText = (key: string) => {
    const texts: Record<
      "english" | "arabic" | "hindi",
      Record<string, string>
    > = {
      english: {
        recording: "Recording...",
        tapToSpeak: "Tap to speak",
        autoPlay: "Auto-play responses",
        language: "Language",
      },
      arabic: {
        recording: "جاري التسجيل...",
        tapToSpeak: "اضغط للتحدث",
        autoPlay: "تشغيل تلقائي للردود",
        language: "اللغة",
      },
      hindi: {
        recording: "रिकॉर्डिंग...",
        tapToSpeak: "बोलने के लिए टैप करें",
        autoPlay: "स्वचालित उत्तर प्लेबैक",
        language: "भाषा",
      },
    };
    return texts[language]?.[key] || texts.english[key];
  };
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([70]);
  const [autoPlay, setAutoPlay] = useState(true);
  const [visualizerData, setVisualizerData] = useState<number[]>(
    Array(20).fill(5),
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Simulate voice visualization when recording
  useEffect(() => {
    if (isRecording) {
      const updateVisualizer = () => {
        const newData = visualizerData.map(
          () => Math.floor(Math.random() * 40) + 5,
        );
        setVisualizerData(newData);
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      setVisualizerData(Array(20).fill(5));
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording, visualizerData]);

  // Handle audio playback
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  // Auto-play AI response when received
  useEffect(() => {
    if (aiResponseAudio && autoPlay && audioRef.current) {
      audioRef.current.src = aiResponseAudio;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error("Error playing audio:", error);
        });
    }
  }, [aiResponseAudio, autoPlay]);

  const handleRecordToggle = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);

      try {
        // Simulate processing with potential failure
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // 5% chance of processing failure
            if (Math.random() < 0.05) {
              reject(new Error("Audio processing failed"));
            } else {
              resolve(null);
            }
          }, 1000);
        });

        // Create a mock audio blob
        const mockBlob = new Blob(["audio data"], { type: "audio/wav" });
        onRecordingComplete(mockBlob);
      } catch (error) {
        console.error("Voice recording error:", error);
        // Could show error toast here
      }
    } else {
      // Start recording
      setIsRecording(true);
    }
  };

  const handlePlayToggle = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <Card
      className={`w-full p-4 bg-background border rounded-xl shadow-sm ${isRTL ? "rtl" : "ltr"}`}
    >
      <div className="flex flex-col space-y-4">
        {/* Voice Visualizer */}
        <div className="flex items-center justify-center h-16 bg-gradient-to-r from-muted/20 to-muted/40 rounded-lg overflow-hidden">
          <div className="flex items-end h-full space-x-1 px-2">
            {visualizerData.map((height, index) => (
              <div
                key={index}
                className={`w-1.5 rounded-t-sm transition-all duration-200 ${
                  isRecording
                    ? "bg-gradient-to-t from-primary to-primary/60 voice-bar"
                    : "bg-muted"
                }`}
                style={{
                  height: `${height}%`,
                  animationDelay: `${index * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="icon"
              onClick={handleRecordToggle}
              className="rounded-full h-12 w-12"
            >
              {isRecording ? (
                <Square className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
            <div className="text-sm font-medium">
              {isRecording
                ? getLocalizedText("recording")
                : getLocalizedText("tapToSpeak")}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePlayToggle}
              disabled={!aiResponseAudio}
              className="rounded-full h-10 w-10"
            >
              {isPlaying ? (
                <Square className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <div className="flex items-center space-x-2 w-32">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Language and Settings */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t">
          <div className="flex items-center space-x-2">
            <Languages className="h-4 w-4 text-muted-foreground" />
            <Select
              value={language}
              onValueChange={(value) =>
                onLanguageChange(value as "english" | "arabic" | "hindi")
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="arabic">العربية</SelectItem>
                <SelectItem value="hindi">हिन्दी</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="auto-play"
              checked={autoPlay}
              onCheckedChange={setAutoPlay}
            />
            <Label htmlFor="auto-play" className="text-sm">
              {getLocalizedText("autoPlay")}
            </Label>
          </div>
        </div>
      </div>

      {/* Hidden audio element for playback */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        style={{ display: "none" }}
      />
    </Card>
  );
};

export default VoiceInteraction;
