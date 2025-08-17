'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { SpeechRecognitionState, SpeechRecognitionHook } from '../types';

// TypeScript declarations for Web Speech API
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// Extend the Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: {
      new (): ISpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): ISpeechRecognition;
    };
  }
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [state, setState] = useState<SpeechRecognitionState>({
    isRecording: false,
    isProcessing: false,
    text: '',
    error: null,
    isSupported: false,
  });

  const currentRecognitionRef = useRef<string>('');

  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // Check if Speech Recognition is supported
  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    setState(prev => ({
      ...prev,
      isSupported: !!SpeechRecognitionClass,
    }));

    if (SpeechRecognitionClass) {
      const recognition = new SpeechRecognitionClass();
      
      // Configure recognition
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'he-IL'; // Hebrew
      recognition.maxAlternatives = 1;

      // Event handlers
      recognition.onstart = () => {
        currentRecognitionRef.current = '';
        setState(prev => ({
          ...prev,
          isRecording: true,
          isProcessing: false,
          error: null,
          text: '', // Clear text for new recognition
        }));
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const lastResult = event.results[event.results.length - 1];
        const transcript = lastResult[0].transcript;
        const isFinal = lastResult.isFinal;

        currentRecognitionRef.current = transcript;

        setState(prev => ({
          ...prev,
          text: transcript,
          isProcessing: !isFinal,
        }));
      };

      recognition.onend = () => {
        setState(prev => ({
          ...prev,
          isRecording: false,
          isProcessing: false,
        }));
        
        // Clear the text after a short delay to allow the final result to be processed
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            text: '',
          }));
        }, 100);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        let errorMessage = 'שגיאה בזיהוי קול';
        
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'נדרשת הרשאה לשימוש במיקרופון';
            break;
          case 'no-speech':
            errorMessage = 'לא זוהה דיבור';
            break;
          case 'audio-capture':
            errorMessage = 'בעיה בגישה למיקרופון';
            break;
          case 'network':
            errorMessage = 'בעיית רשת';
            break;
        }

        setState(prev => ({
          ...prev,
          isRecording: false,
          isProcessing: false,
          error: errorMessage,
        }));
      };

      recognitionRef.current = recognition;
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startRecording = useCallback(() => {
    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: 'הדפדפן לא תומך בזיהוי קול',
      }));
      return;
    }

    if (recognitionRef.current && !state.isRecording) {
      currentRecognitionRef.current = '';
      setState(prev => ({
        ...prev,
        text: '',
        error: null,
      }));
      
      try {
        recognitionRef.current.start();
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'שגיאה בהפעלת זיהוי קול',
        }));
      }
    }
  }, [state.isSupported, state.isRecording]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && state.isRecording) {
      recognitionRef.current.stop();
    }
  }, [state.isRecording]);

  const resetError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    state,
    startRecording,
    stopRecording,
    resetError,
  };
}; 