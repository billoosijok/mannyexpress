import TopBar from "@/components/TopBar";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Services from "@/components/Services";
import Experience from "@/components/Experience";
import Partnership from "@/components/Partnership";
import SafeMoving from "@/components/SafeMoving";
import Testimonials from "@/components/Testimonials";
import Experts from "@/components/Experts";
import News from "@/components/News";
import ContactInfo from "@/components/ContactInfo";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <Navigation />
      <Hero />
      <Services />
      {/* <Stats /> */}
      {/* <Experience /> */}
      {/* <SafeMoving /> */}
      <Testimonials />
      {/* <Experts /> */}
      {/* <News /> */}
      <ContactInfo />
      <Footer />
    </div>
  );
}
