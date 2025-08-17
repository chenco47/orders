export interface MagicComponentProps {
  onSend: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export interface SpeechRecognitionState {
  isRecording: boolean;
  isProcessing: boolean;
  text: string;
  error: string | null;
  isSupported: boolean;
}

export interface SpeechRecognitionHook {
  state: SpeechRecognitionState;
  startRecording: () => void;
  stopRecording: () => void;
  resetError: () => void;
}

export type RecordingStatus = 'idle' | 'recording' | 'processing'; 