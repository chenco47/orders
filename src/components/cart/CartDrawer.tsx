'use client';

import { useRouter } from 'next/navigation';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer() {
  const router = useRouter();
  const { 
    items, 
    isOpen, 
    setIsOpen, 
    updateQuantity, 
    removeItem, 
    getSubtotal,
    getItemCount 
  } = useCartStore();

  const subtotal = getSubtotal();
  const itemCount = getItemCount();

  const handleCheckout = () => {
    setIsOpen(false);
    router.push('/checkout/address');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed top-0 left-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="text-lg font-semibold">הסל שלך</h2>
            {itemCount > 0 && (
              <span className="bg-primary text-white text-xs rounded-full px-2 py-1">
                {itemCount}
              </span>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center p-4">
              <div>
                <ShoppingCart className="h-12 w-12 text-muted mx-auto mb-4" />
                <p className="text-lg font-medium text-muted mb-2">הסל ריק</p>
                <p className="text-sm text-muted">הוסף מוצרים להתחיל לקנות</p>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">
                        {item.product?.title || 'מוצר לא זמין'}
                      </h4>
                      <p className="text-sm text-muted">
                        {item.product ? formatPrice(item.product.price) : ''}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Total Price */}
                    <div className="text-sm font-medium">
                      {item.product ? formatPrice(item.product.price * item.quantity) : ''}
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                      onClick={() => removeItem(item.productId)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-border p-4 space-y-4">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>סה"כ:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <Button 
                  onClick={handleCheckout}
                  className="w-full"
                  disabled={items.length === 0}
                >
                  לתשלום
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
} 