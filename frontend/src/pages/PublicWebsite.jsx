import React, { Suspense, lazy } from 'react';
import Hero from '../components/public/Hero';
import FadeIn from '../components/common/FadeIn';

// Lazy load below-the-fold components
const FAQ = lazy(() => import('../components/public/FAQ'));
const Contact = lazy(() => import('../components/public/Contact'));
const EquipmentGrid = lazy(() => import('../components/public/EquipmentGrid'));
const Testimonials = lazy(() => import('../components/public/Testimonials'));

export default function PublicWebsite({ onOpenBooking }) {
  return (
    <main className="relative z-10 pb-16 lg:pb-0">
      <Hero onOpenBooking={onOpenBooking} />
      
      <Suspense fallback={null}>
        <FadeIn><EquipmentGrid /></FadeIn>
        <FadeIn><Testimonials /></FadeIn>
        <FadeIn><FAQ /></FadeIn>
        <FadeIn><Contact /></FadeIn>
      </Suspense>
    </main>
  );
}
