'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    addItem(product);
  };

  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          onError={(e) => {
            // Replace with a simple placeholder if external image fails to load
            const target = e.target as HTMLImageElement;
            target.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="200" fill="#f3f4f6"/>
                <rect x="60" y="60" width="80" height="80" fill="#e5e7eb" rx="8"/>
                <circle cx="100" cy="140" r="20" fill="#d1d5db"/>
                <text x="100" y="170" text-anchor="middle" fill="#6b7280" font-size="12" font-family="Arial">Image</text>
              </svg>
            `)}`;
          }}
        />
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
          {product.title}
        </h3>

        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-primary">
            {formatPrice(product.price)}
          </div>

          <Button 
            onClick={handleAddToCart}
            size="sm"
            className="text-sm text-white"
          >
            בחירה
          </Button>
        </div>
      </div>
    </div>
  );
} 