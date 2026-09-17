import { describe, expect, it } from 'vitest';
import { stripBrandSuffix } from './metadata';

describe('stripBrandSuffix', () => {
  it('tek marka ekini siler', () => {
    expect(stripBrandSuffix('Baslangic Icin En Iyi Retinol Urunleri | Mitenya'))
      .toBe('Baslangic Icin En Iyi Retinol Urunleri');
  });

  it('art arda yazilmis marka eklerini siler', () => {
    expect(stripBrandSuffix('A313 Krem Ne Ise Yarar? | Mitenya | Mitenya'))
      .toBe('A313 Krem Ne Ise Yarar?');
  });

  it('tire ve uzun tire ayiricilarini da tanir', () => {
    expect(stripBrandSuffix('Baslik - Mitenya')).toBe('Baslik');
    expect(stripBrandSuffix('Baslik — mitenya')).toBe('Baslik');
  });

  it('marka eki yoksa basligi degistirmez', () => {
    expect(stripBrandSuffix('A313 Krem Nedir')).toBe('A313 Krem Nedir');
  });

  it('metin icindeki marka adina dokunmaz', () => {
    expect(stripBrandSuffix('Mitenya Editor Ekibi Anlatiyor'))
      .toBe('Mitenya Editor Ekibi Anlatiyor');
    expect(stripBrandSuffix('Mitenya | Kore Kozmetik')).toBe('Mitenya | Kore Kozmetik');
  });

  it('yalnizca marka adindan olusan basligi bosaltmaz', () => {
    expect(stripBrandSuffix('| Mitenya')).toBe('| Mitenya');
  });

  it('bastaki ve sondaki bosluklari temizler', () => {
    expect(stripBrandSuffix('  Baslik  |  Mitenya  ')).toBe('Baslik');
  });
});
