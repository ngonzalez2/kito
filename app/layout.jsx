import './globals.css';
import { Inter, Poppins } from 'next/font/google';
import { LanguageProvider } from '@/context/LanguageContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-heading' });

export const metadata = {
  title: 'Kito Marketplace',
  description: 'Marketplace comunitario de kitesurf para Colombia.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${poppins.variable} bg-white font-body text-deep-blue`}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
