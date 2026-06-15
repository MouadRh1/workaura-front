import Link from "next/link";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Image from "next/image";
export default function Footer() {
  const socialLinks = [
    {
      icon: FaFacebook,
      href: "https://facebook.com/",
      label: "Facebook",
    },
    {
      icon: FaInstagram,
      href: "https://www.instagram.com/workaura.space/",
      label: "Instagram",
    },
    {
      icon: FaLinkedin,
      href: "https://linkedin.com",
      label: "LinkedIn",
    },
    {
      icon: FaXTwitter,
      href: "https://x.com/",
      label: "X",
    },
  ];

  return (
    <footer className="bg-[#0A0A0F] border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Colonne 1 - Description */}
          <div>
            <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F4620A] to-[#9B1FD4] flex items-center justify-center overflow-hidden">
                <Image
                  src="/logo.svg"
                  width={40}
                  height={40}
                  alt="Workaura logo"
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-white font-bold text-xl">WORKAURA</span>
                <span className="text-[#A0A0B8] text-xs block">
                  Working Space
                </span>
              </div>
            </div>
            <p className="text-[#A0A0B8] text-sm text-justify leading-relaxed">
              Workaura est un espace de coworking à Témara proposant des bureaux
              privés, un open space coworking, une salle de réunion et une salle
              de formation. Situé à proximité de Rabat, Workaura accueille
              entrepreneurs, freelances, étudiants, télétravailleurs et
              entreprises à la recherche d'un environnement professionnel
              favorisant la productivité, l'apprentissage et le networking.
            </p>

            {/* Réseaux sociaux */}
            <div className="flex justify-center md:justify-start gap-3 mt-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-gradient-to-r hover:from-[#F4620A] hover:to-[#C040E0] flex items-center justify-center transition-all duration-300 group"
                  aria-label={social.label}
                >
                  <social.icon
                    size={16}
                    className="text-[#A0A0B8] group-hover:text-white transition-colors"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Colonne 2 - Liens rapides */}
          <div className="flex flex-col items-center">
            <h3 className="text-white font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2 text-center">
              <li>
                <Link
                  href="/"
                  className="text-[#A0A0B8] hover:text-white text-sm transition-colors inline-block"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="/espaces"
                  className="text-[#A0A0B8] hover:text-white text-sm transition-colors inline-block"
                >
                  Espaces
                </Link>
              </li>
              <li>
                <Link
                  href="/galerie"
                  className="text-[#A0A0B8] hover:text-white text-sm transition-colors inline-block"
                >
                  Galerie
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-[#A0A0B8] hover:text-white text-sm transition-colors inline-block"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[#A0A0B8] hover:text-white text-sm transition-colors inline-block"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 - Horaires */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-center md:text-left">
              Horaires d'ouverture
            </h3>
            <ul className="space-y-2 text-center md:text-left">
              <li className="flex items-center justify-center md:justify-start gap-2 text-[#A0A0B8] text-sm">
                <Clock size={14} className="text-[#F4620A]" />
                <span>Lundi – Dimanche : 8h30 – 22h00</span>
              </li>
              <li className="text-emerald-400 text-xs flex items-center justify-center md:justify-start gap-2 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Ouvert 7j/7
              </li>
            </ul>
          </div>

          {/* Colonne 4 - Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-center md:text-left">
              Contact
            </h3>
            <ul className="space-y-3 text-center md:text-left">
              <li className="flex items-center justify-center md:justify-start gap-2 text-[#A0A0B8] text-sm">
                <MapPin size={14} className="text-[#F4620A] flex-shrink-0" />
                <span>Témara, Maroc</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2 text-[#A0A0B8] text-sm">
                <Phone size={14} className="text-[#F4620A] flex-shrink-0" />
                <a
                  href="tel:+212600000000"
                  className="hover:text-white transition-colors"
                >
                  +212 6 00 00 00 00
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2 text-[#A0A0B8] text-sm">
                <Mail size={14} className="text-[#F4620A] flex-shrink-0" />
                <a
                  href="mailto:contact@workaura.com"
                  className="hover:text-white transition-colors"
                >
                  contact@workaura.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter (optionnel) */}
        {/* <div className="border-t border-white/10 pt-8 mt-4">
          <div className="max-w-md mx-auto text-center">
            <p className="text-[#A0A0B8] text-sm mb-3">
              Restez informé des actualités Workaura
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-[#A0A0B8] focus:outline-none focus:border-[#F4620A] transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white text-sm font-medium hover:shadow-lg transition-all"
              >
                S'abonner
              </button>
            </form>
          </div>
        </div> */}

        {/* Copyright */}
        <div className="text-center pt-8 mt-4 border-t border-white/10">
          <p className="text-[#A0A0B8] text-sm">
            &copy; {new Date().getFullYear()} WORKAURA. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
