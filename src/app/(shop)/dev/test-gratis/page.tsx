"use client";

import { useEffect, useState, useRef } from "react";
import { fetchProducts } from "@/lib/api/shop";
import { ShopProductListItemData } from "@/lib/api/types";

export default function TestGratisPage() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ShopProductListItemData[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  // URL'den q parametresi al
  useEffect(() => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("q") || "";
    setQuery(q);
  }, []);

  // İlk yükleme
  useEffect(() => {
    if (!query) return;

    setProducts([]);
    setPage(1);

    const load = async () => {
      setLoading(true);
      const res = await fetchProducts({ query, page: 1 });
      setLoading(false);

      const data = Array.isArray(res) ? res[0] : res;

      setProducts(data?.products ?? []);
      setTotal(data?.totalCount ?? 0);
    };

    load();
  }, [query]);

  // Infinite scroll logic
  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];

        if (first.isIntersecting && !loading && products.length < total) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [products, loading, total]);

  // Bir sonraki sayfayı yükle
  const loadMore = async () => {
    const nextPage = page + 1;
    setLoading(true);

    const res = await fetchProducts({ query, page: nextPage });
    setLoading(false);

    const data = Array.isArray(res) ? res[0] : res;

    setProducts((prev) => [...prev, ...(data?.products ?? [])]);
    setPage(nextPage);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Gratis Test → "{query}" ({products.length}/{total})
      </h1>

      {!query && (
        <div className="text-red-600 mb-4">
          ❗ URL’ye <code>?q=krem</code> ekleyin.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="border rounded-md p-3 bg-white shadow-md hover:shadow-lg transition"
          >
            <img
              src={p.imgSrc}
              alt={p.name}
              className="w-full h-40 object-contain mb-2"
            />
            <div className="text-sm font-semibold line-clamp-2">{p.name}</div>
            <div className="text-xs text-gray-500">{p.brand}</div>
            <div className="text-lg font-bold mt-2">
              {p.price.currentPrice} TL
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-center py-4 text-gray-500">Yükleniyor...</div>
      )}

      {/* Scroll tetikleyici */}
      <div ref={loaderRef} className="h-12"></div>
    </div>
  );
}
