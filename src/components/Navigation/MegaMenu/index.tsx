'use client';

import { ArrowRight } from '@/components/icons';
import Image from 'next/image';

export interface MegaMenuLink {
  id: string;
  label: string;
  href: string;
}

export interface MegaMenuGroup {
  id: string;
  title?: string;
  href?: string;
  links: MegaMenuLink[];
  allLabel?: string;
}

export interface MegaMenuTile {
  id: string;
  label: string;
  href: string;
  image: string;
}

export interface MegaMenuCard {
  id: string;
  label: string;
  title: string;
  description: string;
  href: string;
  image: string;
}

export interface MegaMenuFeature {
  image: string;
  caption: string;
  href: string;
}

export interface MegaMenuContent {
  /** columns: link sutunlari + vitrin · tiles: gorsel kadrajlar · cards: genis rutin kartlari */
  variant: 'columns' | 'tiles' | 'cards';
  groups?: MegaMenuGroup[];
  tiles?: MegaMenuTile[];
  cards?: MegaMenuCard[];
  feature?: MegaMenuFeature;
}

interface MegaMenuProps extends MegaMenuContent {
  onSelect: (href: string) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const MegaMenu = ({
  variant,
  groups = [],
  tiles = [],
  cards = [],
  feature,
  onSelect,
  onMouseEnter,
  onMouseLeave,
}: MegaMenuProps) => {
  const isEmpty =
    (variant === 'columns' && !groups.length) ||
    (variant === 'tiles' && !tiles.length) ||
    (variant === 'cards' && !cards.length);
  if (isEmpty) return null;

  return (
    <div
      className="absolute left-0 right-0 top-full z-[2000] hidden animate-[mega-menu-in_.18s_ease-out_both] border-t border-gray-100 bg-bg px-8 py-9 shadow-[0_18px_32px_rgba(15,20,32,0.10)] motion-reduce:animate-none sm:block"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {variant === 'columns' && (
        <div
          className={
            feature
              ? 'mx-auto grid max-w-[1340px] grid-cols-[minmax(0,1fr)_320px] items-start gap-12'
              : 'mx-auto grid max-w-[1340px] items-start gap-12'
          }
        >
          <div className="grid gap-x-10 [grid-auto-columns:minmax(0,1fr)] [grid-auto-flow:column]">
            {groups.map((group) => (
              <div key={group.id} className="flex flex-col">
                {group.title && (
                  <button
                    type="button"
                    className="mb-3 w-fit appearance-none border-0 bg-transparent p-0 text-left text-[13px] font-bold uppercase tracking-[0.06em] text-text"
                    onClick={() => group.href && onSelect(group.href)}
                  >
                    {group.title}
                  </button>
                )}
                {group.links.map((link) => (
                  <button
                    type="button"
                    key={link.id}
                    className="w-fit appearance-none border-0 bg-transparent p-0 text-left text-[14.5px] leading-[2] text-text-medium-light transition-colors hover:text-text hover:underline"
                    onClick={() => onSelect(link.href)}
                  >
                    {link.label}
                  </button>
                ))}
                {group.href && (
                  <button
                    type="button"
                    className="mt-3 flex w-fit appearance-none items-center gap-1.5 border-0 bg-transparent p-0 text-text hover:underline"
                    onClick={() => onSelect(group.href!)}
                  >
                    <span className="text-[13.5px] font-semibold">
                      {group.allLabel ?? 'Tümünü gör'}
                    </span>
                    <ArrowRight size={14} strokeWidth={1.8} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {feature && (
            <button
              type="button"
              className="group flex appearance-none flex-col gap-2.5 border-0 bg-transparent p-0 text-left"
              onClick={() => onSelect(feature.href)}
            >
              <span className="relative block max-h-[200px] w-full overflow-hidden bg-gray-50 [aspect-ratio:4/3]">
                <Image
                  src={feature.image}
                  alt={feature.caption}
                  fill
                  sizes="320px"
                  className="object-cover transition-transform duration-[450ms] group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
                />
              </span>
              <span className="text-sm font-semibold text-text">{feature.caption}</span>
            </button>
          )}
        </div>
      )}

      {variant === 'tiles' && (
        <div className="mx-auto grid max-w-[1340px] grid-cols-5 gap-4">
          {tiles.map((tile) => (
            <button
              type="button"
              key={tile.id}
              className="group flex appearance-none flex-col gap-2.5 border-0 bg-transparent p-0 text-left"
              onClick={() => onSelect(tile.href)}
            >
              <span className="relative block max-h-[180px] w-full overflow-hidden bg-gray-50 [aspect-ratio:4/3]">
                <Image
                  src={tile.image}
                  alt={tile.label}
                  fill
                  sizes="(min-width:1200px) 240px, 20vw"
                  className="object-cover transition-transform duration-[450ms] group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
                />
              </span>
              <span className="text-sm font-semibold text-text">{tile.label}</span>
            </button>
          ))}
        </div>
      )}

      {variant === 'cards' && (
        <div className="mx-auto grid max-w-[1340px] grid-cols-2 gap-8">
          {cards.map((card) => (
            <button
              type="button"
              key={card.id}
              className="group flex appearance-none items-center gap-5 border-0 bg-transparent p-0 text-left"
              onClick={() => onSelect(card.href)}
            >
              <span className="relative block h-[135px] w-[180px] shrink-0 overflow-hidden bg-gray-50">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  sizes="(min-width:1200px) 420px, 40vw"
                  className="object-cover transition-transform duration-[450ms] group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
                />
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-medium-light">
                  {card.label}
                </span>
                <span className="text-lg font-semibold tracking-[-0.01em] text-text">
                  {card.title}
                </span>
                <span className="text-[13.5px] leading-[1.5] text-text-medium-light">
                  {card.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MegaMenu;
