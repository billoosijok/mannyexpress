"use client";

export default function Hero() {
  return (
    <section
      id="accueil"
      className="relative bg-gradient-to-br from-[rgb(232,244,250)] via-white to-[rgb(232,244,250)]/30 pt-16 pb-24 overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[rgba(30,125,187,0.05)] rounded-bl-[100px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: "rgb(210, 235, 247)",
                color: "rgb(24, 100, 150)",
              }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              #1 Entreprise de déménagement
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Le meilleur service
              <br />
              <span style={{ color: "rgb(30, 125, 187)" }}>
                de déménagement
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl">
              Que vous déménagiez en ville ou à travers le pays, nous avons
              l&apos;expérience et l&apos;expertise pour rendre votre
              déménagement aussi fluide et sans stress que possible.
            </p>

            <div className="pt-4">
              <a
                href="https://forms.gle/VPC2LoDKGrWDvHaH8"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-gray-900 px-8 py-4 rounded-lg font-semibold transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:opacity-90"
                style={{ backgroundColor: "rgb(245, 186, 83)" }}
              >
                Obtenir un devis
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </a>
            </div>

            {/* Mini Stats */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-8 pt-4">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">500+</div>
                <div className="text-xs sm:text-sm text-gray-600">Clients satisfaits</div>
              </div>
              <div className="w-px h-10 sm:h-12 bg-gray-300"></div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">7 448</div>
                <div className="text-xs sm:text-sm text-gray-600">Cartons déplacés</div>
              </div>
              <div className="w-px h-10 sm:h-12 bg-gray-300"></div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">25+</div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Ans d&apos;expérience
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative h-[300px] sm:h-[400px] lg:h-[600px]">
            <div className="relative z-10 h-full">
              <div className="absolute inset-0 rounded-[2rem] shadow-2xl overflow-hidden">
                <img
                  src="/hero.webp"
                  alt="Manny Express Moving Services"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Decorative elements */}
            <div
              className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10 blur-2xl"
              style={{ backgroundColor: "rgb(30, 125, 187)" }}
            ></div>
            <div
              className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full opacity-10 blur-2xl"
              style={{ backgroundColor: "rgb(245, 186, 83)" }}
            ></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(12deg);
          }
          50% {
            transform: translateY(-20px) rotate(12deg);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px) rotate(-6deg);
          }
          50% {
            transform: translateY(-15px) rotate(-6deg);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite 1s;
        }
      `}</style>
    </section>
  );
}
