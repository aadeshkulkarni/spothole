'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { Button } from './ui/button';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const otherLocale = locale === 'en' ? 'hi' : 'en';

  const handleClick = () => {
    router.push(pathname, { locale: otherLocale });
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className="w-auto justify-start p-2 text-base font-medium text-gray-800 hover:bg-gray-100 md:text-white md:hover:bg-white/10 md:hover:text-white"
    >
      {otherLocale === 'en' ? 'English' : 'हिंदी'}
    </Button>
  );
}
