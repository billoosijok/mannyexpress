'use client';

import { useState } from 'react';

export default function Testimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sophie Martin",
      role: "Propriétaire",
      text: "Service exceptionnel du début à la fin ! L'équipe était professionnelle, a pris soin de nos biens et a rendu notre déménagement sans stress. Je recommande vivement leurs services.",
      rating: 5
    },
    {
      name: "Marc Dubois",
      role: "Chef d'entreprise",
      text: "Nous devions déménager notre bureau rapidement, et ils ont livré parfaitement. Un temps d'arrêt minimal et tout est arrivé en toute sécurité. Un professionnalisme exceptionnel !",
      rating: 5
    },
    {
      name: "Julie Lambert",
      role: "Résidente",
      text: "Meilleure expérience de déménagement que j'aie jamais eue. Ils étaient ponctuels, efficaces et ont manipulé mes objets fragiles avec un soin extrême. Ça vaut chaque centime !",
      rating: 5
    }
  ];

  return (
    <section id="temoignages" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-4" style={{ backgroundColor: 'rgb(210, 235, 247)', color: 'rgb(30, 125, 187)' }}>
            TÉMOIGNAGES
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-4">
            Ce que disent nos clients
          </h2>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Testimonial Image Background */}
          <div className="bg-gradient-to-br from-[rgb(210,235,247)] via-[rgb(232,244,250)] to-[rgb(210,235,247)] rounded-3xl p-8 sm:p-12 h-[300px] sm:h-[400px] lg:h-[450px] mb-12 flex items-center justify-center shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgb(178,218,237)]/50 to-transparent"></div>
            <div className="relative z-10">
              <div className="w-28 h-28 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-white rounded-full flex items-center justify-center shadow-2xl">
                <svg className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'rgb(59, 145, 202)' }}>
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Testimonial Content Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl max-w-4xl mx-auto -mt-24 sm:-mt-32 relative z-10">
            <div className="flex items-center justify-center mb-6">
              <div className="flex gap-2">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
            </div>

            <p className="text-gray-700 text-base sm:text-lg lg:text-xl text-center mb-6 sm:mb-8 leading-relaxed italic">
              &ldquo;{testimonials[currentTestimonial].text}&rdquo;
            </p>

            <div className="text-center mb-6 sm:mb-8">
              <h4 className="font-bold text-gray-900 text-xl sm:text-2xl mb-1">{testimonials[currentTestimonial].name}</h4>
              <p className="text-gray-600 text-sm sm:text-base">{testimonials[currentTestimonial].role}</p>
            </div>

            {/* Navigation */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                className="w-12 h-12 text-white rounded-full flex items-center justify-center transition shadow-lg hover:shadow-xl hover:opacity-90"
                style={{ backgroundColor: 'rgb(30, 125, 187)' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                className="w-12 h-12 text-white rounded-full flex items-center justify-center transition shadow-lg hover:shadow-xl hover:opacity-90"
                style={{ backgroundColor: 'rgb(30, 125, 187)' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            {/* Dots indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`h-3 rounded-full transition-all ${
                    index === currentTestimonial ? 'w-8' : 'w-3 bg-gray-300'
                  }`}
                  style={index === currentTestimonial ? { backgroundColor: 'rgb(30, 125, 187)' } : {}}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
