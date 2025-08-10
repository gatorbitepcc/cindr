// src/pages/Index.tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image.jpg";
import {
  Search,
  PlusCircle,
  Settings,
  Users,
  MapPin,
  Heart,
  Sparkles
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500 via-pink-500 to-red-500 text-white">
      <div className="flex flex-col overflow-y-auto">
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 transition-all duration-300 bg-white" id="main-header">
          <div className="px-6 lg:px-20 py-4 flex items-center">
            <div className="flex items-center space-x-3">
              {/* Logo */}
              <div className="w-10 h-10">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path d="M50 10 Q40 20 45 30 Q48 25 52 30 Q55 20 50 10" fill="url(#flameGradient)" />
                  <path d="M45 15 Q42 22 46 28 Q48 24 50 28 Q52 22 49 15" fill="url(#flameInner)" />
                  <path d="M30 40 Q25 30 15 35 Q10 40 15 50 L30 65 L45 50 Q50 40 45 35 Q35 30 30 40" fill="url(#heartLeft)" />
                  <path d="M70 40 Q75 30 85 35 Q90 40 85 50 L70 65 L55 50 Q50 40 55 35 Q65 30 70 40" fill="url(#heartRight)" />
                  <path d="M50 35 Q45 25 35 30 Q30 35 35 45 L50 70 L65 45 Q70 35 65 30 Q55 25 50 35" fill="url(#heartCenter)" />
                  <defs>
                    <linearGradient id="flameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFA500" />
                      <stop offset="50%" stopColor="#FF6B6B" />
                      <stop offset="100%" stopColor="#FF4757" />
                    </linearGradient>
                    <linearGradient id="flameInner" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFD700" />
                      <stop offset="100%" stopColor="#FF6B6B" />
                    </linearGradient>
                    <linearGradient id="heartLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF6B9D" />
                      <stop offset="100%" stopColor="#8B5A8B" />
                    </linearGradient>
                    <linearGradient id="heartRight" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF6B9D" />
                      <stop offset="100%" stopColor="#8B5A8B" />
                    </linearGradient>
                    <linearGradient id="heartCenter" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF4757" />
                      <stop offset="50%" stopColor="#FF6B9D" />
                      <stop offset="100%" stopColor="#8B5A8B" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-red-600">Cindr</h1>
                <p className="text-sm text-gray-600">
                  Swipe your way to support — connect with people who understand and discover local cancer support resources in one place.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="flex flex-col lg:flex-row items-center justify-between px-6 lg:px-20 py-16">
          <div className="max-w-xl text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-md">
              Support That's Stronger <br /> Than Cancer
            </h1>
            <p className="mt-6 text-2xl opacity-90 max-w-lg mx-auto lg:mx-0">
              Swipe your way to support — connect with people who understand and discover local cancer support resources in one place.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="bg-white text-red-600 hover:bg-red-100 font-semibold px-6 py-4 rounded-full" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-4 rounded-full" asChild>
                <Link to="/login">Log In</Link>
              </Button>
            </div>
          </div>
          <div className="mt-12 lg:mt-0 lg:ml-12 flex justify-center w-full max-w-lg">
            <img src={heroImage} alt="Cancer support community" className="rounded-3xl shadow-2xl border-4 border-white/20 object-cover w-full h-[400px] md:h-[600px]" />
          </div>
        </section>

        {/* Features */}
        <section className="px-6 lg:px-20 py-16 bg-white/10">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard icon={<Users size={28} />} title="Connect with People" text="Meet fellow patients, survivors, caregivers, and supporters who understand your journey." bg="bg-purple-500" />
            <FeatureCard icon={<MapPin size={28} />} title="Find Local Resources" text="Discover nearby support groups, events, and community programs nearby." bg="bg-blue-500" />
            <FeatureCard icon={<Sparkles size={28} />} title="Personalized Matches" text="Smart matching based on your location, interests, and support needs." bg="bg-green-500" />
          </div>
        </section>

        {/* How to Connect */}
        <section className="px-6 lg:px-20 py-20 bg-white/5">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">How would you like to connect?</h2>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              Choose your path to building meaningful connections and finding the support you need.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ConnectCard icon={<Search size={32} />} color="bg-purple-500" title="Find a Group" text="Join existing support groups in your area and connect with others who share similar experiences." link="/find-groups" button="Browse Groups" />
              <ConnectCard icon={<PlusCircle size={32} />} color="bg-blue-500" title="Create a Group" text="Start your own support community and bring together people who need understanding." link="/create-group" button="Start a Group" />
              <ConnectCard icon={<Heart size={32} />} color="bg-green-500" title="Meet People" text="Connect one-on-one with patients, survivors, caregivers, and supporters through matching." link="/find-matches" button="Start Matching" />
              <ConnectCard icon={<Settings size={32} />} color="bg-gray-500" title="Settings" text="Personalize your profile, update your username, and change your preferences." link="/settings" button="Open Settings" />
            </div>
          </div>
        </section>

        {/* About Us */}
        <section className="px-6 lg:px-20 py-16 bg-white/20 text-black">
          <h2 className="text-4xl font-bold mb-4">About Us</h2>
          <p className="max-w-3xl">We are dedicated to building a compassionate, empowering, and inclusive cancer community...</p>
        </section>
      </div>
    </div>
  );
};

export default Index;

// Simple reusable card components
const FeatureCard = ({ icon, title, text, bg }: any) => (
  <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/25 transition-all">
    <div className={`${bg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white`}>
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-3">{title}</h3>
    <p className="text-white/90 leading-relaxed">{text}</p>
  </div>
);

const ConnectCard = ({ icon, color, title, text, link, button }: any) => (
  <div className="bg-white rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
    <div className={`${color} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-white`}>
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-gray-800 mb-4">{title}</h3>
    <p className="text-gray-600 mb-6 leading-relaxed">{text}</p>
    <Button className={`${color} hover:opacity-90 text-white font-semibold px-6 py-3 rounded-full w-full`} asChild>
      <Link to={link}>{button}</Link>
    </Button>
  </div>
);
