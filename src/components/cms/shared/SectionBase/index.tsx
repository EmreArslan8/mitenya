import { ReactNode } from 'react';
import Button from '@/components/ui/Button';
import Stack from '@/components/ui/Stack';
import Markdown, { MarkdownOptions } from '@/components/common/Markdown';
import { cn } from '@/lib/utils/cn';
import DynamicTitleSection from './DynamicTitleSection';

export interface SectionBaseProps {
  sectionHeader?: string;
  sectionDescription?: string;
  sectionDescriptionMarkdownOptions?: MarkdownOptions;
  sectionWidth?: string | number;
  /** ShopBanner deseni: bolumu MainLayout kalibindan cikarip ekran kenarina yayar. */
  fullBleed?: boolean;
  sectionBackground?: 'default' | 'primary';
  sectionLabel?: string;
  sectionHref?: string;
  className?: string;
  children: ReactNode;
}

const SectionBase = ({
  sectionHeader,
  sectionDescription,
  sectionDescriptionMarkdownOptions,
  sectionBackground = 'default',
  sectionWidth = '100%',
  fullBleed = false,
  sectionLabel,
  sectionHref,
  className,
  children,
}: SectionBaseProps) => {
  const hasBackground = sectionBackground === 'primary';
  const bleeding = fullBleed || hasBackground;

  const content = (
    <>
      {(sectionHeader || sectionDescription || sectionLabel) && (
        <Stack gap={1}>
          {(sectionHeader || sectionLabel) && (
            <Stack direction="row" align="center" justify="between" gap={1}>
              <div className="min-w-0 flex-1">
                {sectionHeader && (
                  <DynamicTitle
                    title={splitTextWithDynamicSections(sectionHeader)}
                    align={sectionLabel ? 'left' : 'center'}
                  />
                )}
              </div>
              {sectionLabel && (
                <Button
                  color="neutral"
                  arrow="end"
                  size="small"
                  variant="outlined"
                  className="min-h-7 rounded-lg border-gray-300 bg-white px-2.5 py-1.5 text-xs font-bold leading-none tracking-[0.02em] text-gray-900 hover:border-gray-400 hover:bg-gray-50"
                  href={sectionHref}
                >
                  {sectionLabel}
                </Button>
              )}
            </Stack>
          )}
          {sectionDescription && (
            <Markdown text={sectionDescription} options={sectionDescriptionMarkdownOptions} />
          )}
        </Stack>
      )}
      {children}
    </>
  );

  return (
    <section
      id={sectionHeader}
      style={{ maxWidth: bleeding ? undefined : sectionWidth }}
      className={cn(
        'flex h-full w-full flex-1 flex-col gap-6 p-2',
        fullBleed && 'ml-[calc(50%-50vw)] w-screen max-w-none overflow-clip p-0',
        hasBackground &&
          'sm:ml-[calc(50%-50vw)] sm:w-screen sm:max-w-none sm:overflow-clip sm:bg-gray-50 sm:px-14 sm:py-2 md:px-[72px]',
        className,
      )}
    >
      {bleeding && !fullBleed ? (
        <div className="mx-auto flex w-full max-w-[1340px] flex-col gap-6">{content}</div>
      ) : (
        content
      )}
    </section>
  );
};

const splitTextWithDynamicSections = (text: string): (string | string[])[] => {
  const sections = text.split(/(\[[^\]]+\])/);
  const result: (string | string[])[] = [];

  for (const section of sections) {
    if (section.startsWith('[') && section.endsWith(']')) {
      result.push(section.slice(1, -1).split(',').map((word) => word.trim()));
    } else {
      section.split(/\s+/).filter(Boolean).forEach((word) => result.push(word));
    }
  }

  return result;
};

const DynamicTitle = ({
  title,
  align = 'center',
}: {
  title: (string | string[])[];
  align?: 'left' | 'center';
}) => (
  <h2 className="m-0 w-full text-2xl font-semibold leading-[1.15] tracking-[-0.01em] text-gray-900 sm:text-[30px] sm:tracking-[-0.02em] md:text-[34px] md:font-medium md:tracking-[-0.025em]">
    <span
      className={cn(
        'flex w-fit flex-row flex-wrap items-center gap-x-1 pl-2 text-center text-gray-900',
        align === 'left' ? 'justify-start' : 'justify-center',
      )}
    >
      {title.map((section, index) =>
        typeof section === 'string' ? (
          <Markdown
            key={`${section}-${index}`}
            text={`${section} `}
            component="span"
            className="!block !gap-0 [&_*]:!m-0 [&_*]:!text-[inherit] [&_*]:!font-[inherit] [&_*]:!leading-[inherit] [&_*]:!tracking-[inherit] [&_strong]:!font-semibold [&_strong]:!text-primary"
          />
        ) : (
          <DynamicTitleSection key={`${section.join('-')}-${index}`} section={section} />
        ),
      )}
    </span>
  </h2>
);

export default SectionBase;
