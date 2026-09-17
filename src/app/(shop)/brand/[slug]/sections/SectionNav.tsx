export type SectionLink = { id: string; label: string };

/** Sayfa içi bölüm linkleri; mobilde üste yapışır ve yatay kayar. JS yok. */
const SectionNav = ({ links }: { links: SectionLink[] }) => {
  if (links.length < 2) return null;

  return (
    <nav
      aria-label="Sayfa bölümleri"
      className="sticky top-0 z-10 -mx-2 overflow-x-auto bg-bg px-2 py-2.5 [scrollbar-width:none] md:static md:mx-0 md:px-0"
    >
      <ul className="flex gap-2 whitespace-nowrap">
        {links.map((link, index) => (
          <li key={link.id}>
            <a
              href={`#${link.id}`}
              className={
                index === 0
                  ? 'flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-contrast-text'
                  : 'flex h-11 items-center rounded-full border border-gray-200 px-5 text-sm font-semibold hover:border-primary'
              }
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SectionNav;
