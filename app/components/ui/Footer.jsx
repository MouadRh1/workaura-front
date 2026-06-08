import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0F] border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F4620A] to-[#C040E0] flex items-center justify-center">
                <span className="text-white font-bold">WA</span>
              </div>
              <div>
                <span className="text-white font-bold text-xl">WORKAURA</span>
                <span className="text-[#A0A0B8] text-xs block">
                  Working Space
                </span>
              </div>
            </div>
            <p className="text-[#A0A0B8] text-sm">
              Workaura est un espace de coworking à Témara proposant des bureaux
              privés, un open space coworking, une salle de réunion et une salle
              de formation. Situé à proximité de Rabat, Workaura accueille
              entrepreneurs, freelances, étudiants, télétravailleurs et
              entreprises à la recherche d'un environnement professionnel
              favorisant la productivité, l'apprentissage et le networking.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-[#A0A0B8] hover:text-white text-sm"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="/espaces"
                  className="text-[#A0A0B8] hover:text-white text-sm"
                >
                  Espaces
                </Link>
              </li>
              <li>
                <Link
                  href="/galerie"
                  className="text-[#A0A0B8] hover:text-white text-sm"
                >
                  Galerie
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[#A0A0B8] hover:text-white text-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Horaires</h3>
            <ul className="space-y-2">
              <li className="text-[#A0A0B8] text-sm">
                Lundi - Vendredi: 9h - 20h
              </li>
              <li className="text-[#A0A0B8] text-sm">Samedi: 10h - 18h</li>
              <li className="text-[#A0A0B8] text-sm">Dimanche: Fermé</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-[#A0A0B8] text-sm">Témara, Maroc</li>
              <li className="text-[#A0A0B8] text-sm">+212 5XX XXX XXX</li>
              <li className="text-[#A0A0B8] text-sm">contact@workaura.com</li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-white/10">
          <p className="text-[#A0A0B8] text-sm">
            &copy; 2024 WORKAURA. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
