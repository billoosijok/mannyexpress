export default function Partnership() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4" style={{ backgroundColor: 'rgb(210, 235, 247)', color: 'rgb(30, 125, 187)' }}>
            NOTRE ÉQUIPE
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mt-4">
            Nous travaillons en partenariat
            <br />
            avec des personnes formidables
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: "Déménagement résidentiel", desc: "Déménagement professionnel de maisons", gradient: "from-[rgb(59,145,202)] to-[rgb(30,125,187)]" },
            { title: "Services d'emballage", desc: "Emballage et déballage experts", gradient: "from-[rgb(245,186,83)] to-[rgb(237,172,60)]" },
            { title: "Relocalisation de bureaux", desc: "Déménagements d'entreprise sans faille", gradient: "from-purple-400 to-pink-500" },
            { title: "Solutions de stockage", desc: "Installations de stockage sécurisées", gradient: "from-green-400 to-teal-500" },
            { title: "Entreposage", desc: "Stockage à température contrôlée", gradient: "from-red-400 to-orange-500" },
            { title: "Manipulation critique", desc: "Soin spécial pour les objets fragiles", gradient: "from-indigo-400 to-purple-500" }
          ].map((item, index) => (
            <div key={index} className="group relative overflow-hidden rounded-3xl h-96 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`}>
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
              <div className="absolute inset-0 flex items-end p-8">
                <div className="bg-white rounded-2xl p-6 w-full transform group-hover:-translate-y-2 transition-transform">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
              {/* Icon overlay */}
              <div className="absolute top-8 right-8">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
