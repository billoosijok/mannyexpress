export default function SafeMoving() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: 'rgb(210, 235, 247)', color: 'rgb(30, 125, 187)' }}>
              DÉMÉNAGER EN TOUTE SÉCURITÉ
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Nous fournissons des
              <br />
              <span style={{ color: 'rgb(30, 125, 187)' }}>procédures sécurisées</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              La sécurité est notre priorité absolue. Nous suivons des protocoles stricts pour garantir que vos biens sont protégés tout au long du processus de déménagement.
            </p>
            <button className="text-white px-10 py-4 rounded-lg font-semibold transition shadow-lg hover:shadow-xl inline-flex items-center gap-2 group mt-6 hover:opacity-90" style={{ backgroundColor: 'rgb(30, 125, 187)' }}>
              Commencer
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </button>
          </div>

          {/* Right Content - Statistics */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[rgb(30,125,187)] to-[rgb(24,100,150)] text-white p-10 rounded-3xl text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="text-6xl font-bold mb-3">95<span className="text-4xl">%</span></div>
              <div className="text-lg" style={{ color: 'rgb(210, 235, 247)' }}>Taux de satisfaction client</div>
            </div>

            <div className="bg-gradient-to-br from-[rgb(245,186,83)] to-[rgb(237,172,60)] text-white p-10 rounded-3xl text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="text-6xl font-bold mb-3">98<span className="text-4xl">.5%</span></div>
              <div className="text-yellow-50 text-lg">Livraison à l&apos;heure</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
