// components/ui/Navbar.jsx
'use client';
import { useState, useEffect } from 'react';
import { Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Image from 'next/image';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Espaces', path: '/espaces' },
    { name: 'Galerie', path: '/galerie' },
    { name: 'À propos', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleScrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLinkClick = (e, path) => {
    if (path.startsWith('/#')) {
      e.preventDefault();
      const id = path.substring(2);
      if (pathname === '/') {
        handleScrollToSection(id);
      } else {
        router.push('/');
        setTimeout(() => {
          handleScrollToSection(id);
        }, 100);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0A0A0F]/85 backdrop-blur-[20px] border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F4620A] to-[#9B1FD4] flex items-center justify-center overflow-hidden">
              <Image 
                src="/logo.svg" 
                width={40} 
                height={40} 
                alt="Workaura logo"
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-xl tracking-tight">WORKAURA</span>
              <span className="text-[#A0A0B8] text-xs">Working Space</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              if (link.path.startsWith('/#')) {
                return (
                  <a
                    key={link.name}
                    href={link.path}
                    onClick={(e) => handleLinkClick(e, link.path)}
                    className="text-[#A0A0B8] hover:text-white transition-colors text-sm font-medium cursor-pointer"
                  >
                    {link.name}
                  </a>
                );
              }
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`text-sm font-medium transition-colors ${
                    pathname === link.path ? 'text-white' : 'text-[#A0A0B8] hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  href={isAdmin ? '/admin/dashboard' : '/profile'}
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 text-white text-sm font-medium"
                >
                  <UserIcon size={18} />
                  <span>{user?.name?.split(' ')[0] || user?.name || 'Profil'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 transition-all duration-300 text-red-400 text-sm font-medium"
                >
                  <LogOut size={18} />
                  Déconnexion
                </button>
                <Link
                  href="/espaces"
                  className="hidden md:block px-6 py-3 rounded-full bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white font-medium text-sm hover:shadow-[0_8px_32px_rgba(244,98,10,0.4)] transition-all duration-300 hover:scale-105"
                >
                  Réserver maintenant
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden md:block px-6 py-3 rounded-full border border-white/20 hover:border-[#F4620A] text-white font-medium text-sm transition-all duration-300"
                >
                  Se connecter
                </Link>
                <Link
                  href="/espaces"
                  className="hidden md:block px-6 py-3 rounded-full bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white font-medium text-sm hover:shadow-[0_8px_32px_rgba(244,98,10,0.4)] transition-all duration-300 hover:scale-105"
                >
                  Réserver maintenant
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-white/5 py-4">
            <div className="flex flex-col gap-4 px-6">
              {navLinks.map((link) => {
                if (link.path.startsWith('/#')) {
                  return (
                    <a
                      key={link.name}
                      href={link.path}
                      onClick={(e) => {
                        setIsMobileMenuOpen(false);
                        handleLinkClick(e, link.path);
                      }}
                      className="text-[#A0A0B8] hover:text-white transition-colors text-sm font-medium py-2 cursor-pointer"
                    >
                      {link.name}
                    </a>
                  );
                }
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    className="text-[#A0A0B8] hover:text-white transition-colors text-sm font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              })}
              
              <hr className="border-white/10 my-2" />
              
              {isAuthenticated ? (
                <>
                  <Link
                    href={isAdmin ? '/admin/dashboard' : '/profile'}
                    className="px-6 py-3 rounded-full bg-white/10 text-white font-medium text-sm text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Mon profil
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-6 py-3 rounded-full bg-red-500/10 text-red-400 font-medium text-sm text-center"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-6 py-3 rounded-full border border-white/20 text-white font-medium text-sm text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/espaces"
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-[#F4620A] to-[#C040E0] text-white font-medium text-sm text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Réserver maintenant
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}