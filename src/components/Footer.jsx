import useTranslations from '../hooks/useTranslations.js';

export default function Footer() {
  const { footer } = useTranslations();

  return (
    <footer className="bg-deep-blue py-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 text-center sm:flex-row sm:text-left">
        <p className="text-sm uppercase tracking-[0.3em]">Kito Marketplace © {new Date().getFullYear()}</p>
        <div className="flex gap-6 text-sm uppercase tracking-[0.3em]">
          <a href="mailto:hola@kito.co" className="hover:text-coral">
            {footer.contact}
          </a>
          <a href="https://www.instagram.com" className="hover:text-coral" target="_blank" rel="noreferrer">
            {footer.instagram}
          </a>
          <a href="https://wa.me/573001112233" className="hover:text-coral" target="_blank" rel="noreferrer">
            {footer.whatsapp}
          </a>
        </div>
      </div>
    </footer>
  );
}
