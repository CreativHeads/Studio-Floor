import React from 'react';
import Hero from '../components/public/Hero';
import FAQ from '../components/public/FAQ';
import Contact from '../components/public/Contact';
import EquipmentGrid from '../components/public/EquipmentGrid';
import Testimonials from '../components/public/Testimonials';

export default function PublicWebsite({ onOpenBooking }) {
  return (
    <main className="relative z-10 pb-16 lg:pb-0">
      <Hero onOpenBooking={onOpenBooking} />
      <EquipmentGrid />
      <Testimonials />
      <FAQ />
      <Contact />
    </main>
  );
}
