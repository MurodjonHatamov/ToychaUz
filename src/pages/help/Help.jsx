import React, { useState, useEffect, useRef } from 'react';
import styles from "./Help.module.css";
import { logaut } from '../logaut';

function Help() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Chatni pastga scroll qilish
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Chat tarixini olish
  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('http://localhost:2277/contact/chat', {
        method: 'GET',
        headers: {
          'accept': '*/*'
        },
        credentials: 'include'
      });

      logaut(response);

      if (!response.ok) {
        if (response.status === 402) {
          setError('Chatdan foydalanish uchun tizimga kiring');
          setMessages([]);
          return;
        }
        throw new Error(`HTTP xatolik! Status: ${response.status}`);
      }

      const data = await response.json();
    
      
      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        console.error('Kutilmagan ma\'lumot formati:', data);
        setMessages([]);
      }
      
    } catch (error) {
      console.error('Chat tarixini yuklashda xatolik:', error);
      setError('Internet aloqasi bilan muammo. Qayta urinib ko\'ring.');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Xabar yuborish
  const sendMessage = async () => {
    if (!newMessage.trim()) {
      setError('Iltimos, xabar matnini kiriting');
      return;
    }

    setSending(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:2277/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        credentials: 'include',
        body: JSON.stringify({
          message: newMessage
        })
      });

      logaut(response);


      if (response.status === 201) {
        setNewMessage('');
        // Yangi xabarni chatga qo'shish
        await fetchChatHistory();
      } else if (response.status === 402) {
        setError('Xabar yuborish uchun tizimga kiring');
      } else {
        throw new Error(`Xabar yuborishda xatolik: ${response.status}`);
      }
    } catch (error) {
      console.error('Xabar yuborishda xatolik:', error);
      setError('Xabar yuborishda xatolik yuz berdi. Qayta urinib ko\'ring.');
    } finally {
      setSending(false);
    }
  };

  // Enter bosganda xabar yuborish
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Shablon savollar
  const templateQuestions = [
    "Buyurtma qachon yetib keladi?",
    "Mahsulot mavjudmi?",
    "To'lov usullari qanday?",
    "Yetkazib berish muddati qancha?",
    "Mahsulotni qaytarish mumkinmi?"
  ];

  // Komponent yuklanganda chat tarixini olish
  useEffect(() => {
    fetchChatHistory();
  }, []);

  // Shablon savolni tanlash
  const handleTemplateClick = (question) => {
    setNewMessage(question);
    setError('');
  };

  // Vaqtni formatlash
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sana formatlash
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Xabarlarni guruhlash (sana bo'yicha)
  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach(message => {
      const date = formatDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  return (
    <div className={styles.helpContainer}>
      <div className={styles.chatHeader}>
        <div className={styles.chatInfo}>
          <div className={styles.avatar}>
            <span>🛒</span>
          </div>
          <div className={styles.chatDetails}>
            <h2>Market Support</h2>
            <p>Qo'llab-quvvatlash xizmati</p>
          </div>
        </div>
        <div className={styles.chatActions}>
          <button 
            className={styles.refreshBtn}
            onClick={fetchChatHistory}
            disabled={loading}
          >
            {loading ? '⏳' : '🔄'}
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
          {error.includes('tizimga kiring') && (
            <button 
              className={styles.loginButton}
              onClick={() => window.location.href = '/login'}
            >
              Tizimga kirish
            </button>
          )}
        </div>
      )}

      <div className={styles.chatContainer}>
        <div 
          className={styles.messagesContainer}
          ref={messagesContainerRef}
        >
          {loading && messages.length === 0 ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Xabarlar yuklanmoqda...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className={styles.emptyChat}>
              <div className={styles.emptyIcon}>💬</div>
              <h3>Hozircha xabarlar yo'q</h3>
              <p>Birinchi xabaringizni yuboring yoki quyidagi savollardan birini tanlang</p>
            </div>
          ) : (
            Object.entries(messageGroups).map(([date, dayMessages]) => (
              <div key={date} className={styles.dateGroup}>
                <div className={styles.dateSeparator}>
                  <span>{date}</span>
                </div>
                {dayMessages.map((msg) => (
                  <div 
                    key={msg._id} 
                    className={`${styles.message} ${
                      msg.from === 'deliver' ? styles.received : styles.sent
                    }`}
                  >
                    <div className={styles.messageContent}>
                      <div className={styles.messageText}>
                        {msg.message}
                      </div>
                      <div className={styles.messageTime}>
                        {formatTime(msg.createdAt)}
                        {msg.status === 'new' && msg.from !== 'deliver' && (
                          <span className={styles.status}>✓</span>
                        )}
                        {msg.status === 'viewed' && msg.from !== 'deliver' && (
                          <span className={styles.statusViewed}>✓✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 0 && !loading && (
          <div className={styles.templateSection}>
            <h4>Tez-tez so'raladigan savollar:</h4>
            <div className={styles.templateGrid}>
              {templateQuestions.map((question, index) => (
                <button
                  key={index}
                  className={styles.templateBtn}
                  onClick={() => handleTemplateClick(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.inputContainer}>
          <div className={styles.inputWrapper}>
            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              placeholder="Xabaringizni yozing..."
              rows="1"
              className={styles.textarea}
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
              className={styles.sendButton}
            >
              {sending ? (
                <div className={styles.sendingSpinner}></div>
              ) : (
                <span>➤</span>
              )}
            </button>
          </div>
          <div className={styles.inputHint}>
            Xabar yuborish uchun Enter, yangi qator uchun Shift+Enter
          </div>
        </div>
      </div>
    </div>
  );
}

export default Help;