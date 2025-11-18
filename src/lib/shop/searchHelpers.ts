import { ReadonlyURLSearchParams } from 'next/navigation';
import { ShopSearchOptions } from '../api/types';

export const searchUrlFromOptions = (
  options: Partial<ShopSearchOptions>,
  withSalt = false
) => {
  const {
    category,
    brand,
    gender,
    query,
    size,
    sort,
    nt,
    nf,
    ph,
    xt,
    collection,
    price,
    color,
  } = options;

  const searchParams = new URLSearchParams();
  if (category) searchParams.append('category', category);
  if (brand) searchParams.append('brand', brand);
  if (gender) searchParams.append('gender', gender);
  if (query) searchParams.append('query', query);
  if (size) searchParams.append('size', size);
  if (sort) searchParams.append('sort', sort);
  if (nt) searchParams.append('nt', 't');
  if (nf) searchParams.append('nf', 't');
  if (ph) searchParams.append('ph', ph);
  if (withSalt) searchParams.append('_', Date.now().toString());
  if (xt) searchParams.append('xt', xt);
  if (collection) searchParams.append('collection', collection);
  if (color) searchParams.append('color', color);
  if (price) searchParams.append('price', price);

  return `/search?${searchParams}`;
};

// ----------------------------------------------------------------------

export const mergeSearchOptions = (
  current: Partial<ShopSearchOptions>,
  merge: Partial<ShopSearchOptions>
) => {
  const newOptions: Partial<ShopSearchOptions> = { ...current };

  Object.entries(merge).forEach(([key, val]) => {
    if (val == null) return;

    const k = key as keyof ShopSearchOptions;
    const existing = newOptions[k];

    const existingStr = existing?.toString() ?? '';
    const valStr = val.toString();

    if (existingStr) {
      const base = existingStr.split(',');
      valStr.split(',').forEach((item) => {
        if (!base.includes(item)) base.push(item);
      });
      newOptions[k] = base.join(',') as any;
    } else {
      newOptions[k] = valStr as any;
    }
  });

  return newOptions;
};


// ----------------------------------------------------------------------

export const removeSearchOptions = (
  current: Partial<ShopSearchOptions>,
  remove: Partial<ShopSearchOptions>
) => {
  const newOptions: Partial<ShopSearchOptions> = { ...current };

  Object.entries(remove).forEach(([key, val]) => {
    const k = key as keyof ShopSearchOptions;
    const existing = newOptions[k];
    if (!existing) return;

    const updated = existing
      .toString()
      .split(',')
      .filter((e) => e !== val!.toString())
      .join(',');

    newOptions[k] = updated as any;
  });

  if (!newOptions.brand && !newOptions.category && !newOptions.query) {
    return current;
  }

  return newOptions;
};

// ----------------------------------------------------------------------

export const searchOptionsFromSearchParams = (
  searchParams: ReadonlyURLSearchParams
) => {
  const options: Partial<ShopSearchOptions> = Object.fromEntries(
    searchParams.entries()
  );

  if (searchParams.getAll('category').length) {
    options.category = searchParams.getAll('category').join(',');
  }

  if (searchParams.getAll('brand').length) {
    options.brand = searchParams.getAll('brand').join(',');
  }

  return options;
};

export default searchUrlFromOptions;
