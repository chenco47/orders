'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { Category } from '@/types';

export default function Header() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const { getItemCount, setIsOpen } = useCartStore();

  useEffect(() => {
    setMounted(true);
    fetch('/api/categories')
      .then(res => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  // Prevent hydration mismatch by only showing cart count after mount
  const itemCount = mounted ? getItemCount() : 0;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Cart Button - Left Side */}
          <Button
            variant="outline"
            size="default"
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-2"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>הסל שלך</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Button>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted h-5 w-5" />
              <input
                type="text"
                placeholder="חיפוש מוצרים..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pr-12 pl-4 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-right"
                dir="rtl"
              />
            </div>
          </div>

          {/* Logo - Right Side */}
          <Link href="/" className="flex items-center">
            <Image
              src="https://www.shufersal.co.il/online/medias/sys_master/root/h18/hc4/11095082172446/logo-online.png"
              alt="שופרסל אונליין"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>
        </div>
      </div>

      {/* Category Pills */}
      <div className="bg-gray-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-3 overflow-x-auto">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-white border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
} 