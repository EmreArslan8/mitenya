'use client';

import type { ChangeEvent, KeyboardEvent } from 'react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import { Send, Sparkles, X } from 'lucide-react';
import useStyles from './styles';

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
  const styles = useStyles();
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
    <Box
      sx={[styles.messageRow, isUser ? styles.userRow : styles.assistantRow]}
      ref={isLast ? scrollRef : undefined}
    >
      <Box sx={styles.messageGroup}>
        <Box sx={[styles.messageMeta, isUser ? styles.userMeta : styles.assistantMeta]}>
          <Typography component="span" sx={styles.messageAuthor}>
            {isUser ? 'Ben' : 'Mitenya Yapay Zeka'}
          </Typography>
          <Typography component="span" sx={styles.messageTime}>
            {message.time}
          </Typography>
        </Box>
        <Box sx={isUser ? styles.userBubble : styles.assistantBubble}>
          {visibleText}
          {showCaret && <Box component="span" sx={styles.typingCaret} />}
        </Box>
      </Box>
    </Box>
  );
});

function LoadingBubble() {
  const styles = useStyles();
  const [time] = useState(formatTime);

  return (
    <Box sx={[styles.messageRow, styles.assistantRow]}>
      <Box sx={styles.messageGroup}>
        <Box sx={[styles.messageMeta, styles.assistantMeta]}>
          <Typography component="span" sx={styles.messageAuthor}>
            Mitenya Yapay Zeka
          </Typography>
          <Typography component="span" sx={styles.messageTime}>
            {time}
          </Typography>
        </Box>
        <Box sx={styles.assistantBubble}>
          <Box sx={styles.typingDots}>
            <Box component="span" sx={styles.typingDot} />
            <Box component="span" sx={styles.typingDot} />
            <Box component="span" sx={styles.typingDot} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

const ProductShopAssistantPanel = ({ productId, onClose }: ProductShopAssistantPanelProps) => {
  const styles = useStyles();
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
    <Stack sx={styles.panel}>
      <Box sx={styles.header}>
        <Box sx={styles.headerInfo}>
          <Box sx={styles.headerIcon}>
            <Sparkles size={18} />
          </Box>
          <Box>
            <Typography fontWeight={700} fontSize={15} color="inherit">
              Ürün yapay zeka danışmanı
            </Typography>
            <Typography fontSize={12} color="inherit" sx={{ opacity: 0.84 }}>
              Sadece bu ürün hakkında kısa cevaplar
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={styles.closeButton} aria-label="Paneli kapat">
          <X size={18} />
        </IconButton>
      </Box>

      <Box sx={styles.content}>
        <MessageBubble message={initialMessage} isLast={false} />

        {messages.length === 0 && (
          <Box sx={styles.introCard}>
            <Box sx={styles.suggestions}>
              {SUGGESTED_QUESTIONS.map((question) => (
                <Button
                  type="button"
                  variant="text"
                  key={question}
                  onClick={() => void sendQuestion(question)}
                  sx={styles.suggestionButton}
                >
                  {question}
                </Button>
              ))}
            </Box>
          </Box>
        )}

        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isLast={!loading && index === messages.length - 1}
          />
        ))}

        {loading && <LoadingBubble />}
      </Box>

      <Box sx={styles.composer}>
        <Box
          component="textarea"
          autoFocus
          rows={1}
          value={input}
          disabled={loading || isLimitReached}
          placeholder={isLimitReached ? 'Soru limitine ulastiniz' : 'Sorunuzu yazin...'}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            setInput(event.target.value.slice(0, MAX_QUESTION_LENGTH))
          }
          onKeyDown={handleKeyDown}
          sx={styles.textarea}
        />
        <IconButton
          onClick={() => void sendQuestion(input)}
          disabled={!input.trim() || loading || isLimitReached}
          sx={styles.sendButton}
          aria-label="Soruyu gonder"
        >
          <Send size={18} />
        </IconButton>
      </Box>
    </Stack>
  );
};

export default ProductShopAssistantPanel;
