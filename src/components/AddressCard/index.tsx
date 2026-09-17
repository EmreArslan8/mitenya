'use client';

import { ReactNode, useState } from 'react';
import { ChevronDown, MapPin, Pencil, Trash } from '@/components/icons';
import { AddressData } from '@/lib/api/types';
import useAddress from '@/lib/api/useAddress';
import { cn } from '@/lib/utils/cn';
import Card from '../common/Card';
import EditAddressModal from './modals/EditAddressModal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Typography } from '@/components/ui/Typography';
import Popover from '@/components/ui/Popover';

interface AddressCardProps {
  data?: AddressData;
  onChange?: (address: AddressData) => void;
  children?: ReactNode;
  hideEdit?: boolean;
  hideDelete?: boolean;
  active?: boolean;
  skeleton?: boolean;
  summarized?: boolean;
}

const LABELS: Record<string, string> = {
  email: 'E-posta',
  lines: 'Adres',
  postcode: 'Posta Kodu',
  city: 'İl',
  district: 'İlçe',
  state: 'Semt / Mahalle',
};

const AddressCard = ({
  data: source,
  onChange = () => {},
  hideEdit,
  hideDelete,
  children,
  summarized = false,
  skeleton = false,
}: AddressCardProps) => {
  const { deleteAddress } = useAddress();
  const [deleteMenuOpen, setDeleteMenuOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (!source || skeleton) return <AddressSkeleton>{children}</AddressSkeleton>;

  const { id, name, contactName, taxNumber, phoneCode, phoneNumber, email, line1, line2, line3, postcode, ...rest } = source;
  const details = {
    email,
    lines: summarized
      ? [line1, line2, line3, ...Object.values(rest), postcode].filter(Boolean).join(', ')
      : [line1, line2, line3].filter(Boolean).join(', '),
    postcode,
    ...rest,
  };

  const handleDelete = async () => {
    if (id == null) return;
    setDeleteLoading(true);
    const result = await deleteAddress(String(id));
    setDeleteLoading(false);
    if (!result) return;
    setDeleteMenuOpen(false);
    window.setTimeout(onChange, 200);
  };

  return (
    <>
      <Card
        customIcon={<span className="inline-flex text-primary"><MapPin size={20} /></span>}
        border
        title={
          <div className="flex items-center justify-between gap-2">
            <Typography variant="cardTitle" as="span">{name ?? 'Adresim'}</Typography>
            <div className="flex items-center">
              {!hideEdit && (
                <button type="button" className="-my-2 flex h-10 w-10 items-center justify-center border-0 bg-transparent text-text" onClick={() => setEditModalOpen(true)} aria-label="Adresi düzenle">
                  <Pencil size={20} />
                </button>
              )}
              {!hideDelete && (
                <Popover
                  open={deleteMenuOpen}
                  onOpenChange={setDeleteMenuOpen}
                  align="end"
                  className="border-0 p-0 shadow-[0_0_16px_rgba(0,0,0,0.25)]"
                  trigger={
                    <button type="button" className="-my-2 flex h-10 w-10 items-center justify-center border-0 bg-transparent text-error disabled:text-text-disabled" disabled={id == null} aria-label="Adresi sil">
                      <Trash size={20} />
                    </button>
                  }
                >
                  <Card title="Adresi Sil" className="w-[200px]">
                    <div className="flex flex-col gap-3 p-4">
                      <Button color="secondary" variant="outlined" size="small" onClick={() => setDeleteMenuOpen(false)}>Vazgeç</Button>
                      <Button loading={deleteLoading} color="error" variant="contained" size="small" onClick={handleDelete} disabled={id == null}>Sil</Button>
                    </div>
                  </Card>
                </Popover>
              )}
            </div>
          </div>
        }
        className="h-full bg-white transition-shadow duration-200"
      >
        <div className="flex h-full flex-col gap-4 px-4 pb-5 pt-4 sm:px-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 md:gap-x-12">
            <AddressInfoItem label="İletişim Kişisi" value={contactName} />
            {taxNumber && !summarized && <AddressInfoItem label="Vergi No" value={taxNumber} />}
            <AddressInfoItem label="Adres" value={details.lines} className={cn('col-span-2', !summarized && 'sm:hidden', expanded && 'hidden')} />
          </div>

          {!summarized && (
            <>
              <button type="button" className="mx-auto flex items-center gap-2 border-0 bg-transparent text-sm font-extrabold uppercase text-primary sm:hidden" onClick={() => setExpanded((current) => !current)} aria-expanded={expanded}>
                {expanded ? 'Daha Az Göster' : 'Daha Fazla Göster'}
                <ChevronDown size={16} className={cn('transition-transform duration-200', expanded && 'rotate-180')} />
              </button>
              <div className={cn('grid-cols-2 gap-x-4 gap-y-3 md:gap-x-12', expanded ? 'grid' : 'hidden', 'sm:grid')}>
                {(phoneNumber || phoneCode) && <AddressInfoItem className="sm:col-span-2" label="Telefon" value={`${phoneCode ?? ''}${phoneNumber ?? ''}`} />}
                {Object.entries(details).map(([key, value]) => value ? (
                  <AddressInfoItem className={key === 'lines' ? 'col-span-2' : undefined} label={LABELS[key] ?? key} value={value as ReactNode} key={key + String(value)} />
                ) : null)}
              </div>
            </>
          )}
          {children}
        </div>
      </Card>

      <EditAddressModal initialData={source} open={editModalOpen} onClose={() => setEditModalOpen(false)} onEdited={onChange} />
    </>
  );
};

const AddressInfoItem = ({ label, value, className }: { label: ReactNode; value: ReactNode; className?: string }) => (
  <div className={cn('flex min-w-0 flex-col gap-0.5', className)}>
    <Typography variant="infoLabel">{label}</Typography>
    <Typography variant="infoValue" className="break-words">{value}</Typography>
  </div>
);

const AddressSkeleton = ({ children }: { children: ReactNode }) => (
  <Card customIcon={<span className="inline-flex text-primary"><MapPin size={20} /></span>} title={<Typography variant="cardTitle" as="span">Adresim</Typography>}>
    <div className="flex h-full flex-col gap-4 px-4 pb-5 pt-4 sm:px-5">
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 md:gap-x-12">
        {Array.from({ length: 6 }, (_, index) => (
          <AddressInfoItem label={<Skeleton variant="rectangular" width={48} />} value={<Skeleton variant="rectangular" width={80} height={20} />} key={index} />
        ))}
      </div>
      {children}
    </div>
  </Card>
);

export default AddressCard;
