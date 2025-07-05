'use client';

import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  onLogoClick: () => void;
}

const Header = ({ onLogoClick }: HeaderProps) => {
  const t = useTranslations('Header');

  return (
    <header className="fixed top-0 left-0 z-[2000] flex w-full items-center justify-between bg-white p-4 shadow-lg md:bg-transparent md:shadow-none">
      <button
        onClick={onLogoClick}
        className="flex items-end justify-end gap-1 rounded bg-transparent px-0 py-0 shadow-none md:bg-white md:px-4 md:py-2 md:shadow-md"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-sky-600 md:animate-pulse"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 20l-4.95-5.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:animate-in">
          {t('title')}
        </h1>
      </button>

      <div className="rounded bg-transparent shadow-none md:bg-black/50 md:px-2 md:py-1 md:shadow-md">
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;
