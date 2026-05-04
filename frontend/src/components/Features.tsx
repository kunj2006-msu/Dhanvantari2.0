import { motion } from 'framer-motion';
import { HeartPulse, Stethoscope, MapPin, ClipboardList } from 'lucide-react';

const features = [
  {
    title: "Mental Health Support",
    description: "Share your feelings safely in your native language. Our caring AI companion is here to listen and support you 24/7.",
    icon: <HeartPulse className="w-8 h-8 text-rose-500" />
  },
  {
    title: "Primary Health & Precautions",
    description: "Describe your symptoms naturally. Our AI will help you understand what might be wrong and suggest the right type of specialist to see.",
    icon: <Stethoscope className="w-8 h-8 text-blue-500" />
  },
  {
    title: "Find the Right Doctor",
    description: "Instantly discover and book appointments with top-rated doctors in your area perfectly matched to your health needs.",
    icon: <MapPin className="w-8 h-8 text-teal-500" />
  },
  {
    title: "Smart Doctor Portal",
    description: "Doctors receive clear, AI-generated summaries of your symptoms before the visit begins, saving valuable time and improving care.",
    icon: <ClipboardList className="w-8 h-8 text-amber-500" />
  }
];

export default function Features() {
  return (
    <section className="py-24 bg-gradient-to-b from-teal-950 to-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Enterprise-Grade Architecture</h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Experience our Mixture of Experts AI ecosystem, crafted to deliver clinical precision with deep compassion.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)" }}
              className="p-8 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg hover:border-teal-400/50 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 shadow-inner border border-white/5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-300 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
