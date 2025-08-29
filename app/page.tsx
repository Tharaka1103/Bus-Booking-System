import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import ServicesSection from '@/components/sections/ServicesSection';
import PopularRoutesSection from '@/components/sections/PopularRoutesSection';
import WhyChooseUsSection from '@/components/sections/WhyChooseUsSection';
import FAQSection from '@/components/sections/FAQSection';
import ContactSection from '@/components/sections/ContactSection';
import BookingSection from '@/components/sections/BookingSection';
import {Preloader} from '@/components/Preloader'
export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection/>
      <AboutSection />
      <ServicesSection />
      <PopularRoutesSection />
            <BookingSection />
      <WhyChooseUsSection />
      <FAQSection />
      <ContactSection />
    </main>
  );
}