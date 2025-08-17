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

const addressSchema = z.object({
  city: z.string().min(2, 'עיר חייבת להכיל לפחות 2 תווים'),
  street: z.string().min(2, 'רחוב חייב להכיל לפחות 2 תווים'),
  number: z.string().min(1, 'מספר בית חובה'),
  floor: z.string().optional(),
  apartment: z.string().optional(),
});

type AddressForm = z.infer<typeof addressSchema>;

export default function AddressPage() {
  const router = useRouter();
  const { items, getSubtotal } = useCartStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/');
    }
  }, [items, router]);

  const onSubmit = async (data: AddressForm) => {
    setLoading(true);
    
    // Save address to localStorage
    localStorage.setItem('checkout-address', JSON.stringify(data));
    
    // Navigate to delivery step
    router.push('/checkout/delivery');
  };

  if (items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CartDrawer />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CheckoutStepper currentStep="address" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Address Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">כתובת למשלוח</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    עיר *
                  </label>
                  <input
                    {...register('city')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="תל אביב"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>

                {/* Street */}
                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                    רחוב *
                  </label>
                  <input
                    {...register('street')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="דיזנגוף"
                  />
                  {errors.street && (
                    <p className="text-red-500 text-sm mt-1">{errors.street.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* House Number */}
                  <div>
                    <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-2">
                      מספר בית *
                    </label>
                    <input
                      {...register('number')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="123"
                    />
                    {errors.number && (
                      <p className="text-red-500 text-sm mt-1">{errors.number.message}</p>
                    )}
                  </div>

                  {/* Floor */}
                  <div>
                    <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-2">
                      קומה
                    </label>
                    <input
                      {...register('floor')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="3"
                    />
                  </div>
                </div>

                {/* Apartment */}
                <div>
                  <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 mb-2">
                    דירה
                  </label>
                  <input
                    {...register('apartment')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="12"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'שומר...' : 'המשך למשלוח'}
                </Button>
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
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between font-semibold">
                  <span>סה"כ:</span>
                  <span>₪{getSubtotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 