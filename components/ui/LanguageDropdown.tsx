import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../LanguageContext';
import { ChevronDown, Check } from 'lucide-react';
import { useGlobalUI } from '../../contexts/GlobalUIContext';

interface LanguageDropdownProps {
    align?: 'left' | 'right';
    isCompact?: boolean;
}

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ align = 'right', isCompact = false }) => {
    const { language, setLanguage } = useLanguage();
    const { playSound } = useGlobalUI();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: 'it' as const, label: 'Italiano', flag: '🇮🇹', short: 'IT' },
        { code: 'en' as const, label: 'English', flag: '🇬🇧', short: 'EN' }
    ];

    const currentLang = languages.find(l => l.code === language);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (code: 'en' | 'it') => {
        if (code !== language) {
            playSound('CLICK');
            setLanguage(code);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                onClick={() => { playSound('CLICK'); setIsOpen(!isOpen); }}
                className={`flex items-center justify-center gap-1.5 px-2 rounded-lg transition-all duration-300 border h-[32px] ${
                    isOpen 
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-white shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                    : 'glass-panel border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                }`}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <span className="text-[16px] leading-none select-none inline-block">
                        {currentLang?.flag}
                    </span>
                </div>

                {!isCompact && (
                    <span className="text-[10px] font-black uppercase tracking-tight hidden xs:inline">{currentLang?.short}</span>
                )}
                
                <ChevronDown size={10} className={`transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-emerald-400' : 'opacity-40'}`} />
            </button>

            {isOpen && (
                <div 
                    className={`absolute top-full mt-1.5 w-36 glass-panel-heavy rounded-xl border border-white/10 shadow-2xl z-[100] overflow-hidden animate-zoom-in ${
                        align === 'right' ? 'right-0' : 'left-0'
                    }`}
                >
                    <div className="p-1 space-y-0.5">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleSelect(lang.code)}
                                className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-lg transition-all ${
                                    language === lang.code 
                                    ? 'bg-emerald-500 text-black font-black' 
                                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <span className="w-5 h-5 flex items-center justify-center text-base leading-none shrink-0">{lang.flag}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{lang.label}</span>
                                </div>
                                {language === lang.code && <Check size={12} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageDropdown;