import MainLayout from '@/components/layouts/MainLayout';
import Image from 'next/image';
import Link from 'next/link';

const CheckoutLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <header
      style={{
        alignItems: 'center',
        background: '#fff',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        display: 'flex',
        height: 72,
        justifyContent: 'center',
        padding: '12px 16px',
        width: '100%',
      }}
    >
      <Link
        href="/"
        aria-label="Mitenya ana sayfa"
        style={{ alignItems: 'center', display: 'inline-flex' }}
      >
        <Image
          src="/static/images/logo.svg"
          alt="mitenya"
          width={125}
          height={40}
          priority
        />
      </Link>
    </header>

    <MainLayout>{children}</MainLayout>
  </>
);

export default CheckoutLayout;
