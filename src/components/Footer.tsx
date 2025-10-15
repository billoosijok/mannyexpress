"use client";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid sm:grid-cols-2 gap-8 sm:gap-12 mb-12 sm:mb-16">
          {/* Company Description */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: "rgb(30, 125, 187)" }}
              >
                <svg
                  className="w-7 h-7 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
              </div>
              <div className="text-xl sm:text-2xl font-bold">MANNY EXPRESS</div>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
              Nous sommes une entreprise de déménagement professionnelle dédiée
              à fournir un service exceptionnel et la satisfaction de la
              clientèle.
            </p>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Suivez-nous</h3>
            <div className="flex gap-3 sm:gap-4">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/profile.php?id=61577660656772"
                className="w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg hover:scale-110 transform hover:opacity-90"
                style={{ backgroundColor: "rgb(30, 125, 187)" }}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@manny.express11"
                className="w-12 h-12 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition shadow-lg hover:scale-110 transform"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="https://www.instagram.com/manny_express_11/"
                className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition shadow-lg hover:scale-110 transform"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 5.838a6.162 6.162 0 110 12.324 6.162 6.162 0 010-12.324zM12 16a4 4 0 100-8 4 4 0 000 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 pt-8 sm:pt-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <p className="text-gray-400 text-xs sm:text-sm text-center md:text-left">
              &copy; 2024 Manny Express. Tous droits réservés. Fait avec soin
              par vos partenaires de déménagement de confiance.
            </p>
            {/* <div className="flex gap-8 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition">Politique de confidentialité</a>
              <a href="#" className="text-gray-400 hover:text-white transition">Conditions générales</a>
              <a href="#" className="text-gray-400 hover:text-white transition">Politique de cookies</a>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
