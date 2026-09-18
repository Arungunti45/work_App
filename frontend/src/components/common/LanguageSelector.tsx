import React, { useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../../i18n/config';

export const LanguageSelector: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<string>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const savedLang = localStorage.getItem('app_language');
    if (savedLang) {
      setCurrentLang(savedLang);
    }
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setCurrentLang(newLang);
    localStorage.setItem('app_language', newLang);
    // In a real i18n setup, you would call `i18n.changeLanguage(newLang)` here.
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <label htmlFor="language-select" style={{ fontSize: '0.875rem', color: '#4b5563' }}>
        <span className="sr-only">Select Language</span> {/* Screen reader only */}
        Language:
      </label>
      <select
        id="language-select"
        value={currentLang}
        onChange={handleLanguageChange}
        style={{
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          border: '1px solid #d1d5db',
          background: 'white',
          fontSize: '0.875rem',
          cursor: 'pointer'
        }}
        aria-label="Select preferred language"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
};
