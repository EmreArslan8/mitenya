'use client';

import { Box, Stack, Typography } from '@mui/material';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import useStyles from './styles';

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
  const styles = useStyles();

  const isEmpty =
    (variant === 'columns' && !groups.length) ||
    (variant === 'tiles' && !tiles.length) ||
    (variant === 'cards' && !cards.length);
  if (isEmpty) return null;

  return (
    <Box sx={styles.panel} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {variant === 'columns' && (
        <Box sx={feature ? styles.innerWithFeature : styles.inner}>
          <Box sx={styles.columns}>
            {groups.map((group) => (
              <Stack key={group.id} sx={styles.group}>
                {group.title && (
                  <Typography
                    sx={styles.groupTitle}
                    onClick={() => group.href && onSelect(group.href)}
                  >
                    {group.title}
                  </Typography>
                )}
                {group.links.map((link) => (
                  <Typography key={link.id} sx={styles.link} onClick={() => onSelect(link.href)}>
                    {link.label}
                  </Typography>
                ))}
                {group.href && (
                  <Stack sx={styles.allLink} onClick={() => onSelect(group.href!)}>
                    <Typography sx={styles.allLinkText}>
                      {group.allLabel ?? 'Tümünü gör'}
                    </Typography>
                    <ArrowRight size={14} strokeWidth={1.8} />
                  </Stack>
                )}
              </Stack>
            ))}
          </Box>

          {feature && (
            <Stack sx={styles.feature} onClick={() => onSelect(feature.href)}>
              <Box sx={styles.featureFrame}>
                <Image
                  src={feature.image}
                  alt={feature.caption}
                  fill
                  sizes="320px"
                  style={{ objectFit: 'cover' }}
                />
              </Box>
              <Typography sx={styles.featureCaption}>{feature.caption}</Typography>
            </Stack>
          )}
        </Box>
      )}

      {variant === 'tiles' && (
        <Box sx={styles.tileGrid}>
          {tiles.map((tile) => (
            <Stack key={tile.id} sx={styles.tile} onClick={() => onSelect(tile.href)}>
              <Box sx={styles.tileFrame}>
                <Image
                  src={tile.image}
                  alt={tile.label}
                  fill
                  sizes="(min-width:1200px) 240px, 20vw"
                  style={{ objectFit: 'cover' }}
                />
              </Box>
              <Typography sx={styles.tileLabel}>{tile.label}</Typography>
            </Stack>
          ))}
        </Box>
      )}

      {variant === 'cards' && (
        <Box sx={styles.cardGrid}>
          {cards.map((card) => (
            <Stack key={card.id} sx={styles.card} onClick={() => onSelect(card.href)}>
              <Box sx={styles.cardFrame}>
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  sizes="(min-width:1200px) 420px, 40vw"
                  style={{ objectFit: 'cover' }}
                />
              </Box>
              <Stack sx={styles.cardText}>
                <Typography sx={styles.cardLabel}>{card.label}</Typography>
                <Typography sx={styles.cardTitle}>{card.title}</Typography>
                <Typography sx={styles.cardDescription}>{card.description}</Typography>
              </Stack>
            </Stack>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default MegaMenu;
