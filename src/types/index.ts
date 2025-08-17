export interface Product {
  id: string;
  title: string;
  image: string;
  price: number;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
}

export interface DeliverySlot {
  id: string;
  date: string;
  window: string;
  price: number;
}

export interface Address {
  city: string;
  street: string;
  number: string;
  floor?: string;
  apartment?: string;
}

export interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  holderName: string;
}

export interface Order {
  orderId: string;
  status: 'confirmed' | 'processing' | 'delivered';
  items: CartItem[];
  address: Address;
  deliverySlot: DeliverySlot;
  payment: PaymentInfo;
  total: number;
} 