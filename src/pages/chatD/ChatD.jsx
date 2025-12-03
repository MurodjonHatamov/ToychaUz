import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  Button,
  Snackbar,
  Alert,
  IconButton,
  MenuItem,
  Paper,
  Avatar,
} from "@mui/material";
import {
  FaPaperPlane,
  FaStore,
  FaSpinner,
  FaSearch,
  FaUser,
  FaCheckDouble,
  FaCheck,
} from "react-icons/fa";
import styles from "./ChatD.module.css";
import { logaut } from "../logaut";

function ChatD({ setNotifications, notifications }) {
  // ==================== STATE DEFINITIONS ====================

  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMarkets, setFilteredMarkets] = useState([]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [loading, setLoading] = useState({
    markets: true,
    messages: false,
    send: false,
  });

  const messagesEndRef = useRef(null);

  // ==================== API FUNCTIONS ====================

  const fetchMarkets = async () => {
    try {
      setLoading((prev) => ({ ...prev, markets: true }));

      const response = await fetch("http://localhost:2277/markets", {
        method: "GET",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      logaut(response);
      if (response.ok) {
        const marketsData = await response.json();
        setMarkets(marketsData);
        setFilteredMarkets(marketsData);

        // Agar marketlar mavjud bo'lsa, birinchisini tanlash
        if (marketsData.length > 0 && !selectedMarket) {
          setSelectedMarket(marketsData[0]);
        }
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error("Marketlarni yuklab boʻlmadi:", error);
      showSnackbar("Marketlarni yuklab boʻlmadi", "error");
    } finally {
      setLoading((prev) => ({ ...prev, markets: false }));
    }
  };

  const fetchMarketChat = async (marketId) => {
    if (!marketId) return;

    try {
      setLoading((prev) => ({ ...prev, messages: true }));

      const response = await fetch(
        `http://localhost:2277/deliver/chat/${marketId}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      logaut(response);
      if (response.ok) {
        const chatData = await response.json();
        setMessages(chatData);
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error("Chat ma'lumotlarini yuklab boʻlmadi:", error);
      showSnackbar("Chat ma'lumotlarini yuklab boʻlmadi", "error");
    } finally {
      setLoading((prev) => ({ ...prev, messages: false }));
    }
  };

  const fetchAllMessages = async () => {
    try {
      const response = await fetch("http://localhost:2277/deliver/messages", {
        method: "GET",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const allMessagesData = await response.json();
        setAllMessages(allMessagesData);
      }
    } catch (error) {
      console.error("Barcha xabarlarni yuklab boʻlmadi:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMarket) return;

    try {
      setLoading((prev) => ({ ...prev, send: true }));

      const response = await fetch(
        `http://localhost:2277/deliver/send-message/${selectedMarket._id}`,
        {
          method: "POST",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            message: newMessage.trim(),
          }),
        }
      );
      logaut(response);
      if (response.ok) {
        const sentMessage = await response.json();
        setNewMessage("");
        // Chatni yangilash
        fetchMarketChat(selectedMarket._id);
        fetchAllMessages(); // Barcha xabarlarni yangilash
        showSnackbar("Xabar muvaffaqiyatli yuborildi", "success");
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error("Xabar yuborib boʻlmadi:", error);
      showSnackbar("Xabar yuborib boʻlmadi", "error");
    } finally {
      setLoading((prev) => ({ ...prev, send: false }));
    }
  };

  // ==================== EVENT HANDLERS ====================

  const handleMarketSelect = (market) => {
    setSelectedMarket(market);
    fetchMarketChat(market._id);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === "") {
      setFilteredMarkets(markets);
    } else {
      const filtered = markets.filter(
        (market) =>
          market.name.toLowerCase().includes(term) ||
          market.phone.includes(term) ||
          (market.address && market.address.toLowerCase().includes(term))
      );
      setFilteredMarkets(filtered);
    }
  };

  // ==================== HELPER FUNCTIONS ====================

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const isToday = (dateString) => {
    const today = new Date().toDateString();
    const messageDate = new Date(dateString).toDateString();
    return today === messageDate;
  };

  const getLastMessage = (marketId) => {
    const marketMessages = allMessages.filter(
      (msg) => msg.from === marketId || msg.to === marketId
    );

    if (marketMessages.length === 0) return "Xabar yoʻq";

    const lastMessage = marketMessages[marketMessages.length - 1];
    return lastMessage.message;
  };

  const getUnreadCount = (marketId) => {
    const marketMessages = allMessages.filter(
      (msg) =>
        (msg.from === marketId || msg.to === marketId) &&
        msg.status === "new" &&
        msg.from === marketId
    );

    return marketMessages.length;
  };
  const getTotalUnread = () => {
    return allMessages.filter(
      (msg) => msg.status === "new" && msg.from !== "deliver" // market tomonidan yuborilgan xabarlar
    ).length;
  };

  // ==================== USE EFFECT HOOKS ====================

  useEffect(() => {
    fetchMarkets();
    fetchAllMessages();
  }, []);

  useEffect(() => {
    if (selectedMarket) {
      fetchMarketChat(selectedMarket._id);
    }
  }, [selectedMarket]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-refresh messages every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedMarket) {
        fetchMarketChat(selectedMarket._id);
        fetchAllMessages();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedMarket]);

  // ==================== RENDER ====================

  return (
    <div className={styles.chatPage}>
      <div className={styles.chatContainer}>
        {/* CHAP PANEL - MARKETLAR RO'YXATI */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2>Marketlar</h2>
          </div>

          {/* QIDIRUV */}
          <div className={styles.searchSection}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Market qidirish..."
                value={searchTerm}
                onChange={handleSearch}
                className={styles.searchInput}
              />
            </div>
          </div>

          {/* MARKETLAR RO'YXATI */}
          <div className={styles.marketsList}>
            {loading.markets ? (
              <div className={styles.loading}>
                <FaSpinner className={styles.spinner} />
                <span>Marketlar yuklanmoqda...</span>
              </div>
            ) : filteredMarkets.length > 0 ? (
              filteredMarkets.map((market) => {
                const unreadCount = getUnreadCount(market._id);
                const isActive = selectedMarket?._id === market._id;

                return (
<div
  key={market._id}
  className={`${styles.marketItem} ${
    isActive ? styles.marketItemActive : ""
  }`}
  onClick={() => handleMarketSelect(market)}
>
  <div className={styles.marketAvatar}>
    <FaStore />
  </div>
  <div className={styles.marketInfo}>
    <div className={styles.marketName}>{market.name}</div>
    <div className={styles.lastMessage}>
      {getLastMessage(market._id)}
    </div>
  </div>
  {unreadCount > 0 && (
    <div className={styles.unreadBadge}>{unreadCount}</div>
  )}
</div>
                );
              })
            ) : (
              <div className={styles.noData}>
                <FaStore className={styles.noDataIcon} />
                <div>Marketlar topilmadi</div>
              </div>
            )}
          </div>
        </div>

        {/* ASOSIY CHAT QISMI */}
        <div className={styles.chatMain}>
          {selectedMarket ? (
            <>
              {/* CHAT SARLAVHASI */}
              <div className={styles.chatHeader}>
                <div className={styles.chatPartner}>
<div className={styles.partnerAvatar}>
  <FaStore />
</div>
<div className={styles.partnerInfo}>
  <div className={styles.partnerName}>
    {selectedMarket.name}
  </div>
  <div className={styles.partnerPhone}>
    {selectedMarket.phone}
  </div>
</div>
                </div>
              </div>

              {/* XABARLAR RO'YXATI */}
              <div className={styles.messagesContainer}>
                {loading.messages ? (
<div className={styles.loading}>
  <FaSpinner className={styles.spinner} />
  <span>Xabarlar yuklanmoqda...</span>
</div>
                ) : messages.length > 0 ? (
<div className={styles.messagesList}>
  {messages.map((message, index) => {
    const isDeliver = message.from === "deliver";
    const showDate =
      index === 0 ||
      (!isToday(message.createdAt) &&
        !isToday(messages[index - 1].createdAt));

    return (
      <React.Fragment key={message._id}>
        {/* Sana ko'rsatgich */}
        {showDate && (
          <div className={styles.dateDivider}>
            {isToday(message.createdAt)
              ? "Bugun"
              : formatDate(message.createdAt)}
          </div>
        )}

        {/* Xabar */}
        <div
          className={`${styles.message} ${
            isDeliver
              ? styles.messageOutgoing
              : styles.messageIncoming
          }`}
        >
          <div className={styles.messageContent}>
            <div className={styles.messageText}>
              {message.message}
            </div>
            <div className={styles.messageTime}>
              {formatTime(message.createdAt)}
              {isDeliver && (
                <span className={styles.statusIcon}>
{message.status === "viewed" ? (
  <FaCheckDouble />
) : (
  <FaCheck />
)}
                </span>
              )}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  })}
  <div ref={messagesEndRef} />
</div>
                ) : (
<div className={styles.noMessages}>
  <div className={styles.noMessagesIcon}>💬</div>
  <div className={styles.noMessagesText}>
    {selectedMarket.name} bilan suhbatni boshlang
  </div>
  <div className={styles.noMessagesSubtext}>
    Birinchi xabaringizni yuboring
  </div>
</div>
                )}
              </div>

              {/* XABAR YUBORISH FORMASI */}
              <div className={styles.messageInputSection}>
                <div className={styles.inputContainer}>
<TextField
  fullWidth
  multiline
  maxRows={4}
  placeholder="Xabar yozing..."
  value={newMessage}
  onChange={(e) => setNewMessage(e.target.value)}
  onKeyPress={handleKeyPress}
  className={styles.messageInput}
  disabled={loading.send}
/>
<IconButton
  onClick={handleSendMessage}
  disabled={!newMessage.trim() || loading.send}
  className={styles.sendButton}
>
  {loading.send ? (
    <FaSpinner className={styles.sendSpinner} />
  ) : (
    <FaPaperPlane />
  )}
</IconButton>
                </div>
              </div>
            </>
          ) : (
            /* MARKET TANLANMAGAN HOLAT */
            <div className={styles.noSelection}>
              <div className={styles.noSelectionIcon}>👋</div>
              <div className={styles.noSelectionText}>
                Chat qilish uchun market tanlang
              </div>
              <div className={styles.noSelectionSubtext}>
                Chap paneldan marketni tanlab, suhbatni boshlashingiz mumkin
              </div>
            </div>
          )}
        </div>
      </div>

      {/* XABARLAR UCHUN SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default ChatD;
