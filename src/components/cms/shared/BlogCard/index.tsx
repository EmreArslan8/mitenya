import Link from '@/components/common/Link';
import CMSImage from '@/components/cms/shared/CMSImage';
import { ArrowRight, Calendar } from '@/components/icons';
import { cn } from '@/lib/utils/cn';

export interface BlogCardProps {
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: { url: string; alternativeText?: string };
  publishedAt?: string;
  category?: string;
  featured?: boolean;
}

const BlogCard = ({ slug, title, excerpt, coverImage, publishedAt, category, featured = false }: BlogCardProps) => {
  const imageSizes = featured ? '(max-width: 900px) 100vw, 55vw' : '(max-width: 900px) 110px, 33vw';
  const formattedDate = publishedAt ? new Date(publishedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

  return (
    <Link href={`/blog/${slug}`} aria-label={`${title} yazısını oku`} style={{ display: 'block', height: '100%', textDecoration: 'none' }}>
      <article className={cn(
        'group relative isolate flex h-full overflow-hidden border border-white/[88%] bg-white/[68%] p-2 shadow-[0_10px_34px_rgba(28,28,30,0.07),inset_0_1px_0_rgba(255,255,255,0.88)] backdrop-blur-[18px] transition-[transform,box-shadow,background-color,border-color] duration-400 after:absolute after:-z-1 after:rounded-full after:bg-accentRed/[5.5%] after:opacity-65 after:blur-[10px] after:transition-[opacity,transform] after:duration-500 hover:border-accentRed/25 hover:bg-white/[78%] hover:after:scale-125 hover:after:opacity-100 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:after:scale-100',
        featured ? 'flex-col p-2 after:-bottom-[70px] after:-right-[50px] after:h-[180px] after:w-[180px] md:flex-row md:p-2.5 md:hover:-translate-y-[7px] md:hover:shadow-[0_22px_52px_rgba(28,28,30,0.13),inset_0_1px_0_rgba(255,255,255,0.96)]' : 'flex-row after:-bottom-[70px] after:-right-[50px] after:h-[120px] after:w-[120px] md:flex-col md:hover:-translate-y-[7px] md:hover:shadow-[0_22px_52px_rgba(28,28,30,0.13),inset_0_1px_0_rgba(255,255,255,0.96)]',
      )}>
        <div className={cn('relative shrink-0 overflow-hidden bg-gray-50/[82%] shadow-[0_4px_18px_rgba(28,28,30,0.08)]', featured ? 'aspect-video min-h-[200px] w-full md:aspect-auto md:min-h-80 md:w-[55%]' : 'aspect-square min-h-[106px] w-[110px] md:aspect-[16/10] md:min-h-0 md:w-full')}>
          {coverImage ? <CMSImage src={coverImage.url} alt={coverImage.alternativeText || title} fill sizes={imageSizes} className="object-cover transition-transform duration-700 group-hover:scale-[1.045] motion-reduce:transition-none motion-reduce:group-hover:scale-100" /> : <div className="absolute inset-0 flex items-center justify-center bg-gray-50/[82%]"><span className="text-[40px] font-bold text-gray-300">M</span></div>}
          {category ? <span className="absolute left-3 top-3 z-1 rounded-full bg-white/[72%] px-[11.2px] py-[5.2px] text-[10px] font-bold uppercase tracking-[0.07em] text-gray-700 shadow-[0_4px_14px_rgba(28,28,30,0.1)] backdrop-blur-[10px]">{category}</span> : null}
        </div>
        <div className={cn('flex flex-1 flex-col', featured ? 'justify-center gap-3.5 p-4 md:p-8' : 'gap-[4.4px] p-2.5 md:gap-[10.8px] md:p-[18px]')}>
          {formattedDate ? <div className="flex items-center gap-1.5 text-gray-400"><Calendar size={13} /><span className={cn('font-semibold tracking-[0.01em] text-gray-500', featured ? 'text-[11px] md:text-[13px]' : 'text-[11px] md:text-xs')}>{formattedDate}</span></div> : null}
          <h3 className={cn('line-clamp-2 overflow-hidden font-bold leading-[1.28] tracking-[-0.025em] text-[rgb(32,32,34)]', featured ? 'line-clamp-3 text-lg md:text-2xl' : 'text-sm md:text-base')}>{title}</h3>
          {excerpt ? <p className={cn('overflow-hidden leading-[1.6] text-[rgb(98,98,103)]', featured ? 'line-clamp-3 text-[13px] md:text-[15px]' : 'hidden text-[13px] md:line-clamp-2')}>{excerpt}</p> : null}
          <div className={cn('hidden flex-row items-center gap-1.5 md:flex', featured ? 'mt-2' : 'mt-auto pt-2')}><span className="text-[13px] font-bold text-[rgb(53,53,56)]">Devamını Oku</span><span className="ml-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-accentRed/[8%] text-accentRed transition-[transform,background-color,color] duration-300 group-hover:translate-x-1 group-hover:bg-accentRed group-hover:text-white"><ArrowRight size={16} /></span></div>
        </div>
      </article>
    </Link>
  );
};

export default BlogCard;
