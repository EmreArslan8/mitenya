'use client';

import { ArrowUpRight } from '@/components/icons';
import { Sparkles } from 'lucide-react';
import { openProductQA } from '../events';
import useTypewriter from '@/lib/hooks/useTypewriter';

const QUESTIONS = [
  'Ürün bana uygun mu?',
  'Nasıl kullanmalıyım?',
  'İçeriği ne işe yarar?',
];

const QATypewriterPill = () => {
  const displayed = useTypewriter({ texts: QUESTIONS });

  return (
    <button type="button" onClick={openProductQA} className="mt-2 inline-flex items-center gap-2 self-start rounded-full border-0 bg-transparent py-[7px] pr-3 pl-0 sm:hidden">
      <Sparkles size={16} strokeWidth={1.9} />
      <span className="min-w-[150px] text-left text-[13px] leading-none font-semibold text-text">
        {displayed}
        <span className="ml-0.5 inline-block h-[11px] w-px animate-[qa-caret_.8s_steps(1)_infinite] bg-text align-text-bottom" />
      </span>
      <span className="text-[13px] leading-none font-semibold whitespace-nowrap text-text-secondary">
        · Yapay zekaya sor
      </span>
      <ArrowUpRight size={14} />
    </button>
  );
};

export default QATypewriterPill;
