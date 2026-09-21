import React from 'react';
import { BookingWidget } from './BookingWidget';

export function BookingSection({
  onRequestContact,
}: {
  onRequestContact?: () => void;
}): React.ReactElement {
  return (
    <section
      id="book-a-call"
      aria-labelledby="book-a-call-heading"
      className="py-32 relative border-t border-white/5 scroll-mt-28"
    >
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="text-center mb-12 md:mb-16">
          <h2 id="book-a-call-heading" className="font-serif text-4xl md:text-5xl text-white mb-4">
            Pick a time with Seth
          </h2>
          <p className="text-offwhite/70 text-lg font-light max-w-2xl mx-auto">
            Thirty minutes. Seth takes the call himself. Choose a slot below.
          </p>
        </div>
        <div
          data-booking-panel="true"
          className="relative w-full max-w-lg mx-auto bg-charcoal-dark/90 backdrop-blur-xl border border-offwhite rounded-2xl p-6"
        >
          <BookingWidget variant="inline" onRequestContact={onRequestContact} />
        </div>
      </div>
    </section>
  );
}
