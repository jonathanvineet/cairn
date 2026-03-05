// Voice input hook using Web Speech API
import { useEffect, useRef } from "react";
import { useUIStore } from "@/stores/uiStore";

// TypeScript interfaces for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface WebkitSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

// Greek military alphabet
const GREEK_ALPHABET = ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot", "golf", "hotel"];
const INDIAN_CITIES = ["mumbai", "delhi", "chennai", "kolkata", "pune", "hyderabad", "jaipur", "surat"];

// Parse voice input to drone name format
const parseVoiceInput = (text: string): string => {
  const words = text.toLowerCase().split(/\s+/);
  
  // Find Greek letter
  let greekLetter = "alpha";
  for (const word of words) {
    if (GREEK_ALPHABET.includes(word)) {
      greekLetter = word;
      break;
    }
  }
  
  // Find Indian city
  let city = "mumbai";
  for (const word of words) {
    if (INDIAN_CITIES.includes(word)) {
      city = word;
      break;
    }
  }
  
  // Generate random 2-digit number
  const num = Math.floor(Math.random() * 90) + 10;
  
  // Format as "ALPHA-MUMBAI-07"
  return `${greekLetter.toUpperCase()}-${city.toUpperCase()}-${String(num).padStart(2, "0")}`;
};

export function useVoiceInput() {
  const recognitionRef = useRef<WebkitSpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  
  const { voiceInput, startVoiceInput, stopVoiceInput, updateVoiceInterim, updateVoiceFinal, setVoiceVolume } = useUIStore();
  
  useEffect(() => {
    // Check if Web Speech API is available
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as unknown as { webkitSpeechRecognition: new () => WebkitSpeechRecognition }).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";
      
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";
        let finalTranscript = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (interimTranscript) {
          updateVoiceInterim(interimTranscript);
        }
        
        if (finalTranscript) {
          const droneName = parseVoiceInput(finalTranscript);
          updateVoiceFinal(droneName);
          stopVoiceInput();
        }
      };
      
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        stopVoiceInput();
      };
      
      recognitionRef.current.onend = () => {
        stopVoiceInput();
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopVoiceInput, updateVoiceInterim, updateVoiceFinal]);
  
  const start = async () => {
    if (!recognitionRef.current) {
      console.error("Speech recognition not available");
      return;
    }
    
    try {
      // Start audio context for volume visualization
      if (!audioContextRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContextRef.current = new AudioContext();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        source.connect(analyserRef.current);
        
        // Start volume monitoring
        const updateVolume = () => {
          if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            setVoiceVolume(average / 255);
          }
          animationFrameRef.current = requestAnimationFrame(updateVolume);
        };
        updateVolume();
      }
      
      startVoiceInput();
      recognitionRef.current.start();
    } catch (error) {
      console.error("Failed to start voice input:", error);
    }
  };
  
  const stop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    stopVoiceInput();
  };
  
  return {
    isListening: voiceInput.isListening,
    interimText: voiceInput.interimText,
    finalText: voiceInput.finalText,
    volume: voiceInput.volume,
    start,
    stop,
  };
}
