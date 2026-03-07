'use client';

import type { ChangeEvent, KeyboardEvent } from 'react';
import { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import { CheckCircle2, Droplets, Send, ShieldCheck, Sparkles, X } from 'lucide-react';
import useStyles from './styles';
import { ShopProductData } from '@/lib/api/types';

const MAX_SESSION_MESSAGES = 20;
const MAX_QUESTION_LENGTH = 500;
const TYPING_BASE_DELAY_MS = 58;
const SUGGESTED_QUESTIONS = [
  'Bu urun hassas cilde uygun mu?',
  'Nasil kullanmaliyim?',
  'Ne kadar surede etki gosterir?',
  'Hamileler kullanabilir mi?',
];

export type ProductQAData = ShopProductData;

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

type ProductQAPanelProps = {
  data: ProductQAData;
  onClose: () => void;
};


function createMessage(role: Message['role'], text: string): Message {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
  };
}

function splitTextForTyping(text: string) {
  return text.match(/\S+\s*|\n/g) ?? [text];
}

function getTypingDelay(chunk: string) {
  const trimmedChunk = chunk.trim();
  if (!trimmedChunk) return TYPING_BASE_DELAY_MS;
  if (/[.!?]$/.test(trimmedChunk)) return 240;
  if (/[,:;]$/.test(trimmedChunk)) return 150;
  if (trimmedChunk.length <= 3) return 72;
  return Math.min(135, TYPING_BASE_DELAY_MS + trimmedChunk.length * 5);
}

function MessageBubble({
  message,
  isLast,
  animate,
}: {
  message: Message;
  isLast: boolean;
  animate: boolean;
}) {
  const styles = useStyles();
  const [visibleText, setVisibleText] = useState(animate ? '' : message.text);

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
      sx={[styles.messageRow, message.role === 'user' ? styles.userRow : styles.assistantRow]}
      ref={
        isLast
          ? (node: HTMLDivElement | null) => {
              node?.scrollIntoView({ block: 'end', behavior: 'smooth' });
            }
          : undefined
      }
    >
      <Box sx={message.role === 'user' ? styles.userBubble : styles.assistantBubble}>
        {visibleText}
        {showCaret && <Box component="span" sx={styles.typingCaret} />}
      </Box>
    </Box>
  );
}

export default function ProductQAPanel({ data, onClose }: ProductQAPanelProps) {
  const styles = useStyles();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [animatedMessageId, setAnimatedMessageId] = useState<string | null>(null);

  const sessionCount = messages.reduce(
    (count, message) => count + (message.role === 'user' ? 1 : 0),
    0
  );
  const isLimitReached = sessionCount >= MAX_SESSION_MESSAGES;

  const sendQuestion = async (rawQuestion: string) => {
    const question = rawQuestion.trim();
    if (!question || loading || isLimitReached) return;

    const nextUserCount = sessionCount + 1;
    const userMessage = createMessage('user', question);

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/product-qa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          productId: data.id,
          sessionMessageCount: nextUserCount,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error?.message ?? 'Bir hata olustu');
      }

      const json = await response.json();
      const answer = json.data?.answer ?? json.answer ?? 'Yanit alinamadi.';
      const assistantMessage = createMessage('assistant', answer);
      setMessages((prev) => [...prev, assistantMessage]);
      setAnimatedMessageId(assistantMessage.id);
    } catch {
      const fallbackMessage = createMessage(
        'assistant',
        'Bir hata olustu, lutfen tekrar deneyin.'
      );
      setMessages((prev) => [...prev, fallbackMessage]);
      setAnimatedMessageId(fallbackMessage.id);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    void sendQuestion(input);
  };

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
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
              Urun Asistani
            </Typography>
            <Typography fontSize={12} color="inherit" sx={{ opacity: 0.84 }}>
              Bu urune ozel hizli yonlendirme ve net cevaplar
            </Typography>
          </Box>
        </Box>

        <IconButton size="small" onClick={onClose} sx={styles.closeButton} aria-label="Paneli kapat">
          <X size={18} />
        </IconButton>
      </Box>

      <Box sx={styles.content}>
        {messages.length === 0 && (
          <Box sx={styles.introCard}>
            <Box sx={styles.introTopline}>
              <Typography sx={styles.introEyebrow}>Neden burada?</Typography>
              <Typography sx={styles.introTitle}>
                {data.name} icin hizli bir urun yardim alani
              </Typography>
              <Typography fontSize={13} color="text.secondary">
                Bu alan, urunun icerigi, kullanim sekli ve size uygunlugu hakkinda hizli cevap almaniz icin burada. Uzun aciklamalari taramak yerine dogrudan sorunuzu sorabilirsiniz.
              </Typography>
            </Box>

            <Box sx={styles.reasonGrid}>
              <Box sx={styles.reasonCard}>
                <ShieldCheck size={16} />
                <Box>
                  <Typography sx={styles.reasonTitle}>Urune ozel</Typography>
                  <Typography sx={styles.reasonText}>
                    Yanitlar bu sayfadaki urun bilgisine gore verilir.
                  </Typography>
                </Box>
              </Box>

              <Box sx={styles.reasonCard}>
                <Droplets size={16} />
                <Box>
                  <Typography sx={styles.reasonTitle}>Kullanim odakli</Typography>
                  <Typography sx={styles.reasonText}>
                    Icerik, cilt uyumu ve kullanim sorulari icin idealdir.
                  </Typography>
                </Box>
              </Box>

              <Box sx={styles.reasonCard}>
                <CheckCircle2 size={16} />
                <Box>
                  <Typography sx={styles.reasonTitle}>Kisa ve net</Typography>
                  <Typography sx={styles.reasonText}>
                    Uzun metin yerine hizli karar vermenize yardim eder.
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Typography sx={styles.suggestionHeading}>Ornek sorular</Typography>
            <Box sx={styles.suggestions}>
              {SUGGESTED_QUESTIONS.map((question) => (
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => void sendQuestion(question)}
                  sx={styles.suggestionButton}
                  key={question}
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
            animate={message.role === 'assistant' && animatedMessageId === message.id}
          />
        ))}

        {loading && (
          <Box sx={[styles.messageRow, styles.assistantRow]}>
            <Box sx={styles.assistantBubble}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={16} color="inherit" />
                <Typography fontSize={13}>Dusunuyorum...</Typography>
              </Stack>
            </Box>
          </Box>
        )}
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
          onKeyDown={handleTextareaKeyDown}
          sx={styles.textarea}
        />
        <IconButton
          onClick={handleSubmit}
          disabled={!input.trim() || loading || isLimitReached}
          sx={styles.sendButton}
          aria-label="Soruyu gonder"
        >
          <Send size={18} />
        </IconButton>
      </Box>

      <Typography fontSize={11} sx={styles.limitText}>
        {sessionCount}/{MAX_SESSION_MESSAGES} soru kullanildi
      </Typography>
    </Stack>
  );
}
