import { NextResponse } from 'next/server';
import deliverySlotsData from '@/data/delivery-slots.json';

export async function GET() {
  return NextResponse.json(deliverySlotsData);
} 