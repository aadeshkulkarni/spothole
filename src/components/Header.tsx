'use client';

interface HeaderProps {
  onLogoClick: () => void;
}

const Header = ({ onLogoClick }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 z-[2000] p-4">
      <button
        onClick={onLogoClick}
        className="flex items-center justify-end gap-1 rounded bg-white px-4 py-2 shadow-md"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 animate-pulse text-sky-600"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 20l-4.95-5.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
        <h1 className="animate-in text-2xl font-bold tracking-tight text-gray-900">
          Spothole
        </h1>
      </button>
    </header>
  );
};

export default Header;
