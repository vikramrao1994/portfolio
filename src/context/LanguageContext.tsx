import { createContext, type ReactNode, useContext, useState } from "react";

export type Language = "en" | "de";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>("en");

  //   useEffect(() => {
  //     // Try to get from localStorage
  //     const stored = typeof window !== "undefined" ? localStorage.getItem("lang") : null;
  //     if (stored === "en" || stored === "de") {
  //       setLanguageState(stored);
  //     }
  //   }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // if (typeof window !== "undefined") {
    //   localStorage.setItem("lang", lang);
    // }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
};
