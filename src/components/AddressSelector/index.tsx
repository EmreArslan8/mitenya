import { useAuth } from '@/contexts/AuthContext';
import { AddressData } from '@/lib/api/types';
import useAddress from '@/lib/api/useAddress';
import { useState } from 'react';
import AddressForm from '../AddressCard/AddressForm';
import NewAddressModal from '../AddressCard/modals/NewAddressModal';
import { ChevronDown, Plus } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/DropdownMenu';
import { Typography } from '@/components/ui/Typography';

interface AddressSelectorProps {
  value?: AddressData;
  onChange: (selected: AddressData) => void;
  options: AddressData[];
  onAddressAdded: (newOption: AddressData) => void;
}

const AddressSelector = ({ value, onChange, options, onAddressAdded }: AddressSelectorProps) => {
  const { isAuthenticated } = useAuth();
  const { addAddress } = useAddress();
  const [newAddressModalOpen, setNewAddressModalOpen] = useState(false);
  const [submitTrigger, setSubmitTrigger] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleInlineSubmit = async (address: AddressData) => {
    if (!isAuthenticated) {
      onAddressAdded({ ...address, id: `guest-${Date.now()}` });
      return;
    }
    setSaving(true);
    const id = await addAddress(address);
    setSaving(false);
    if (id) onAddressAdded({ ...address, id });
  };

  // Adres yoksa (misafir veya kayıtlı adressiz kullanıcı): form direkt açık
  if (!options.length) {
    return (
      <div className="flex flex-col gap-4">
        <AddressForm
          onSubmit={handleInlineSubmit}
          submitTrigger={submitTrigger}
          initialValues={{ name: 'Adresim' }}
        />
        <Button
          variant="contained"
          size="small"
          loading={saving}
          onClick={() => setSubmitTrigger((p) => p + 1)}
          className="mx-auto sm:w-3/4"
        >
          Kaydet
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <DropdownMenu
        className="mt-1 w-[var(--radix-dropdown-menu-trigger-width)] p-1"
        triggerClassName="w-full"
        trigger={
          <button
            type="button"
            className="flex h-14 w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 text-left outline-none focus-visible:border-text"
          >
            <span className="flex min-w-0 flex-col">
              <Typography variant="infoValue">{value?.name}</Typography>
              <Typography variant="caption" className="truncate">
                {[value?.line1, value?.line2, value?.line3].filter(Boolean).join('')}
              </Typography>
            </span>
            <ChevronDown />
          </button>
        }
      >
        {/*
          MUI'de bu bir <Select> idi ama açılır listede bir EYLEM düğmesi
          ("Yeni adres ekle") vardı — Radix Select yalnızca seçilebilir öğe
          kabul eder. Yapı bu yüzden DropdownMenu'ye taşındı: öğelerin hepsi
          eylem, seçili değer tetikleyicide gösteriliyor. Semantik olarak da
          doğrusu bu (ADR-0002 §11.0).
        */}
        {options
          .filter((option) => option.id !== undefined)
          .map((option) => (
            <DropdownMenuItem
              key={option.id}
              onSelect={() => onChange(option)}
              className="min-h-10 flex-row items-center justify-between gap-2 rounded px-1.5 py-2"
            >
              <Typography variant="body">{option.name}</Typography>
              <Typography
                variant="body"
                className="text-[14px] italic [font-family:var(--font-albert-sans-italic)]"
              >
                {option.line1}
              </Typography>
            </DropdownMenuItem>
          ))}
        {/*
          DropdownMenuItem olarak veriliyor ÇÜNKÜ Radix menüsü modal:
          açıkken body'ye `pointer-events: none` koyup focus'u hapsediyor.
          Düz bir <Button> menüyü kapatmadığı için, açtığı `NewAddressModal`
          (body'ye portal edilen MUI ModalCard) tıklanamaz ve focus alamaz
          hâle geliyordu. `onSelect` menüyü kapatır, sonra modal açılır.
          (review bulgusu)
        */}
        <DropdownMenuItem
          onSelect={() => setNewAddressModalOpen(true)}
          className="mt-1 justify-center rounded-lg bg-text px-3 py-2 font-bold uppercase text-bg data-[highlighted]:bg-text-medium"
        >
          <Plus size={18} />
          Yeni adres ekle
        </DropdownMenuItem>
      </DropdownMenu>
      <NewAddressModal
        open={newAddressModalOpen}
        onClose={() => setNewAddressModalOpen(false)}
        onAddressAdded={onAddressAdded}
        defaultName={`Adres ${options.length + 1}`}
        guestMode={!isAuthenticated}
      />
    </div>
  );
};

export default AddressSelector;
