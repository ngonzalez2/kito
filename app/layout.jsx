import './globals.css';
import { Inter, Poppins } from 'next/font/google';
import { LanguageProvider } from '@/context/LanguageContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-heading' });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kito.market';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Kito Marketplace',
  description: 'Marketplace comunitario de kitesurf para Colombia.',
  openGraph: {
    title: 'Kito Marketplace',
    description: 'Marketplace comunitario de kitesurf para Colombia.',
    url: siteUrl,
    siteName: 'Kito Marketplace',
    locale: 'es_CO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kito Marketplace',
    description: 'Marketplace comunitario de kitesurf para Colombia.',
  },
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
