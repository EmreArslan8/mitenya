'use client';

import { CategoryParent } from '@/lib/api/types';
import { ArrowLeft, ChevronRight, CloseIcon, Heart, User } from '@/components/icons';
import Dialog from '@/components/ui/Dialog';
import { Package } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface CategoriesDrawerProps {
  open: boolean;
  categories?: CategoryParent[];
  isAuthenticated?: boolean;
  onClose: () => void;
  onAccount?: () => void;
  onFavorites?: () => void;
  onOrders?: () => void;
  onNavigate?: (slug: string) => void;
}

const CategoriesDrawer = ({
  open,
  categories,
  isAuthenticated,
  onClose,
  onAccount,
  onFavorites,
  onOrders,
  onNavigate,
}: CategoriesDrawerProps) => {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [activeSubId, setActiveSubId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      setActiveCategoryId(null);
      setActiveSubId(null);
    }
  }, [open]);

  const handleNavigate = (slug?: string) => {
    if (!slug) return;
    onNavigate?.(slug);
    onClose();
  };

  const handleAction = (callback?: () => void) => {
    if (!callback) return;
    callback();
    onClose();
  };

  const handleBack = () => {
    if (activeSubId !== null) {
      setActiveSubId(null);
      return;
    }
    setActiveCategoryId(null);
  };

  const hasCategories = !!categories?.length;
  const activeCategory = categories?.find((e) => e.id === activeCategoryId);
  const activeSub = activeCategory?.subs?.find((e) => e.id === activeSubId);
  const isLevel1 = activeCategoryId === null;
  const isLevel2 = activeCategoryId !== null && activeSubId === null;
  const isLevel3 = activeSubId !== null;
  const actionClassName =
    'flex w-full min-h-0 appearance-none items-center gap-4 border-x-0 border-t-0 border-b border-gray-200 bg-white px-5 py-4 text-left last:border-b-0 hover:bg-gray-50 disabled:cursor-default disabled:opacity-45';
  const categoryClassName =
    'flex w-full min-h-0 appearance-none items-center justify-between border-x-0 border-t-0 border-b border-gray-200 bg-white px-5 py-4 text-left last:border-b-0 hover:bg-gray-50 disabled:cursor-default disabled:opacity-45';

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      position="left"
      srTitle="Kategoriler"
      keepMounted
      className="h-full w-[88vw] max-w-none bg-[#f5f5f5] p-0 sm:w-[380px]"
    >
      <div className="flex h-full flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between bg-[#f5f5f5] px-5 py-3">
          <div className="flex min-h-[34px] items-center">
            <Image
              src="/static/images/logo.svg"
              alt="Mitenya"
              width={118}
              height={38}
              className="h-[38px] w-[118px] object-contain"
              priority
              unoptimized
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="inline-flex appearance-none items-center justify-center border-0 bg-transparent p-0 text-text"
          >
            <CloseIcon size={28} />
          </button>
        </header>

        <div className="flex flex-1 flex-col overflow-y-auto bg-[#f5f5f5] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-h-14 items-start bg-[#f5f5f5] px-5 pb-3 pt-4">
            <h2 className="text-base font-medium leading-[1.2] text-text">Hesabım</h2>
          </div>

          <div className="bg-white">
            <button type="button" className={actionClassName} onClick={() => handleAction(onAccount)} disabled={!onAccount}>
              <User size={32} strokeWidth={1.5} className="size-8 shrink-0 text-text" />
              <span className="text-base font-normal leading-[1.3] text-text">
                {isAuthenticated ? 'Hesabım' : 'Giriş yap'}
              </span>
            </button>
            
            <button type="button" className={actionClassName} onClick={() => handleAction(onFavorites)} disabled={!onFavorites}>
              <Heart size={32} strokeWidth={1.5} className="size-8 shrink-0 text-text" />
              <span className="text-base font-normal leading-[1.3] text-text">Favorilerim</span>
            </button>
            
            <button type="button" className={actionClassName} onClick={() => handleAction(onOrders)} disabled={!onOrders}>
              <Package size={32} strokeWidth={1.5} className="size-8 shrink-0 text-text" />
              <span className="text-base font-normal leading-[1.3] text-text">Sipariş takibi</span>
            </button>
          </div>

          <div className="flex min-h-14 items-start gap-2 bg-[#f5f5f5] px-5 pb-3 pt-4">
            {!isLevel1 && (
              <button
                type="button"
                onClick={handleBack}
                aria-label="Geri"
                className="mr-2 inline-flex appearance-none items-center justify-center border-0 bg-transparent p-0 text-text"
              >
                <ArrowLeft size={20} strokeWidth={1.5} />
              </button>
            )}
            <h2 className="text-base font-medium leading-[1.2] text-text">
              {isLevel1 ? 'Kategoriler' : isLevel2 ? 'Tüm Kategoriler' : activeCategory?.label}
            </h2>
          </div>
          
          {!hasCategories && (
            <p className="bg-white px-5 py-4 text-sm text-text-medium">Kategori bulunamadı</p>
          )}

          <div className="bg-white">
            {isLevel1 &&
              categories?.map((category) => {
                const hasSubs = !!category.subs?.length;
                return (
                  <button
                    type="button"
                    key={category.id}
                    className={categoryClassName}
                    onClick={() => {
                      if (hasSubs) setActiveCategoryId(category.id);
                      else handleNavigate(category.slug);
                    }}
                    disabled={!hasSubs && !category.slug}
                  >
                    <span className="flex-1 text-base font-medium leading-[1.3] text-text">{category.label}</span>
                    {hasSubs && <ChevronRight size={24} strokeWidth={1.5} className="size-8 shrink-0 text-text" />}
                  </button>
                );
              })}

            {isLevel2 &&
              activeCategory?.subs?.map((sub) => {
                const hasItems = !!sub.items?.length;
                return (
                  <button
                    type="button"
                    key={sub.id}
                    className={categoryClassName}
                    onClick={() => {
                      if (hasItems) setActiveSubId(sub.id);
                      else handleNavigate(sub.slug);
                    }}
                    disabled={!hasItems && !sub.slug}
                  >
                    <span className="flex-1 text-base font-medium leading-[1.3] text-text">{sub.label}</span>
                    {hasItems && <ChevronRight size={24} strokeWidth={1.5} className="size-8 shrink-0 text-text" />}
                  </button>
                );
              })}

            {isLevel3 &&
              activeSub?.items?.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={categoryClassName}
                  onClick={() => handleNavigate(item.slug)}
                  disabled={!item.slug}
                >
                  <span className="flex-1 text-base font-medium leading-[1.3] text-text">{item.label}</span>
                </button>
              ))}
          </div>

          <div className="mt-auto border-t border-gray-200 bg-[#f5f5f5] pb-8 pt-4">
            <a
              href="https://api.whatsapp.com/send?phone=905070617930"
              target="_blank"
              rel="noreferrer"
              onClick={onClose}
              className="flex min-h-12 items-center justify-center bg-transparent px-5 text-[15px] font-medium text-text-medium hover:underline"
            >
              Yardım
            </a>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default CategoriesDrawer;
