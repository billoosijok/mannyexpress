export default function Stats() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4" style={{ backgroundColor: 'rgb(210, 235, 247)', color: 'rgb(30, 125, 187)' }}>
            POURQUOI NOUS CHOISIR
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mt-4">
            Nous sommes les
            <br />
            <span style={{ color: 'rgb(30, 125, 187)' }}>Meilleurs déménageurs</span>
          </h2>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Nous avons plus de 25 ans d&apos;expérience dans la fourniture de services de déménagement de qualité supérieure à nos clients. Notre équipe d&apos;experts s&apos;assure que vos biens sont manipulés avec soin.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mt-20">
          {/* Left - Image */}
          <div className="relative">
            <div className="bg-gradient-to-br from-orange-100 via-yellow-100 to-orange-100 rounded-3xl p-12 h-[450px] flex items-center justify-center shadow-xl">
              <div className="relative w-full h-full">
                {/* Stack of boxes with tape */}
                <div className="absolute top-0 left-8 w-40 h-40 bg-orange-200 rounded-2xl shadow-2xl border-8 border-orange-300 transform -rotate-6">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-orange-400"></div>
                  <div className="absolute top-1/2 left-1/2 w-1 h-full bg-orange-400 transform -translate-x-1/2"></div>
                </div>
                <div className="absolute top-16 left-32 w-40 h-40 bg-yellow-200 rounded-2xl shadow-2xl border-8 border-yellow-300 transform rotate-3">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-yellow-400"></div>
                  <div className="absolute top-1/2 left-1/2 w-1 h-full bg-yellow-400 transform -translate-x-1/2"></div>
                </div>
                <div className="absolute top-32 left-56 w-40 h-40 bg-orange-100 rounded-2xl shadow-2xl border-8 border-orange-200 transform -rotate-3">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-orange-300"></div>
                  <div className="absolute top-1/2 left-1/2 w-1 h-full bg-orange-300 transform -translate-x-1/2"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Stats */}
          <div className="space-y-10">
            <div className="flex items-center gap-6 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-md" style={{ backgroundColor: 'rgb(30, 125, 187)' }}>
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900 mb-1">500+</div>
                <div className="text-gray-600 font-medium">Clients satisfaits</div>
              </div>
            </div>

            <div className="flex items-center gap-6 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-md" style={{ backgroundColor: 'rgb(245, 186, 83)' }}>
                  <svg className="w-10 h-10 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900 mb-1">7 448</div>
                <div className="text-gray-600 font-medium">Cartons livrés</div>
              </div>
            </div>

            <div className="pt-4">
              <button className="text-white px-10 py-4 rounded-lg font-semibold transition shadow-lg hover:shadow-xl inline-flex items-center gap-2 group hover:opacity-90" style={{ backgroundColor: 'rgb(30, 125, 187)' }}>
                En savoir plus
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
