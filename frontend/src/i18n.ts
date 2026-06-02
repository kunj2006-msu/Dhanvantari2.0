import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      myAppointments: "My Appointments",
      bookNew: "Book New",
      bookConsultation: "Book a Consultation",
      selectState: "Select State...",
      selectCity: "Select City...",
      specialization: "Specialization",
      doctor: "Doctor",
      date: "Date",
      reasonForVisit: "Reason for Visit",
      intensity: "Intensity",
      confirmAppointment: "Confirm Appointment",
      resetForm: "Reset Form",
      close: "Close",
      chatbotGreeting: "Hello. I'm here to help you assess your symptoms. Please describe what you're experiencing in as much detail as possible."
    }
  },
  hi: {
    translation: {
      myAppointments: "मेरे अपॉइंटमेंट्स",
      bookNew: "नया बुक करें",
      bookConsultation: "परामर्श बुक करें",
      selectState: "राज्य चुनें...",
      selectCity: "शहर चुनें...",
      specialization: "विशेषज्ञता",
      doctor: "डॉक्टर",
      date: "दिनांक",
      reasonForVisit: "आने का कारण",
      intensity: "तीव्रता",
      confirmAppointment: "अपॉइंटमेंट की पुष्टि करें",
      resetForm: "फॉर्म रीसेट करें",
      close: "बंद करें",
      chatbotGreeting: "नमस्ते। मैं आपके लक्षणों का आकलन करने में आपकी सहायता के लिए यहाँ हूँ। कृपया जितना संभव हो उतने विस्तार से बताएं कि आप क्या अनुभव कर रहे हैं।"
    }
  },
  gu: {
    translation: {
      myAppointments: "મારા અપૉઇન્ટમેન્ટ્સ",
      bookNew: "નવું બુક કરો",
      bookConsultation: "પરામર્શ બુક કરો",
      selectState: "રાજ્ય પસંદ કરો...",
      selectCity: "શહેર પસંદ કરો...",
      specialization: "ખાસિયત",
      doctor: "ડોક્ટર",
      date: "તારીખ",
      reasonForVisit: "મુલાકાતનું કારણ",
      intensity: "તીવ્રતા",
      confirmAppointment: "અપૉઇન્ટમેન્ટ કન્ફર્મ કરો",
      resetForm: "ફોર્મ રીસેટ કરો",
      close: "બંધ કરો",
      chatbotGreeting: "નમસ્તે. હું તમારા લક્ષણોનું મૂલ્યાંકન કરવામાં તમારી મદદ કરવા માટે અહીં છું. તમે જે અનુભવી રહ્યા છો તેનું કૃપા કરીને શક્ય તેટલી વિગતવાર વર્ણન કરો."
    }
  },
  mr: {
    translation: {
      myAppointments: "My Appointments",
      bookNew: "Book New",
      bookConsultation: "Book a Consultation",
      selectState: "Select State...",
      selectCity: "Select City...",
      specialization: "Specialization",
      doctor: "Doctor",
      date: "Date",
      reasonForVisit: "Reason for Visit",
      intensity: "Intensity",
      confirmAppointment: "Confirm Appointment",
      resetForm: "Reset Form",
      close: "Close",
      chatbotGreeting: "Hello. I'm here to help you assess your symptoms. Please describe what you're experiencing in as much detail as possible."
    }
  },
  bn: {
    translation: {
      myAppointments: "My Appointments",
      bookNew: "Book New",
      bookConsultation: "Book a Consultation",
      selectState: "Select State...",
      selectCity: "Select City...",
      specialization: "Specialization",
      doctor: "Doctor",
      date: "Date",
      reasonForVisit: "Reason for Visit",
      intensity: "Intensity",
      confirmAppointment: "Confirm Appointment",
      resetForm: "Reset Form",
      close: "Close",
      chatbotGreeting: "Hello. I'm here to help you assess your symptoms. Please describe what you're experiencing in as much detail as possible."
    }
  },
  te: {
    translation: {
      myAppointments: "My Appointments",
      bookNew: "Book New",
      bookConsultation: "Book a Consultation",
      selectState: "Select State...",
      selectCity: "Select City...",
      specialization: "Specialization",
      doctor: "Doctor",
      date: "Date",
      reasonForVisit: "Reason for Visit",
      intensity: "Intensity",
      confirmAppointment: "Confirm Appointment",
      resetForm: "Reset Form",
      close: "Close",
      chatbotGreeting: "Hello. I'm here to help you assess your symptoms. Please describe what you're experiencing in as much detail as possible."
    }
  },
  ta: {
    translation: {
      myAppointments: "My Appointments",
      bookNew: "Book New",
      bookConsultation: "Book a Consultation",
      selectState: "Select State...",
      selectCity: "Select City...",
      specialization: "Specialization",
      doctor: "Doctor",
      date: "Date",
      reasonForVisit: "Reason for Visit",
      intensity: "Intensity",
      confirmAppointment: "Confirm Appointment",
      resetForm: "Reset Form",
      close: "Close",
      chatbotGreeting: "Hello. I'm here to help you assess your symptoms. Please describe what you're experiencing in as much detail as possible."
    }
  },
  kn: {
    translation: {
      myAppointments: "My Appointments",
      bookNew: "Book New",
      bookConsultation: "Book a Consultation",
      selectState: "Select State...",
      selectCity: "Select City...",
      specialization: "Specialization",
      doctor: "Doctor",
      date: "Date",
      reasonForVisit: "Reason for Visit",
      intensity: "Intensity",
      confirmAppointment: "Confirm Appointment",
      resetForm: "Reset Form",
      close: "Close",
      chatbotGreeting: "Hello. I'm here to help you assess your symptoms. Please describe what you're experiencing in as much detail as possible."
    }
  },
  ml: {
    translation: {
      myAppointments: "My Appointments",
      bookNew: "Book New",
      bookConsultation: "Book a Consultation",
      selectState: "Select State...",
      selectCity: "Select City...",
      specialization: "Specialization",
      doctor: "Doctor",
      date: "Date",
      reasonForVisit: "Reason for Visit",
      intensity: "Intensity",
      confirmAppointment: "Confirm Appointment",
      resetForm: "Reset Form",
      close: "Close",
      chatbotGreeting: "Hello. I'm here to help you assess your symptoms. Please describe what you're experiencing in as much detail as possible."
    }
  },
  pa: {
    translation: {
      myAppointments: "My Appointments",
      bookNew: "Book New",
      bookConsultation: "Book a Consultation",
      selectState: "Select State...",
      selectCity: "Select City...",
      specialization: "Specialization",
      doctor: "Doctor",
      date: "Date",
      reasonForVisit: "Reason for Visit",
      intensity: "Intensity",
      confirmAppointment: "Confirm Appointment",
      resetForm: "Reset Form",
      close: "Close",
      chatbotGreeting: "Hello. I'm here to help you assess your symptoms. Please describe what you're experiencing in as much detail as possible."
    }
  },
  ur: {
    translation: {
      myAppointments: "My Appointments",
      bookNew: "Book New",
      bookConsultation: "Book a Consultation",
      selectState: "Select State...",
      selectCity: "Select City...",
      specialization: "Specialization",
      doctor: "Doctor",
      date: "Date",
      reasonForVisit: "Reason for Visit",
      intensity: "Intensity",
      confirmAppointment: "Confirm Appointment",
      resetForm: "Reset Form",
      close: "Close",
      chatbotGreeting: "Hello. I'm here to help you assess your symptoms. Please describe what you're experiencing in as much detail as possible."
    }
  },
  or: {
    translation: {
      myAppointments: "My Appointments",
      bookNew: "Book New",
      bookConsultation: "Book a Consultation",
      selectState: "Select State...",
      selectCity: "Select City...",
      specialization: "Specialization",
      doctor: "Doctor",
      date: "Date",
      reasonForVisit: "Reason for Visit",
      intensity: "Intensity",
      confirmAppointment: "Confirm Appointment",
      resetForm: "Reset Form",
      close: "Close",
      chatbotGreeting: "Hello. I'm here to help you assess your symptoms. Please describe what you're experiencing in as much detail as possible."
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
