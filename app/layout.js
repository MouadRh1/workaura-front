import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';
import FloatingWhatsApp from './components/ui/FloatingWhatsapp';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Workaura - Espace de Coworking à Témara',
  description: 'Bureaux privés, espaces coworking & salles de réunion premium à Témara. Rejoignez une communauté d\'entrepreneurs ambitieux.',
  keywords: 'coworking, Témara, bureau, espace de travail, freelance, entrepreneur',
  authors: [{ name: 'Workaura' }],
  openGraph: {
    title: 'Workaura - Espace de Coworking',
    description: 'Bureaux privés, espaces coworking & salles de réunion premium à Témara',
    url: 'https://workaura.com',
    siteName: 'Workaura',
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen bg-[#0A0A0F] pt-20">
            {children}
          </main>
          <Footer />
          <FloatingWhatsApp/>
        </AuthProvider>
      </body>
    </html>
  );
}