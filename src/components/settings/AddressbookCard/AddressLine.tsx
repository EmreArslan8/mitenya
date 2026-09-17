'use client';

import EditAddressModal from '@/components/AddressCard/modals/EditAddressModal';
import { Button } from '@/components/ui/Button';
import Card from '@/components/common/Card';
import Popover from '@/components/ui/Popover';
import { AddressData } from '@/lib/api/types';
import useAddress from '@/lib/api/useAddress';
import { useState } from 'react';
import { Check, Trash } from '@/components/icons';

const AddressLine = ({ data, onChange }: { data: AddressData; onChange: () => void }) => {
  const { deleteAddress } = useAddress();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteMenuOpen, setDeleteMenuOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteMenuClose = () => {
    setDeleteMenuOpen(false);
  };

  const handleDelete = (id: string | number) => {
    setDeleteLoading(true);
    deleteAddress(id.toString()).then((result) => {
      setDeleteLoading(false);
      if (!result) return;
      handleDeleteMenuClose();
      setTimeout(onChange, 200);
    });
  };

  const contactFullName = [data.contactName, data.contactSurname].filter(Boolean).join(' ').trim();
  const addressLine = [data.line1, data.line2, data.line3].filter((e) => e).join(', ');
  const cityLine = [data.district, data.city].filter((e) => e).join(' / ');
  const phoneLine = [data.phoneCode, data.phoneNumber].filter((e) => e).join(' ');

  return (
    <>
      <article className="flex w-full flex-col items-stretch gap-1.5 rounded-xl border border-gray-200 bg-bg-light p-2.5 sm:p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold leading-[1.35] text-text">{data.name}</h3>
          {data.isDefault && (
            <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-tertiary text-white">
              <Check size={11} />
            </span>
          )}
        </div>

        <div className="flex flex-col gap-[3px] text-[13px] leading-[1.45] text-text-medium">
          {contactFullName && <p>{contactFullName}</p>}
          <p className="break-words">{addressLine}</p>
          {cityLine && <p>{cityLine}</p>}
          {phoneLine && <p className="mt-0.5 font-medium leading-[1.4] text-text">{phoneLine}</p>}
        </div>

        <div className="mt-0.5 flex items-center justify-between">
          <Popover
            open={deleteMenuOpen}
            onOpenChange={setDeleteMenuOpen}
            align="end"
            className="rounded-xl border-0 p-0 shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
            trigger={
              <button type="button" className="grid size-[34px] place-items-center rounded-lg border border-gray-200 bg-white text-error" aria-label="Adresi sil">
                <Trash size={15} />
              </button>
            }
          >
            <Card title="Adresi silmek istediğinize emin misiniz?" className="w-[240px]">
              <div className="flex flex-col gap-2 p-4">
                <Button
                  color="secondary"
                  variant="outlined"
                  size="small"
                  onClick={handleDeleteMenuClose}
                  className="rounded-[10px] text-[13px] font-semibold normal-case"
                >
                  Vazgeç
                </Button>
                <Button
                  loading={deleteLoading}
                  color="error"
                  disabled={data.id === undefined}
                  variant="contained"
                  size="small"
                  onClick={() => {
                    if (data.id !== undefined) handleDelete(data.id);
                  }}
                  className="rounded-[10px] text-[13px] font-semibold normal-case"
                >
                  Sil
                </Button>
              </div>
            </Card>
          </Popover>

          <Button
            size="small"
            variant="outlined"
            color="secondary"
            onClick={() => setEditModalOpen(true)}
            className="h-[34px] rounded-lg px-2.5 text-[13px] font-medium normal-case"
          >
            Adresi Duzenle
          </Button>
        </div>
      </article>

      <EditAddressModal
        initialData={data}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onEdited={onChange}
      />

    </>
  );
};

export default AddressLine;
