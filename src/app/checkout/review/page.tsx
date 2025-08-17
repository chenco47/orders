'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header/Header';
import CartDrawer from '@/components/cart/CartDrawer';
import CheckoutStepper from '@/components/checkout/CheckoutStepper';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart';
import { Address, DeliverySlot, PaymentInfo } from '@/types';
import { formatDate, formatPrice } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

export default function ReviewPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [address, setAddress] = useState<Address | null>(null);
  const [deliverySlot, setDeliverySlot] = useState<DeliverySlot | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    // Redirect if cart is empty
    if (items.length === 0 && !orderComplete) {
      router.push('/');
      return;
    }

    // Check if all previous steps were completed
    const savedAddress = localStorage.getItem('checkout-address');
    const savedDelivery = localStorage.getItem('checkout-delivery');
    const savedPayment = localStorage.getItem('checkout-payment');
    
    if (!savedAddress) {
      router.push('/checkout/address');
      return;
    }
    
    if (!savedDelivery) {
      router.push('/checkout/delivery');
      return;
    }

    if (!savedPayment) {
      router.push('/checkout/payment');
      return;
    }

    setAddress(JSON.parse(savedAddress));
    setDeliverySlot(JSON.parse(savedDelivery));
    setPaymentInfo(JSON.parse(savedPayment));
  }, [items, router, orderComplete]);

  const handlePlaceOrder = async () => {
    if (!address || !deliverySlot || !paymentInfo) return;
    
    setLoading(true);

    const orderData = {
      items,
      address,
      deliverySlot,
      payment: paymentInfo,
      subtotal: getSubtotal(),
      deliveryFee: deliverySlot.price,
      total: getSubtotal() + deliverySlot.price,
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      
      if (response.ok) {
        setOrderId(result.orderId);
        setOrderComplete(true);
        clearCart();
        
        // Clear checkout data
        localStorage.removeItem('checkout-address');
        localStorage.removeItem('checkout-delivery');
        localStorage.removeItem('checkout-payment');
      } else {
        throw new Error('Order failed');
      }
    } catch (error) {
      console.error('Order failed:', error);
      alert('אירעה שגיאה בעת ביצוע ההזמנה. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <CartDrawer />
        
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="bg-white border border-border rounded-lg p-8">
            <CheckCircle className="mx-auto h-16 w-16 text-accent mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              ההזמנה בוצעה בהצלחה!
            </h1>
            <p className="text-lg text-muted mb-6">
              מספר הזמנה: <span className="font-semibold">{orderId}</span>
            </p>
            <p className="text-muted mb-8">
              קיבלת אימייל עם פרטי ההזמנה. המוצרים יגיעו אליך במועד שנבחר.
            </p>
            <Button onClick={() => router.push('/')} size="lg">
              חזור לעמוד הבית
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!address || !deliverySlot || !paymentInfo) {
    return null;
  }

  const totalAmount = getSubtotal() + deliverySlot.price;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CartDrawer />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CheckoutStepper currentStep="review" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Review */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">כתובת למשלוח</h3>
              <div className="text-sm text-gray-600">
                <p>{address.street} {address.number}</p>
                {address.floor && <p>קומה {address.floor}</p>}
                {address.apartment && <p>דירה {address.apartment}</p>}
                <p>{address.city}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/checkout/address')}
                className="mt-3"
              >
                ערוך כתובת
              </Button>
            </div>

            {/* Delivery Time */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">זמן משלוח</h3>
              <div className="text-sm text-gray-600">
                <p className="font-medium">{formatDate(deliverySlot.date)}</p>
                <p>{deliverySlot.window}</p>
                <p>עלות משלוח: {formatPrice(deliverySlot.price)}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/checkout/delivery')}
                className="mt-3"
              >
                שנה זמן משלוח
              </Button>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">אמצעי תשלום</h3>
              <div className="text-sm text-gray-600">
                <p>כרטיס אשראי המסתיים ב-{paymentInfo.cardNumber.slice(-4)}</p>
                <p>בעל הכרטיס: {paymentInfo.holderName}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/checkout/payment')}
                className="mt-3"
              >
                שנה אמצעי תשלום
              </Button>
            </div>

            {/* Order Items */}
            <div className="bg-white border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">המוצרים שלך</h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.product?.title}</h4>
                      <p className="text-sm text-muted">כמות: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium">
                      {formatPrice((item.product?.price || 0) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Place Order Button */}
            <Button 
              onClick={handlePlaceOrder}
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? 'מבצע הזמנה...' : `בצע הזמנה - ${formatPrice(totalAmount)}`}
            </Button>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white border border-border rounded-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">סיכום תשלום</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span>סה"כ מוצרים:</span>
                  <span>₪{getSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>משלוח:</span>
                  <span>₪{deliverySlot.price.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between font-semibold text-lg">
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