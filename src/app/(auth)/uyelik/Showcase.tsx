/**
 * Sol sutundaki marka seridi: sonsuz kayan logo marquee.
 * prefers-reduced-motion acikken hareket duruyor.
 */

const BRANDS = [
  { name: 'Beauty of Joseon', src: '/static/images/brands/beauty-of-joseon.svg' },
  { name: 'numbuzin', src: '/static/images/brands/numbuzin.svg' },
  { name: 'Celimax', src: '/static/images/brands/celimax.svg' },
  { name: 'Mary & May', src: '/static/images/brands/mary-and-may.svg' },
  { name: 'A313', src: '/static/images/brands/a313.svg' },
];

const Showcase = () => (
  <div className="flex w-full max-w-[460px] flex-col gap-2">
    <p className="text-xs uppercase tracking-[0.14em] text-text-medium-light">
      Mitenya&apos;da yer alan markalar
    </p>

    <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <div className="flex w-max items-center animate-[mitenya-marquee_28s_linear_infinite] motion-reduce:animate-none">
        {[...BRANDS, ...BRANDS].map((brand, index) => (
          <span
            key={`${brand.name}-${index}`}
            className="flex shrink-0 items-center px-6 text-text-light opacity-75"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand.src}
              alt={brand.name}
              loading="lazy"
              className="block h-[18px] w-auto object-contain"
            />
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default Showcase;
