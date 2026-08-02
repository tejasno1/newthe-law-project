import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin } from "lucide-react";

export const metadata = {
  title: "Contact Us — The Law Project",
  description: "Get in touch with The Law Project. Reach us by email, phone, or visit us at our Jaipur office.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      {/* Hero */}
      <div className="bg-gray-50 dark:bg-gray-800 pt-28 pb-10 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2">Get in touch</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">Contact Us</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">We are here to help. Reach out to us through any of the channels below.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Business name strip */}
        <div className="mb-10 text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">The Law Project</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Premier Mentorship for Legal Excellence and Professional Success</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">www.thelawproject.in</p>
        </div>

        {/* Contact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">

          <div className="flex flex-col items-center text-center bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-7">
            <div className="w-11 h-11 bg-[#4d65ff]/10 rounded-xl flex items-center justify-center mb-4">
              <Mail size={20} className="text-[#4d65ff]" />
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Email</p>
            <a
              href="mailto:thelawproject.in@gmail.com"
              className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-[#4d65ff] transition-colors break-all"
            >
              thelawproject.in@gmail.com
            </a>
          </div>

          <div className="flex flex-col items-center text-center bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-7">
            <div className="w-11 h-11 bg-[#4d65ff]/10 rounded-xl flex items-center justify-center mb-4">
              <Phone size={20} className="text-[#4d65ff]" />
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Phone</p>
            <a
              href="tel:+919950236296"
              className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-[#4d65ff] transition-colors"
            >
              +91 99502 36296
            </a>
          </div>

          <div className="flex flex-col items-center text-center bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-7">
            <div className="w-11 h-11 bg-[#4d65ff]/10 rounded-xl flex items-center justify-center mb-4">
              <MapPin size={20} className="text-[#4d65ff]" />
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Address</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
              G-6, Ground Floor, Lily Mangalam,<br />
              Mangalam Anand Appartment,<br />
              Sanganer Muhana,<br />
              Jaipur, Rajasthan
            </p>
          </div>

        </div>

        {/* Grievance officer */}
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-7">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Grievance Officer</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            For complaints or concerns regarding our services, privacy, or data handling, please contact our designated Grievance Officer. All grievances will be addressed within 30 days.
          </p>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p><span className="font-medium text-gray-800 dark:text-gray-200">Name:</span> Bhvatosh Agrawal</p>
            <p>
              <span className="font-medium text-gray-800 dark:text-gray-200">Email:</span>{" "}
              <a href="mailto:thelawproject.in@gmail.com" className="hover:text-[#4d65ff] transition-colors">thelawproject.in@gmail.com</a>
            </p>
            <p>
              <span className="font-medium text-gray-800 dark:text-gray-200">Phone:</span>{" "}
              <a href="tel:+919950236296" className="hover:text-[#4d65ff] transition-colors">+91 99502 36296</a>
            </p>
            <p><span className="font-medium text-gray-800 dark:text-gray-200">Address:</span> G-6, Ground Floor, Lily Mangalam, Mangalam Anand Appartment, Sanganer Muhana, Jaipur, Rajasthan</p>
          </div>
        </div>

      </div>

      <Footer />
    </main>
  );
}
