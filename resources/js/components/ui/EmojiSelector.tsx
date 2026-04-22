import { useState, useRef, useEffect } from 'react';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';
import { Button } from '@/components/ui';
import { Smile } from 'lucide-react';

interface EmojiSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function EmojiSelector({ value, onChange }: EmojiSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    onChange(emojiData.emoji);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="flex gap-2">
        <div className="w-12 h-10 flex items-center justify-center text-2xl border rounded-md bg-gray-50">
          {value || '❓'}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex gap-2 items-center"
        >
          <Smile className="w-4 h-4" />
          Select Emoji
        </Button>
      </div>
      
      {isOpen && (
        <div className="absolute z-50 mt-2">
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}
    </div>
  );
}
