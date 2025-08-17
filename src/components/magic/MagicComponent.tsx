'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { MagicComponentProps, RecordingStatus } from './types';

export const MagicComponent = ({
  onSend,
  placeholder = 'כתוב הודעה או הקלט קולית...',
  disabled = false,
  className,
}: MagicComponentProps) => {
  const [textValue, setTextValue] = useState('');
  const baseTextRef = useRef('');
  const lastRecognitionTextRef = useRef('');
  const { state: speechState, startRecording, stopRecording, resetError } = useSpeechRecognition();

  // Handle speech recognition results
  useEffect(() => {
    if (speechState.isRecording && speechState.text) {
      // During recording, show preview with interim results
      const newText = baseTextRef.current + (baseTextRef.current ? ' ' : '') + speechState.text;
      setTextValue(newText);
    } else if (!speechState.isRecording && !speechState.isProcessing && speechState.text && speechState.text !== lastRecognitionTextRef.current) {
      // When recording is complete, append final result to base text
      const finalText = baseTextRef.current + (baseTextRef.current ? ' ' : '') + speechState.text;
      setTextValue(finalText);
      baseTextRef.current = finalText;
      lastRecognitionTextRef.current = speechState.text;
    }
  }, [speechState.text, speechState.isRecording, speechState.isProcessing]);

  const getRecordingStatus = (): RecordingStatus => {
    if (speechState.isRecording) return 'recording';
    if (speechState.isProcessing) return 'processing';
    return 'idle';
  };

  const handleMicClick = () => {
    if (disabled) return;
    
    if (speechState.isRecording) {
      stopRecording();
    } else {
      // Set current text as base before starting recording
      baseTextRef.current = textValue;
      lastRecognitionTextRef.current = ''; // Reset the last recognition
      startRecording();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setTextValue(newValue);
    // If not currently recording, update the base text as well
    if (!speechState.isRecording) {
      baseTextRef.current = newValue;
    }
  };

  const handleSend = () => {
    if (textValue.trim() && !disabled) {
      onSend(textValue.trim());
      setTextValue('');
      baseTextRef.current = '';
      lastRecognitionTextRef.current = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const recordingStatus = getRecordingStatus();

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      {/* Error Display */}
      {speechState.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{speechState.error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={resetError}
            className="mr-auto text-xs"
          >
            סגור
          </Button>
        </div>
      )}

      {/* Main Input Area */}
      <div className="relative border border-gray-300 rounded-lg bg-white focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
        {/* Textarea */}
        <textarea
          value={textValue}
          onChange={handleTextChange}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          dir="rtl"
          className={cn(
            'w-full min-h-[120px] p-4 resize-none border-0 rounded-lg',
            'focus:outline-none focus:ring-0',
            'text-right placeholder-gray-400',
            disabled && 'bg-gray-50 cursor-not-allowed'
          )}
        />

        {/* Controls Row */}
        <div className="flex items-center justify-between p-3 border-t border-gray-100">
          {/* Microphone Button */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleMicClick}
              disabled={disabled || !speechState.isSupported}
              size="sm"
              variant="outline"
              className={cn(
                'transition-all duration-200',
                {
                  // Idle state
                  'border-gray-300 hover:border-gray-400': recordingStatus === 'idle',
                  // Recording state
                  'border-red-500 bg-red-50 text-red-600 animate-pulse': recordingStatus === 'recording',
                  // Processing state
                  'border-yellow-500 bg-yellow-50 text-yellow-600': recordingStatus === 'processing',
                }
              )}
            >
              {recordingStatus === 'recording' ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
              {recordingStatus === 'recording' && (
                <span className="text-xs mr-1">עוצר</span>
              )}
              {recordingStatus === 'processing' && (
                <span className="text-xs mr-1">מעבד...</span>
              )}
              {recordingStatus === 'idle' && speechState.isSupported && (
                <span className="text-xs mr-1">הקלט</span>
              )}
            </Button>

            {/* Recording Status Indicator */}
            {recordingStatus !== 'idle' && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  recordingStatus === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'
                )} />
                <span>
                  {recordingStatus === 'recording' ? 'מקליט...' : 'מעבד קול...'}
                </span>
              </div>
            )}

            {/* Browser Support Warning */}
            {!speechState.isSupported && (
              <span className="text-xs text-gray-400">זיהוי קול לא נתמך</span>
            )}
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!textValue.trim() || disabled}
            size="sm"
            className="text-sm"
          >
            <Send className="w-4 h-4 ml-1" />
            שלח
          </Button>
        </div>
      </div>

      {/* Helper Text */}
      <div className="mt-2 text-xs text-gray-500 text-right">
        לחץ Ctrl+Enter לשליחה מהירה
      </div>
    </div>
  );
}; 