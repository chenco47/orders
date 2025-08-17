import { NextRequest, NextResponse } from 'next/server';
import productsData from '@/data/products.json';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  
  if (category && category in productsData) {
    return NextResponse.json(productsData[category as keyof typeof productsData]);
  }
  
  // Return all products if no category specified
  const allProducts = Object.values(productsData).flat();
  return NextResponse.json(allProducts);
} 