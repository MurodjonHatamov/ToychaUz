// components/help/Help.js
import React, { useState } from 'react';
import { 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Button,
  TextField,
  Chip
} from '@mui/material';
import {
  MdExpandMore,
  MdSearch,
  MdContactSupport,
  MdEmail,
  MdPhone,
  MdLiveHelp,
  MdShoppingCart,
  MdPayment,
  MdAssignmentReturned,
  MdAccountCircle,
  MdSecurity,
  MdInfo
} from 'react-icons/md';
import styles from './Help.module.css';

const Help = () => {
  // 🎯 State lar
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSection, setExpandedSection] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  // 🎯 FAQ ma'lumotlari
  const faqData = {
    general: {
      title: "Umumiy Savollar",
      icon: <MdInfo />,
      questions: [
        {
          question: "Platformadan qanday foydalansam bo'ladi?",
          answer: "Platformamizdan foydalanish juda oson. Avval ro'yxatdan o'ting, keyin kerakli mahsulotlarni qidiring va savatga qo'shing. To'lovni amalga oshirgach, buyurtmangiz yetkazib beriladi."
        },
        {
          question: "Hisob qanday yarataman?",
          answer: "Bosh sahifaning yuqori o'ng burchagidagi 'Ro'yxatdan o'tish' tugmasini bosing va shaxsiy ma'lumotlaringizni kiriting. Elektron pochta manzilingiz va telefon raqamingizni tasdiqlaganingizdan so'ng hisobingiz faollashtiriladi."
        },
        {
          question: "Parolni unutib qo'ysam nima qilishim kerak?",
          answer: "Login sahifasidagi 'Parolni unutdingizmi?' tugmasini bosing. Elektron pochta manzilingizga parolni tiklash uchun havola yuboramiz."
        }
      ]
    },
    orders: {
      title: "Buyurtmalar",
      icon: <MdShoppingCart />,
      questions: [
        {
          question: "Buyurtma qanday beriladi?",
          answer: "Mahsulotlarni savatga qo'shing, yetkazish manzilini tanlang, to'lov usulini belgilang va buyurtmani tasdiqlang. Buyurtma holatini profil bo'limingizdan kuzatishingiz mumkin."
        },
        {
          question: "Buyurtmani qanday bekor qilsam bo'ladi?",
          answer: "Faqat 'Yangi' holatidagi buyurtmalarni bekor qilish mumkin. Buyurtma batafsil sahifasidagi 'Bekor qilish' tugmasini bosing va sababni ko'rsating."
        },
        {
          question: "Buyurtma holatini qanday kuzatsam bo'ladi?",
          answer: "Profilingizdagi 'Mening buyurtmalarim' bo'limiga o'ting. Barcha buyurtmalaringiz va ularning joriy holatlari ko'rsatilgan."
        },
        {
          question: "Buyurtma qancha vaqtda yetkaziladi?",
          answer: "Yetkazib berish vaqti manzilingizga bog'liq. Odatda Toshkent shahri ichida 1-3 soat, viloyatlar uchun 1-3 kun ichida yetkaziladi."
        }
      ]
    },
    payments: {
      title: "To'lovlar",
      icon: <MdPayment />,
      questions: [
        {
          question: "Qanday to'lov usullari mavjud?",
          answer: "Naqd pul, bank kartasi, Click, Payme va Uzumbor kabi turli xil to'lov usullarini qo'llab-quvvatlaymiz. Hammasi xavfsiz va himoyalangan."
        },
        {
          question: "To'lov xavfsizligi qanday ta'minlanadi?",
          answer: "Barcha to'lov operatsiyalari SSL shifrlash orqali himoyalangan. Bank ma'lumotlaringiz hech qachon serverimizda saqlanmaydi."
        },
        {
          question: "To'lov qaytarilsa, pul qaytarilish jarayoni qanday?",
          answer: "To'lov qaytarilganda, mablag' 3-7 ish kunida sizning to'lov usulingizga qaytariladi. Agar savollaringiz bo'lsa, mijozlar xizmati bilan bog'laning."
        }
      ]
    },
    returns: {
      title: "Qaytarish va Almashish",
      icon: <MdAssignmentReturned />,
      questions: [
        {
          question: "Mahsulotni qaytarish shartlari qanday?",
          answer: "Mahsulotni olgan kundan boshlab 14 kun ichida original holatida qaytarishingiz mumkin. Chetlashtirilgan va maxsus buyurtma qilingan mahsulotlar qaytarilmaydi."
        },
        {
          question: "Qaytarish jarayoni qanday amalga oshiriladi?",
          answer: "Profilingizdagi buyurtma tarixidan qaytarmoqchi bo'lgan buyurtmangizni tanlang va 'Qaytarish so\'rovi' tugmasini bosing. Ko'rsatmalarga amal qiling."
        },
        {
          question: "Qaytarilgan mahsulot uchun pul qachon qaytariladi?",
          answer: "Mahsulotni qabul qilib olganimizdan so'ng 3-5 ish kunida to'lov qaytariladi. Qaytarish sizning dastlabki to'lov usulingiz orqali amalga oshiriladi."
        }
      ]
    },
    account: {
      title: "Hisob Sozlamalari",
      icon: <MdAccountCircle />,
      questions: [
        {
          question: "Shaxsiy ma'lumotlarni qanday o'zgartirsam bo'ladi?",
          answer: "Profil bo'limiga o'ting va 'Tahrirlash' tugmasini bosing. Ism, telefon raqam, manzil va boshqa ma'lumotlarni yangilashingiz mumkin."
        },
        {
          question: "Profil rasmini qanday o'zgartirsam bo'ladi?",
          answer: "Profil sozlamalari bo'limida profil rasmingiz ustiga bosing va yangi rasm yuklang. JPEG, PNG formatlari qo'llab-quvvatlanadi."
        },
        {
          question: "Hisobni qanday o'chirsam bo'ladi?",
          answer: "Profil sozlamalari bo'limining pastki qismidagi 'Hisobni o\'chirish' tugmasini bosing. Diqqat: bu harakat ortga qaytarilmaydi."
        }
      ]
    },
    security: {
      title: "Xavfsizlik",
      icon: <MdSecurity />,
      questions: [
        {
          question: "Hisobimni qanday himoya qilsam bo'ladi?",
          answer: "Kuchli paroldan foydalaning, ikki bosqichli autentifikatsiyani yoqing va shaxsiy ma'lumotlaringizni hech kimga bermang."
        },
        {
          question: "Ikki bosqichli autentifikatsiya nima?",
          answer: "Bu hisobingizga kirishda qo'shimcha himoya qatlami. Telefoningizga yuboriladigan kodni kiritish talab qilinadi."
        },
        {
          question: "Shubhali faoliyatni qanday his qilsam bo'ladi?",
          answer: "Agar hisobingizda notanish harakatlarni ko'rsangiz, darhol mijozlar xizmatiga murojaat qiling va parolingizni o'zgartiring."
        }
      ]
    }
  };

  // 🎯 FAQ kategoriyalari
  const categories = [
    { id: 'all', label: 'Hammasi', count: getAllQuestionsCount() },
    { id: 'general', label: 'Umumiy', count: faqData.general.questions.length },
    { id: 'orders', label: 'Buyurtmalar', count: faqData.orders.questions.length },
    { id: 'payments', label: "To'lovlar", count: faqData.payments.questions.length },
    { id: 'returns', label: 'Qaytarish', count: faqData.returns.questions.length },
    { id: 'account', label: 'Hisob', count: faqData.account.questions.length },
    { id: 'security', label: 'Xavfsizlik', count: faqData.security.questions.length }
  ];

  // 🎯 Barcha savollarni sonini hisoblash
  function getAllQuestionsCount() {
    return Object.values(faqData).reduce((total, category) => total + category.questions.length, 0);
  }

  // 🎯 Accordion ochish/yopish
  const handleAccordionChange = (section) => (event, isExpanded) => {
    setExpandedSection(isExpanded ? section : null);
  };

  // 🎯 Qidiruv natijalari
  const filteredQuestions = Object.entries(faqData).reduce((acc, [key, category]) => {
    if (activeCategory !== 'all' && activeCategory !== key) return acc;
    
    const filtered = category.questions.filter(item =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filtered.length > 0) {
      acc.push({ ...category, id: key, questions: filtered });
    }
    
    return acc;
  }, []);

  // 🎯 Kontakt ma'lumotlari
  const contactInfo = [
    {
      icon: <MdPhone />,
      title: "Telefon Raqam",
      details: ["+998 90 123 45 67", "+998 71 234 56 78"],
      description: "Dushanbadan Jumagacha 9:00 - 18:00"
    },
    {
      icon: <MdEmail />,
      title: "Elektron Pochta",
      details: ["support@example.com", "info@example.com"],
      description: "24 soat ichida javob beramiz"
    },
    {
      icon: <MdLiveHelp />,
      title: "Onlayn Yordam",
      details: ["Live Chat", "Tezkor javob"],
      description: "Haftaning 7 kuni 24 soat"
    }
  ];

  return (
    <div className={styles.helpContainer}>
      <div className={styles.helpContent}>
        
        {/* 📝 Sarlavha Bo'limi */}
        <div className={styles.helpHeader}>
          <h1 className={styles.helpTitle}>
            <MdContactSupport className={styles.titleIcon} />
            Yordam Markazi
          </h1>
          <p className={styles.helpSubtitle}>
            Ko'p so'raladigan savollar va qo'llab-quvvatlash xizmatlari
          </p>
        </div>

        {/* 🔍 Qidiruv Bo'limi */}
        <div className={styles.searchSection}>
          <div className={styles.searchContainer}>
            <MdSearch className={styles.searchIcon} />
            <TextField
              fullWidth
              placeholder="Savolingizni yozing yoki kalit so'z kiriting..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              className={styles.searchInput}
            />
          </div>
          <p className={styles.searchHint}>
            Masalan: "buyurtma bekor qilish", "to'lov usullari", "parolni tiklash"
          </p>
        </div>

        {/* 📑 Kategoriyalar */}
        <div className={styles.categoriesSection}>
          <h2 className={styles.sectionTitle}>Kategoriyalar</h2>
          <div className={styles.categoriesGrid}>
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={`${category.label} (${category.count})`}
                onClick={() => setActiveCategory(category.id)}
                className={`${styles.categoryChip} ${
                  activeCategory === category.id ? styles.categoryChipActive : ''
                }`}
                variant={activeCategory === category.id ? "filled" : "outlined"}
              />
            ))}
          </div>
        </div>

        {/* ❓ Ko'p So'raladigan Savollar */}
        <div className={styles.faqSection}>
          <h2 className={styles.sectionTitle}>
            Ko'p So'raladigan Savollar
          </h2>
          
          {filteredQuestions.length === 0 ? (
            <div className={styles.noResults}>
              <MdSearch className={styles.noResultsIcon} />
              <h3>Hech narsa topilmadi</h3>
              <p>Boshqa kalit so'zlar bilan qayta urinib ko'ring yoki kategoriyani o'zgartiring</p>
            </div>
          ) : (
            <div className={styles.accordionContainer}>
              {filteredQuestions.map((category) => (
                <div key={category.id} className={styles.categoryGroup}>
                  <h3 className={styles.categoryTitle}>
                    {category.icon}
                    {category.title}
                  </h3>
                  
                  {category.questions.map((item, index) => (
                    <Accordion
                      key={index}
                      expanded={expandedSection === `${category.id}-${index}`}
                      onChange={handleAccordionChange(`${category.id}-${index}`)}
                      className={styles.accordion}
                    >
                      <AccordionSummary
                        expandIcon={<MdExpandMore />}
                        className={styles.accordionSummary}
                      >
                        <span className={styles.questionText}>
                          {item.question}
                        </span>
                      </AccordionSummary>
                      <AccordionDetails className={styles.accordionDetails}>
                        <div className={styles.answerText}>
                          {item.answer}
                        </div>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 📞 Bog'lanish Bo'limi */}
        <div className={styles.contactSection}>
          <h2 className={styles.sectionTitle}>Qo'shimcha Yordam Kerakmi?</h2>
          <p className={styles.contactSubtitle}>
            Quyidagi usullar orqali biz bilan bog'lanishingiz mumkin
          </p>
          
          <div className={styles.contactGrid}>
            {contactInfo.map((contact, index) => (
              <div key={index} className={styles.contactCard}>
                <div className={styles.contactIcon}>
                  {contact.icon}
                </div>
                <h4 className={styles.contactTitle}>{contact.title}</h4>
                <div className={styles.contactDetails}>
                  {contact.details.map((detail, idx) => (
                    <div key={idx} className={styles.contactDetail}>
                      {detail}
                    </div>
                  ))}
                </div>
                <p className={styles.contactDescription}>
                  {contact.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 💬 Tezkor Yordam */}
        <div className={styles.quickHelpSection}>
          <div className={styles.quickHelpCard}>
            <div className={styles.quickHelpContent}>
              <h3 className={styles.quickHelpTitle}>
                Tezkor Yordam Kerakmi?
              </h3>
              <p className={styles.quickHelpText}>
                Onlayn chat orqali darhol javob oling. Mutaxassislarimiz 
                har qanday savolingizga javob berishga tayyor.
              </p>
              <div className={styles.quickHelpActions}>
                <Button
                  variant="contained"
                  className={styles.chatButton}
                  startIcon={<MdLiveHelp />}
                >
                  Chatni Boshlash
                </Button>
                <Button
                  variant="outlined"
                  className={styles.callButton}
                  startIcon={<MdPhone />}
                >
                  Qo'ng'iroq Qilish
                </Button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Help;