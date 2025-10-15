export default function Experience() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: 'rgb(210, 235, 247)', color: 'rgb(30, 125, 187)' }}>
              POURQUOI NOUS CHOISIR
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Nous avons <span style={{ color: 'rgb(30, 125, 187)' }}>25+ ans</span> d&apos;expérience
              <br />
              pour vous donner de
              <br />
              meilleurs résultats.
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Notre équipe expérimentée a réalisé avec succès des milliers de déménagements, garantissant une satisfaction client complète à chaque fois.
            </p>
            <button className="text-white px-10 py-4 rounded-lg font-semibold transition shadow-lg hover:shadow-xl inline-flex items-center gap-2 group mt-6 hover:opacity-90" style={{ backgroundColor: 'rgb(30, 125, 187)' }}>
              Commencer
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </button>
          </div>

          {/* Right Content - Feature List */}
          <div className="bg-gradient-to-br from-[rgb(30,125,187)] to-[rgb(24,100,150)] rounded-3xl p-12 text-white shadow-2xl">
            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/40">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Équipe professionnelle</h3>
                  <p className="leading-relaxed" style={{ color: 'rgb(210, 235, 247)' }}>
                    Nos déménageurs sont des professionnels formés avec des années d&apos;expérience dans tous types de déménagements.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/40">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">100% de satisfaction</h3>
                  <p className="leading-relaxed" style={{ color: 'rgb(210, 235, 247)' }}>
                    Nous garantissons votre satisfaction avec nos services ou votre argent sera remboursé. Votre bonheur est notre priorité.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/40">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Devis précis</h3>
                  <p className="leading-relaxed" style={{ color: 'rgb(210, 235, 247)' }}>
                    Tarification transparente avec des estimations détaillées. Pas de frais cachés ni de charges surprises le jour du déménagement.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/40">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Meilleur prix</h3>
                  <p className="leading-relaxed" style={{ color: 'rgb(210, 235, 247)' }}>
                    Tarifs compétitifs sans compromettre la qualité. Obtenez un service premium à un prix abordable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
