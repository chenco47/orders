'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/header/Header';
import ProductCard from '@/components/product/ProductCard';
import CartDrawer from '@/components/cart/CartDrawer';
import { Product } from '@/types';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch featured products from all categories
    fetch('/api/products')
      .then(res => res.json())
      .then((products: Product[]) => {
        // Take first 8 products as featured
        setFeaturedProducts(products.slice(0, 8));
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch products:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CartDrawer />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Banner */}
        <div className="mb-8">
          <Image
            src="https://res.cloudinary.com/shufersal/image/upload/f_auto,q_auto/v1551800922/prod/cmscontent/h4b/h17/11864384372766/header_summer_may_mobile.jpg"
            alt="הקיץ כבר כאן! עשרות מוצרים בהנחות שוות"
            width={1200}
            height={300}
            className="w-full h-auto rounded-lg"
            priority
          />
        </div>

        {/* Featured Products */}
        <section>
          <h2 className="text-2xl font-bold mb-6">מוצרים מומלצים</h2>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white border border-border rounded-lg overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse" />
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted">
            <p>&copy; 2025 שופרסל אונליין. כל הזכויות שמורות.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
