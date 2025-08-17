'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Header from '@/components/header/Header';
import CartDrawer from '@/components/cart/CartDrawer';
import CheckoutStepper from '@/components/checkout/CheckoutStepper';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { DeliverySlot } from '@/types';
import { formatPrice } from '@/lib/utils';

const paymentSchema = z.object({
  cardNumber: z.string().min(16, 'מספר כרטיס חייב להכיל 16 ספרות').max(19, 'מספר כרטיס לא תקין'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'תאריך תפוגה לא תקין (MM/YY)'),
  cvv: z.string().min(3, 'CVV חייב להכיל 3 ספרות').max(4, 'CVV לא תקין'),
  holderName: z.string().min(2, 'שם בעל הכרטיס חובה'),
});

type PaymentForm = z.infer<typeof paymentSchema>;

export default function PaymentPage() {
  const router = useRouter();
  const { items, getSubtotal } = useCartStore();
  const [deliverySlot, setDeliverySlot] = useState<DeliverySlot | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
  });

  const cardNumber = watch('cardNumber');

  useEffect(() => {
    // Redirect if cart is empty
    if (items.length === 0) {
      router.push('/');
      return;
    }

    // Check if previous steps were completed
    const savedAddress = localStorage.getItem('checkout-address');
    const savedDelivery = localStorage.getItem('checkout-delivery');
    
    if (!savedAddress) {
      router.push('/checkout/address');
      return;
    }
    
    if (!savedDelivery) {
      router.push('/checkout/delivery');
      return;
    }

    setDeliverySlot(JSON.parse(savedDelivery));
  }, [items, router]);

  // Format card number
  useEffect(() => {
    if (cardNumber) {
      const formatted = cardNumber.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formatted !== cardNumber) {
        setValue('cardNumber', formatted);
      }
    }
  }, [cardNumber, setValue]);

  const onSubmit = async (data: PaymentForm) => {
    setLoading(true);
    
    // Save payment info to localStorage
    localStorage.setItem('checkout-payment', JSON.stringify(data));
    
    // Navigate to review step
    router.push('/checkout/review');
  };

  if (items.length === 0 || !deliverySlot) {
    return null;
  }

  const totalAmount = getSubtotal() + deliverySlot.price;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CartDrawer />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CheckoutStepper currentStep="payment" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">פרטי תשלום</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Card Number */}
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    מספר כרטיס אשראי *
                  </label>
                  <input
                    {...register('cardNumber')}
                    type="text"
                    maxLength={19}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="1234 5678 9012 3456"
                  />
                  {errors.cardNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.cardNumber.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Expiry Date */}
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                      תאריך תפוגה *
                    </label>
                    <input
                      {...register('expiryDate')}
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {errors.expiryDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.expiryDate.message}</p>
                    )}
                  </div>

                  {/* CVV */}
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                      CVV *
                    </label>
                    <input
                      {...register('cvv')}
                      type="text"
                      maxLength={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="123"
                    />
                    {errors.cvv && (
                      <p className="text-red-500 text-sm mt-1">{errors.cvv.message}</p>
                    )}
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label htmlFor="holderName" className="block text-sm font-medium text-gray-700 mb-2">
                    שם בעל הכרטיס *
                  </label>
                  <input
                    {...register('holderName')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="ישראל ישראלי"
                  />
                  {errors.holderName && (
                    <p className="text-red-500 text-sm mt-1">{errors.holderName.message}</p>
                  )}
                </div>

                <div className="flex gap-4 mt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/checkout/delivery')}
                    className="flex-1"
                  >
                    חזור למשלוח
                  </Button>
                  <Button 
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'שומר...' : 'המשך לסיכום'}
                  </Button>
                </div>
              </form>
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
                <div className="flex justify-between text-sm">
                  <span>משלוח:</span>
                  <span>₪{deliverySlot.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>סה"כ לתשלום:</span>
                  <span>₪{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 