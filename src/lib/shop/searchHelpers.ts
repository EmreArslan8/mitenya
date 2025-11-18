import { ReadonlyURLSearchParams } from 'next/navigation';
import { ShopSearchOptions } from '../api/types';

export const searchUrlFromOptions = (options: Partial<ShopSearchOptions>, withSalt = false) => {
  const { category, brand, gender, query, size, sort, nt, nf, ph, xt, collection, price, color } = options;
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

export const mergeSearchOptions = (
  currentOptions: Partial<ShopSearchOptions>,
  optionsToMerge: Partial<ShopSearchOptions>
) => {
  let newOptions = { ...currentOptions };
  Object.entries(optionsToMerge).forEach(([k, v]) => {
    let newValue = newOptions[k as keyof typeof newOptions];
    if (newValue) {
      const newValueList = newValue.toString().split(',');
      const valueToMergeList = v.toString().split(',');
      valueToMergeList.forEach((e) => !newValueList.includes(e) && newValueList.push(e));
      newValue = newValueList.join(',');
    } else newValue = v;
    newOptions[k as keyof typeof newOptions] = newValue as any;
  });
  return newOptions;
};

export const removeSearchOptions = (
  currentOptions: Partial<ShopSearchOptions>,
  optionsToRemove: Partial<ShopSearchOptions>
) => {
  let newOptions = { ...currentOptions };
  Object.entries(optionsToRemove).forEach(([k, v]) => {
    let newValue = newOptions[k as keyof typeof newOptions];
    if (!newValue) return;
    newValue = newValue
      ?.toString()
      .split(',')
      .filter((e) => e !== v.toString())
      .join(',');

    newOptions[k as keyof typeof newOptions] = newValue as any;
  });

  if (!newOptions.brand && !newOptions.category && !newOptions.query) return currentOptions;
  return newOptions;
};

export const searchOptionsFromSearchParams = (searchParams: ReadonlyURLSearchParams) => {
  let options: Partial<ShopSearchOptions> = Object.fromEntries(searchParams.entries());
  if (searchParams.getAll('category').length)
    options.category = searchParams.getAll('category').join(',');
  if (searchParams.getAll('brand').length) options.brand = searchParams.getAll('brand').join(',');
  return options;
};

export default searchUrlFromOptions;
