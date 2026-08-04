'use client';

import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { useState } from 'react';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale = pathname?.split('/')[1] || 'en';

  const switchLanguage = (locale: string) => {
    const path = pathname?.split('/').slice(2).join('/') || '';
    router.push(`/${locale}/${path}`);
    setIsOpen(false);
  };

  const currentLang = languages.find(l => l.code === currentLocale) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition"
      >
        <Globe className="h-4 w-4" />
        <span>{currentLang.flag} {currentLang.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={`w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-800 transition ${
                currentLocale === lang.code ? 'bg-slate-800/50 text-white' : 'text-slate-400'
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span>{lang.name}</span>
              {currentLocale === lang.code && (
                <span className="ml-auto text-blue-400">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}