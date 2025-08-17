import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // In a real app, this would process the order
  // For now, just return a dummy confirmation
  
  const orderData = await request.json();
  
  const dummyResponse = {
    orderId: `DUMMY${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    status: 'confirmed' as const,
    estimatedDelivery: orderData.deliverySlot?.window || '10:00-13:00',
    total: orderData.total || 0
  };
  
  return NextResponse.json(dummyResponse);
} 