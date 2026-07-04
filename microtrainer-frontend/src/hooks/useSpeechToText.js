import { useCallback, useEffect, useRef, useState } from "react";

const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export const speechToTextSupported = Boolean(SpeechRecognitionAPI);

/**
 * Wraps the browser's SpeechRecognition API into start/stop handlers that
 * append finalized transcript chunks onto whatever text the caller already has.
 */
export function useSpeechToText({ getBaseText, onTranscript, disabled }) {
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const recognitionRef = useRef(null);
  const baseTextRef = useRef("");

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const startRecording = useCallback(() => {
    if (!SpeechRecognitionAPI || disabled) return;
    setVoiceError("");

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    const base = getBaseText ? getBaseText() : "";
    baseTextRef.current = base.trim() ? base.trim() + " " : "";

    recognition.onresult = (event) => {
      let finalChunk = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalChunk += transcript + " ";
        } else {
          interim += transcript;
        }
      }
      if (finalChunk) {
        baseTextRef.current += finalChunk;
        onTranscript(baseTextRef.current.trim());
      }
      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setVoiceError("Microphone access was denied. Allow mic access and try again.");
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        setVoiceError("Voice input hit an error. You can keep typing instead.");
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimText("");
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [disabled, getBaseText, onTranscript]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return {
    supported: speechToTextSupported,
    isRecording,
    interimText,
    voiceError,
    startRecording,
    stopRecording,
    stopIfRecording: stopRecording,
  };
}
