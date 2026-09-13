'use client';

import NewAddressModal from '@/components/AddressCard/modals/NewAddressModal';
import { Button } from '@/components/ui/Button';
import { AddressData } from '@/lib/api/types';
import { useState } from 'react';
import AddressLine from './AddressLine';
import LoadingOverlay from '@/components/LoadingOverlay';
import { Plus } from '@/components/icons';

const AddressbookCard = ({ addresses }: { addresses: AddressData[] }) => {
  const [newAddressModalOpen, setNewAddressModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    setLoading(true);
    window.location.reload();
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <header className="flex items-center justify-between rounded-[14px] border border-gray-200 bg-white px-4 py-3.5 sm:px-5">
          <h2 className="text-lg font-semibold text-text">Adres Bilgilerim</h2>
          <Button
            size="small"
            color="tertiary"
            variant="text"
            startIcon={<Plus size={18} />}
            onClick={() => setNewAddressModalOpen(true)}
            className="min-h-[38px] rounded-[10px] px-1.5 text-base font-semibold normal-case"
          >
            Yeni Adres Ekle
          </Button>
        </header>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
          {addresses?.map((e) => (
            <div key={String(e.id ?? `${e.name}-${e.line1}`)} className="min-w-0">
              <AddressLine data={e} onChange={handleChange} />
            </div>
          ))}

        </div>

        <NewAddressModal
          open={newAddressModalOpen}
          onClose={() => setNewAddressModalOpen(false)}
          onAddressAdded={handleChange}
          defaultName={`Adres ${(addresses?.length ?? 0) + 1}`}
        />
      </div>
      <LoadingOverlay loading={loading} />
    </>
  );
};

export default AddressbookCard;
