'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header/Header';
import CartDrawer from '@/components/cart/CartDrawer';
import CheckoutStepper from '@/components/checkout/CheckoutStepper';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { DeliverySlot } from '@/types';
import { formatDate, formatPrice } from '@/lib/utils';

export default function DeliveryPage() {
  const router = useRouter();
  const { items, getSubtotal } = useCartStore();
  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if cart is empty
    if (items.length === 0) {
      router.push('/');
      return;
    }

    // Check if address was filled
    const savedAddress = localStorage.getItem('checkout-address');
    if (!savedAddress) {
      router.push('/checkout/address');
      return;
    }

    // Fetch delivery slots
    fetch('/api/delivery/slots')
      .then(res => res.json())
      .then(setDeliverySlots)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [items, router]);

  const handleContinue = () => {
    if (!selectedSlot) return;
    
    const slot = deliverySlots.find(s => s.id === selectedSlot);
    if (slot) {
      localStorage.setItem('checkout-delivery', JSON.stringify(slot));
      router.push('/checkout/payment');
    }
  };

  if (items.length === 0 || loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CartDrawer />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CheckoutStepper currentStep="delivery" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Delivery Slots */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">בחר זמן משלוח</h2>
              
              <div className="space-y-4">
                {deliverySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedSlot === slot.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSlot(slot.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">
                          {formatDate(slot.date)}
                        </h3>
                        <p className="text-sm text-muted">
                          {slot.window}
                        </p>
                      </div>
                      <div className="text-lg font-semibold">
                        {formatPrice(slot.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/checkout/address')}
                  className="flex-1"
                >
                  חזור לכתובת
                </Button>
                <Button 
                  onClick={handleContinue}
                  disabled={!selectedSlot}
                  className="flex-1"
                >
                  המשך לתשלום
                </Button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white border border-border rounded-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">סיכום הזמנה</h3>
              
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>{item.product?.title} (x{item.quantity})</span>
                    <span>₪{((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>סה"כ מוצרים:</span>
                  <span>₪{getSubtotal().toFixed(2)}</span>
                </div>
                {selectedSlot && (
                  <div className="flex justify-between text-sm">
                    <span>משלוח:</span>
                    <span>₪{deliverySlots.find(s => s.id === selectedSlot)?.price.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>סה"כ:</span>
                  <span>
                    ₪{(getSubtotal() + (selectedSlot ? deliverySlots.find(s => s.id === selectedSlot)?.price || 0 : 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 