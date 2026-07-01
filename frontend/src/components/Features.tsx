import { motion } from 'framer-motion';
import { HeartHandshake, Stethoscope, Search, ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// ─── Animation Logic ───
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as any }
  }
};

export default function Features() {
  const { t } = useTranslation();

  // Moving the array inside the component so it can use the 't' function
  const features = [
    {
      title: t('feat1Title', "Mental Health Support"),
      description: t('feat1Desc', "Share your feelings safely in your native language. Our caring AI companion is here to listen and support you 24/7."),
      icon: HeartHandshake,
      color: "text-rose-400",
      bg: "bg-rose-400/10",
      border: "border-rose-400/20"
    },
    {
      title: t('feat2Title', "Primary Health & Precautions"),
      description: t('feat2Desc', "Describe your symptoms naturally. Our AI will help you understand what might be wrong and suggest the right type of specialist to see."),
      icon: Stethoscope,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
      border: "border-cyan-400/20"
    },
    {
      title: t('feat3Title', "Find the Right Doctor"),
      description: t('feat3Desc', "Instantly discover and book appointments with top-rated doctors in your area perfectly matched to your health needs."),
      icon: Search,
      color: "text-teal-400",
      bg: "bg-teal-400/10",
      border: "border-teal-400/20"
    },
    {
      title: t('feat4Title', "Smart Doctor Portal"),
      description: t('feat4Desc', "Doctors receive clear, AI-generated summaries of your symptoms before the visit begins, saving valuable time and improving care."),
      icon: ClipboardList,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/20"
    }
  ];

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[500px] bg-teal-900/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            {t('featHeading', 'Enterprise-Grade Architecture')}
          </h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
            {t('featSubtext', 'Experience our Mixture of Experts AI ecosystem, crafted to deliver clinical precision with deep compassion.')}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ scale: 1.02, translateY: -5 }}
                className={`p-8 md:p-10 rounded-3xl bg-slate-900/60 backdrop-blur-xl border ${feature.border} shadow-2xl hover:bg-slate-800/80 transition-all duration-300 group`}
              >
                <div className={`w-16 h-16 rounded-2xl ${feature.bg} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed font-light text-base md:text-lg">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}