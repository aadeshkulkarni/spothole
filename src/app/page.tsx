import HomePageClient from '@/components/HomePageClient';
import dbConnect from '@/lib/dbConnect';
import Pothole from '@/models/Pothole';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Spothole',
  description:
    'Report potholes in your city and help make our roads safer. A civic tech initiative for a better India.',
};

async function getPotholes() {
  await dbConnect();
  try {
    const potholes = await Pothole.find({}).sort({ createdAt: -1 }).lean();
    // Mongoose documents are not plain objects, so we need to serialize them
    return JSON.parse(JSON.stringify(potholes));
  } catch (error) {
    console.error('Failed to fetch potholes for server component', error);
    return [];
  }
}

export default async function Home() {
  const initialPotholes = await getPotholes();

  return (
    <Suspense fallback={<main className="relative h-screen w-screen" />}>
      <HomePageClient initialPotholes={initialPotholes} />
    </Suspense>
  );
}
