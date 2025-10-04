// hooks/useTranslation.ts
import { useLanguage } from '@/contexts/LanguageContext';

export function useTranslation() {
  const { t, language } = useLanguage();
  
  return { t, language };
}