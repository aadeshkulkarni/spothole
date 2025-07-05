import HomePageClient from '@/components/HomePageClient';
import dbConnect from '@/lib/dbConnect';
import Pothole from '@/models/Pothole';
import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Spothole',
  description:
    'Report potholes in your city and help make our roads safer. A civic tech initiative for a better India.',
};

async function getPotholes() {
  noStore();
  await dbConnect();
  try {
    const potholesFromDb = await Pothole.find({})
      .sort({ createdAt: -1 })
      .lean();

    const potholes = potholesFromDb.map((p: any) => ({
      id: p._id.toString(),
      latitude: p.location.coordinates[1],
      longitude: p.location.coordinates[0],
      createdAt: p.createdAt.toString(),
      imageUrl: p.imageUrl,
      description: p.description,
      status: p.status,
    }));

    return potholes;
  } catch (error) {
    console.log('Failed to fetch potholes for server component', error);
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
