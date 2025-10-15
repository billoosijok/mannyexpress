export default function News() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-16">
          <div>
            <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4" style={{ backgroundColor: 'rgb(210, 235, 247)', color: 'rgb(30, 125, 187)' }}>
              DERNIÈRES NOUVELLES
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mt-4">
              Nos actualités
            </h2>
          </div>
          <button className="hidden md:block text-white px-8 py-3 rounded-lg font-semibold transition shadow-lg hover:opacity-90" style={{ backgroundColor: 'rgb(30, 125, 187)' }}>
            Voir tout
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Fret international, actualités sur l'entreposage",
              date: "8 décembre 2024",
              gradient: "from-[rgb(30,125,187)] to-indigo-600",
              icon: (
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
              )
            },
            {
              title: "La réduction des tarifs de fret stimulera les affaires",
              date: "5 décembre 2024",
              gradient: "from-[rgb(245,186,83)] to-[rgb(237,172,60)]",
              icon: (
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
              )
            },
            {
              title: "Nouvelles techniques d'emballage pour objets fragiles",
              date: "1er décembre 2024",
              gradient: "from-purple-500 to-pink-600",
              icon: (
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
              )
            }
          ].map((news, index) => (
            <article key={index} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className={`bg-gradient-to-br ${news.gradient} h-72 flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <svg className="w-40 h-40 text-white opacity-30" fill="currentColor" viewBox="0 0 20 20">
                  {news.icon}
                </svg>
              </div>
              <div className="p-8">
                <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  {news.date}
                </div>
                <h3 className="font-bold text-gray-900 text-xl mb-4 leading-tight">
                  {news.title}
                </h3>
                <a href="#" className="font-semibold inline-flex items-center gap-2 group/link" style={{ color: 'rgb(30, 125, 187)' }}>
                  Lire la suite
                  <svg className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
