export default function Experts() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-16">
          <div>
            <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4" style={{ backgroundColor: 'rgb(210, 235, 247)', color: 'rgb(30, 125, 187)' }}>
              RENCONTREZ L&apos;ÉQUIPE
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mt-4">
              Nos <span style={{ color: 'rgb(30, 125, 187)' }}>experts</span>
            </h2>
          </div>
          <button className="hidden md:block text-white px-8 py-3 rounded-lg font-semibold transition shadow-lg hover:opacity-90" style={{ backgroundColor: 'rgb(30, 125, 187)' }}>
            Voir tout
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { name: "Jean Dupont", role: "Déménageur senior", gradient: "from-[rgb(59,145,202)] to-[rgb(30,125,187)]" },
            { name: "Émilie Martin", role: "Responsable des opérations", gradient: "from-purple-400 to-pink-500" },
            { name: "Michel Bernard", role: "Chef d'emballage", gradient: "from-green-400 to-teal-500" },
            { name: "Sophie Laurent", role: "Service client", gradient: "from-[rgb(245,186,83)] to-[rgb(237,172,60)]" }
          ].map((expert, index) => (
            <div key={index} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className={`bg-gradient-to-br ${expert.gradient} h-80 flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <svg className="w-32 h-32 text-white opacity-80 relative z-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="p-6 text-center">
                <h3 className="font-bold text-gray-900 text-xl mb-2">{expert.name}</h3>
                <p className="text-gray-600">{expert.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
