import TopBar from "@/components/TopBar";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
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
