'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/header/Header';
import ProductCard from '@/components/product/ProductCard';
import CartDrawer from '@/components/cart/CartDrawer';
import { MagicComponent } from '@/components/magic';
import { Product } from '@/types';
import { useCartStore } from '@/store/cart';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, setIsOpen } = useCartStore();

  // Helper function to find existing product data by name
  const findExistingProduct = async (productName: string): Promise<Product | null> => {
    try {
      const response = await fetch('/api/products');
      const allProducts: Product[] = await response.json();
      
      // Find product by matching title (name)
      const existingProduct = allProducts.find(p => 
        p.title === productName || 
        p.title.includes(productName) || 
        productName.includes(p.title)
      );
      
      return existingProduct || null;
    } catch (error) {
      console.error('Failed to fetch existing products:', error);
      return null;
    }
  };

  const handleMagicSend = async (text: string) => {
    console.log('Magic component sent:', text);
    
    try {
      const response = await fetch('http://localhost:8080/api/analyze-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const orderAnalysis = await response.json();
      
      if (orderAnalysis.success && orderAnalysis.order?.items) {
        console.log('Order analysis successful:', orderAnalysis);
        
        // Convert AI response items to Product objects and add to cart
        let addedItemsCount = 0;
        
        for (const item of orderAnalysis.order.items) {
          // Try to find existing product data first
          const existingProduct = await findExistingProduct(item.name);
          
          // Convert AI response item to Product format
          const product: Product = existingProduct || {
            id: item.product_id,
            title: item.name,
            price: item.price_per_unit,
            category: 'ai-detected', // Default category for AI-detected items
            image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop', // Default grocery image
          };
          
          // Add each quantity as separate additions to cart
          for (let i = 0; i < Math.floor(item.quantity); i++) {
            addItem(product);
            addedItemsCount++;
          }
        }
        
        if (addedItemsCount > 0) {
          // Open cart drawer to show added items
          setIsOpen(true);
        }
        
      } else {
        console.log('Order analysis failed:', orderAnalysis);
        alert(`לא הצלחתי לזהות מוצרים מהטקסט: ${orderAnalysis.message || orderAnalysis.error}`);
      }
    } catch (error) {
      console.error('Failed to analyze order:', error);
      alert('שגיאה בחיבור לשרת. וודא שהשרת פועל.');
    }
  };

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

        {/* Magic Component Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-right">רכיב קולי חכם</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <MagicComponent onSend={handleMagicSend} />
          </div>
        </section>

        {/* Featured Products */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-right">מוצרים מומלצים</h2>
          
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
