export default function Services() {
  return (
    <section id="services" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-4" style={{ backgroundColor: 'rgb(210, 235, 247)', color: 'rgb(30, 125, 187)' }}>
            CE QUE NOUS FAISONS
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-4">
            Nos services
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Service 1 */}
          <div className="group bg-white p-6 sm:p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-[rgb(30,125,187)] to-[rgb(24,100,150)] rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Estimation gratuite</h3>
            <p className="text-gray-600 leading-relaxed">
              Obtenez un devis gratuit et sans engagement pour votre déménagement. Nous offrons une tarification transparente sans frais cachés.
            </p>
          </div>

          {/* Service 2 */}
          <div className="group bg-white p-6 sm:p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-[rgb(245,186,83)] to-[rgb(237,172,60)] rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Meilleur tarif</h3>
            <p className="text-gray-600 leading-relaxed">
              Tarifs compétitifs adaptés à votre budget. Nous offrons le meilleur rapport qualité-prix pour des services professionnels.
            </p>
          </div>

          {/* Service 3 */}
          <div className="group bg-white p-6 sm:p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Déménagement rapide</h3>
            <p className="text-gray-600 leading-relaxed">
              Services de déménagement rapides et efficaces. Nous respectons votre temps et assurons une livraison rapide.
            </p>
          </div>

          {/* Service 4 */}
          <div className="group bg-white p-6 sm:p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Emballage sécurisé</h3>
            <p className="text-gray-600 leading-relaxed">
              Services d&apos;emballage professionnels pour protéger vos objets de valeur. Matériaux de haute qualité utilisés.
            </p>
          </div>

          {/* Service 5 */}
          <div className="group bg-white p-6 sm:p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Déménageurs de confiance</h3>
            <p className="text-gray-600 leading-relaxed">
              Professionnels entièrement licenciés, assurés et vérifiés en qui vous pouvez avoir confiance.
            </p>
          </div>

          {/* Service 6 */}
          <div className="group bg-white p-6 sm:p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Support 24/7</h3>
            <p className="text-gray-600 leading-relaxed">
              Support client disponible 24h/24 pour votre tranquillité d&apos;esprit. Nous sommes toujours là pour vous aider.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
