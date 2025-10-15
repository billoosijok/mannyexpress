import { ClockIcon } from "@/icons/clock";
import { EmailIcon } from "@/icons/email";
import { LocationIcon } from "@/icons/location";
import { PhoneIcon } from "@/icons/phone";

export default function ContactInfo() {
  return (
    <section id="contact" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 sm:gap-12 md:gap-16">
          {/* Call Us */}
          <div className="text-center group">
            <PhoneIcon />
            <h3 className="font-bold text-gray-900 mb-2 text-lg">
              Appelez-nous :
            </h3>
            <a
              href="tel:+33751168503"
              className="font-semibold text-base sm:text-lg block hover:opacity-90 py-1"
              style={{ color: "rgb(30, 125, 187)" }}
            >
              07 51 16 85 03
            </a>
            <a
              href="tel:+33666181915"
              className="font-semibold text-base sm:text-lg block mt-1 hover:opacity-90 py-1"
              style={{ color: "rgb(30, 125, 187)" }}
            >
              06 66 18 19 15
            </a>
          </div>

          {/* Email */}
          <div className="text-center group">
            <EmailIcon />
            <h3 className="font-bold text-gray-900 mb-2 text-lg">
              Écrivez-nous :
            </h3>
            <a
              href="mailto:mannyexpress11@gmail.com"
              className="font-semibold text-sm sm:text-base lg:text-lg hover:opacity-90 py-1 block break-all"
              style={{ color: "rgb(30, 125, 187)" }}
            >
              mannyexpress11@gmail.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
