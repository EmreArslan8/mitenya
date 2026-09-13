'use client';

import type { ChangeEvent, KeyboardEvent } from 'react';
import { CloseIcon } from '@/components/icons';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

const MAX_USER_MESSAGES = 20;
const MAX_QUESTION_LENGTH = 500;
const TYPING_BASE_DELAY_MS = 58;
const SUGGESTED_QUESTIONS = [
  'Bu ürün bana uygun mu?',
  'Nasıl kullanmalıyım?',
  'İçeriği ne işe yarar?',
];
const INITIAL_ASSISTANT_TEXT =
  'Merhaba, ben bu ürün için yapay zeka alışveriş asistanınızım. Size nasıl yardımcı olabilirim?';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
  animated?: boolean;
};

type ProductShopAssistantPanelProps = {
  productId: string;
  onClose: () => void;
};

function formatTime(): string {
  return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function createMessage(role: Message['role'], text: string, animated?: boolean): Message {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
    time: formatTime(),
    animated,
  };
}

function createInitialAssistantMessage(): Message {
  return { ...createMessage('assistant', INITIAL_ASSISTANT_TEXT), id: 'assistant-initial' };
}

function splitTextForTyping(text: string) {
  return text.match(/\S+\s*|\n/g) ?? [text];
}

function getTypingDelay(chunk: string): number {
  const trimmed = chunk.trim();
  if (!trimmed) return TYPING_BASE_DELAY_MS;
  if (/[.!?]$/.test(trimmed)) return 240;
  if (/[,:;]$/.test(trimmed)) return 150;
  if (trimmed.length <= 3) return 72;
  return Math.min(135, TYPING_BASE_DELAY_MS + trimmed.length * 5);
}

const MessageBubble = memo(function MessageBubble({
  message,
  isLast,
}: {
  message: Message;
  isLast: boolean;
}) {
  const isUser = message.role === 'user';
  const animate = !!message.animated;
  const [visibleText, setVisibleText] = useState(animate ? '' : message.text);

  const scrollRef = useCallback((node: HTMLDivElement | null) => {
    node?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!animate) {
      setVisibleText(message.text);
      return;
    }

    const chunks = splitTextForTyping(message.text);
    let cancelled = false;
    let chunkIndex = 0;
    let timeoutId: number | null = null;

    setVisibleText('');

    const revealNextChunk = () => {
      if (cancelled || chunkIndex >= chunks.length) return;
      const nextChunk = chunks[chunkIndex];
      chunkIndex += 1;
      setVisibleText((prev) => prev + nextChunk);
      if (chunkIndex >= chunks.length) return;
      timeoutId = window.setTimeout(revealNextChunk, getTypingDelay(nextChunk));
    };

    timeoutId = window.setTimeout(revealNextChunk, TYPING_BASE_DELAY_MS);

    return () => {
      cancelled = true;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [animate, message.text]);

  const showCaret = animate && visibleText.length < message.text.length;

  return (
    <div
      className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
      ref={isLast ? scrollRef : undefined}
    >
      <div className="flex max-w-[85%] flex-col gap-1">
        <div className={cn('flex items-center gap-1.5 text-xs leading-none text-text-secondary', isUser ? 'justify-end' : 'justify-start')}>
          <span className="text-xs font-medium text-text-secondary">
            {isUser ? 'Ben' : 'Mitenya Yapay Zeka'}
          </span>
          <span className="text-xs text-text-secondary">
            {message.time}
          </span>
        </div>
        <div className={cn('whitespace-pre-wrap break-words px-3 py-2.5', isUser ? 'rounded-[18px_18px_6px_18px] bg-primary-gradient text-white shadow-[0_10px_24px_rgba(0,0,0,0.12)]' : 'rounded-[18px_18px_18px_6px] border border-gray-200 bg-white/90 text-text shadow-[0_12px_24px_rgba(17,24,39,0.05)]')}>
          {visibleText}
          {showCaret && <span className="ml-0.5 inline-block h-[1em] w-2 animate-[product-qa-caret_.9s_steps(1)_infinite] rounded-full bg-current align-text-bottom" />}
        </div>
      </div>
    </div>
  );
});

function LoadingBubble() {
  const [time] = useState(formatTime);

  return (
    <div className="flex justify-start">
      <div className="flex max-w-[85%] flex-col gap-1">
        <div className="flex items-center justify-start gap-1.5 text-xs leading-none text-text-secondary">
          <span className="text-xs font-medium">
            Mitenya Yapay Zeka
          </span>
          <span className="text-xs">
            {time}
          </span>
        </div>
        <div className="rounded-[18px_18px_18px_6px] border border-gray-200 bg-white/90 px-3 py-2.5 text-text shadow-[0_12px_24px_rgba(17,24,39,0.05)]">
          <span className="inline-flex min-h-[18px] items-center gap-1">
            {[0, 1, 2].map((index) => <span key={index} className="size-2 animate-[product-qa-dots_1.2s_ease-in-out_infinite] rounded-full bg-text-secondary opacity-35" style={{ animationDelay: `${index * 0.18}s` }} />)}
          </span>
        </div>
      </div>
    </div>
  );
}

const ProductShopAssistantPanel = ({ productId, onClose }: ProductShopAssistantPanelProps) => {
  const [initialMessage] = useState(createInitialAssistantMessage);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const isLimitReached = userMessageCount >= MAX_USER_MESSAGES;

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const sendQuestion = useCallback(
    async (rawQuestion: string) => {
      const question = rawQuestion.trim();
      if (!question || loading || isLimitReached) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setMessages((prev) => [...prev, createMessage('user', question)]);
      setInput('');
      setLoading(true);
      setUserMessageCount((c) => c + 1);

      try {
        const response = await fetch('/api/product-qa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            productId,
            sessionMessageCount: userMessageCount + 1,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error?.error?.message ?? 'Bir hata olustu');
        }

        const json = await response.json();
        const answer = json.data?.answer ?? json.answer ?? 'Yanit alinamadi.';
        setMessages((prev) => [...prev, createMessage('assistant', answer, true)]);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setMessages((prev) => [
          ...prev,
          createMessage('assistant', 'Bir hata olustu, lutfen tekrar deneyin.'),
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, isLimitReached, productId, userMessageCount],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendQuestion(input);
    }
  };

  return (
    <section className="fixed right-0 bottom-0 z-[1301] flex h-dvh max-h-dvh w-full flex-col overflow-hidden border border-gray-200 bg-[linear-gradient(180deg,var(--color-bg)_0%,var(--color-bg-light)_100%)] shadow-[0_30px_80px_rgba(17,24,39,0.18)] backdrop-blur-xl sm:right-7 sm:bottom-24 sm:h-[min(72dvh,620px)] sm:max-h-[620px] sm:w-[392px] sm:rounded-2xl">
      <header className="flex items-center justify-between gap-4 border-b border-gray-200 bg-[linear-gradient(135deg,#161616_0%,#252525_100%)] px-[18px] py-3.5 text-white">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-[34px] shrink-0 place-items-center rounded-full border border-white/[18%] bg-white/16">
            <Sparkles size={18} />
          </span>
          <div><p className="text-[15px] font-bold">Ürün yapay zeka danışmanı</p><p className="text-xs opacity-85">Sadece bu ürün hakkında kısa cevaplar</p></div>
        </div>
        <button type="button" onClick={onClose} className="inline-flex size-8 items-center justify-center rounded-full border-0 bg-white/10 text-inherit hover:bg-white/[18%]" aria-label="Paneli kapat">
          <CloseIcon size={18} />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3 py-3 [scrollbar-width:thin]">
        <MessageBubble message={initialMessage} isLast={false} />

        {messages.length === 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col items-end gap-2">
              {SUGGESTED_QUESTIONS.map((question) => (
                <Button
                  type="button"
                  variant="text"
                  key={question}
                  onClick={() => void sendQuestion(question)}
                  className="min-h-[58px] justify-center rounded-[18px] border border-gray-500 bg-transparent px-5 py-2 text-base font-medium normal-case text-primary hover:border-accentRed hover:bg-accentRed-light hover:text-accentRed sm:text-lg"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isLast={!loading && index === messages.length - 1}
          />
        ))}

        {loading && <LoadingBubble />}
      </div>

      <div className="flex items-end gap-2 border-t border-gray-200 bg-white/[82%] px-3 py-3 backdrop-blur-2xl">
        <textarea
          autoFocus
          rows={1}
          value={input}
          disabled={loading || isLimitReached}
          placeholder={isLimitReached ? 'Soru limitine ulastiniz' : 'Sorunuzu yazin...'}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            setInput(event.target.value.slice(0, MAX_QUESTION_LENGTH))
          }
          onKeyDown={handleKeyDown}
          className="min-h-12 max-h-[140px] flex-1 resize-none rounded-[18px] border border-gray-300 bg-white px-3.5 py-3 font-inherit leading-[1.45] text-text outline-none transition-[border-color,box-shadow] placeholder:text-text-secondary focus:border-[#C63D2F] focus:shadow-[0_0_0_4px_rgba(198,61,47,0.14)] disabled:bg-bg-light"
        />
        <button type="button"
          onClick={() => void sendQuestion(input)}
          disabled={!input.trim() || loading || isLimitReached}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border-0 bg-[linear-gradient(135deg,#C63D2F_0%,#8F231A_100%)] text-white shadow-[0_10px_20px_rgba(143,35,26,0.18)] hover:bg-[linear-gradient(135deg,#8F231A_0%,#C63D2F_100%)] disabled:opacity-50"
          aria-label="Soruyu gonder"
        >
          <Send size={18} />
        </button>
      </div>
    </section>
  );
};

export default ProductShopAssistantPanel;
