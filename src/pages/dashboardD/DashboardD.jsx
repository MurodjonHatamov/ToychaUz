import React, { useState, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";
import {
  FaDownload,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import styles from "./DashboardD.module.css";

function DashboardD() {
  // ==================== STATE DEFINITIONS ====================
  
  // Marketlar ro'yxati - barcha mavjud marketlar
  const [markets, setMarkets] = useState([]);
  
  // Tanlangan market - "all" bo'lsa barcha marketlar
  const [selectedMarket, setSelectedMarket] = useState("all");
  
  // Buyurtmalar ro'yxati - joriy sahifadagi buyurtmalar
  const [orders, setOrders] = useState([]);
  
  // Tanlangan buyurtma - batafsil ko'rish uchun
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Mahsulotlar ro'yxati - barcha mavjud mahsulotlar
  const [products, setProducts] = useState([]);
  
  // Market nomlari xaritasi - ID bo'yicha tez qidirish uchun
  const [marketNames, setMarketNames] = useState({});
  
  // Mahsulot nomlari xaritasi - ID bo'yicha tez qidirish uchun
  const [productNames, setProductNames] = useState({});

  // ✅ TO'G'RI PAGINATION STATE - Sahifalash ma'lumotlari
  const [pagination, setPagination] = useState({
    page: 1,           // Joriy sahifa raqami
    limit: 10,         // Sahifadagi elementlar soni
    total: 0,          // Jami buyurtmalar soni
    totalPages: 0      // Jami sahifalar soni
  });

  // Filtrlar - buyurtmalarni filtrlash uchun parametrlar
  const [filters, setFilters] = useState({
    status: "all",    // Buyurtma holati: all, new, accepted, delivered, rejected
    from: "",         // Boshlanish sanasi
    to: "",           // Tugash sanasi
  });

  // Yuklanish holatlari - turli operatsiyalarning yuklanish holati
  const [loading, setLoading] = useState({
    markets: true,    // Marketlar yuklanmoqda
    orders: false,    // Buyurtmalar yuklanmoqda
    export: false,    // Excel export yuklanmoqda
    details: false,   // Buyurtma tafsilotlari yuklanmoqda
    products: true,   // Mahsulotlar yuklanmoqda
  });

  // Xabar ko'rsatish uchun - foydalanuvchiga xabar ko'rsatish
  const [snackbar, setSnackbar] = useState({
    open: false,      // Xabar ochiq/yopiq
    message: "",      // Xabar matni
    severity: "success", // Xabar turi: success, error, warning, info
  });

  // Buyurtma tafsilotlari dialogi ochiq/yopiq
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  // ==================== API FUNCTIONS ====================

  /**
   * Marketlarni serverdan yuklash
   * Barcha mavjud marketlarni olish va ularni state ga saqlash
   */
  const fetchMarkets = async () => {
    try {
      setLoading((prev) => ({ ...prev, markets: true })); // Yuklanish holatini true qilish
      const response = await fetch("http://localhost:2277/markets", {
        method: "GET",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        credentials: "include", // Cookie bilan autentifikatsiya
      });

      if (response.ok) {
        const marketsData = await response.json();
        setMarkets(marketsData); // Marketlarni state ga saqlash
        
        // Market nomlarini xarita ko'rinishida saqlash (tez qidirish uchun)
        const marketMap = {};
        marketsData.forEach(market => {
          marketMap[market._id] = market.name;
        });
        setMarketNames(marketMap);
      }
    } catch (error) {
      console.error("Marketlarni yuklab boʻlmadi:", error);
      showSnackbar("Marketlarni yuklab boʻlmadi", "error");
    } finally {
      setLoading((prev) => ({ ...prev, markets: false })); // Yuklanish holatini false qilish
    }
  };

  /**
   * Mahsulotlarni serverdan yuklash
   * Barcha mavjud mahsulotlarni olish va ularni state ga saqlash
   */
  const fetchProducts = async () => {
    try {
      setLoading((prev) => ({ ...prev, products: true }));
      const response = await fetch("http://localhost:2277/products", {
        method: "GET",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const productsData = await response.json();
        setProducts(productsData); // Mahsulotlarni state ga saqlash

        // Mahsulot nomlarini xarita ko'rinishida saqlash
        const productMap = {};
        productsData.forEach(product => {
          productMap[product._id] = product.name;
        });
        setProductNames(productMap);
      }
    } catch (error) {
      console.error("Mahsulotlarni yuklab boʻlmadi:", error);
      showSnackbar("Mahsulotlarni yuklab boʻlmadi", "error");
    } finally {
      setLoading((prev) => ({ ...prev, products: false }));
    }
  };

  /**
   * ✅ TO'G'RILANGAN fetchOrders FUNKSIYASI
   * Buyurtmalarni serverdan yuklash filtr va pagination bilan
   * @param {number} page - Yuklanayotgan sahifa raqami (default: 1)
   * @param {number} limit - Sahifadagi elementlar soni (default: 10)
   */
  const fetchOrders = async (page = 1, limit = 10) => {
    try {
      setLoading((prev) => ({ ...prev, orders: true })); // Buyurtmalar yuklanmoqda

      const queryParams = new URLSearchParams(); // URL parametrlari uchun

      // Required parametrlarni faqat qiymati bo'lsa qo'shamiz
      if (selectedMarket && selectedMarket !== "all") {
        queryParams.append("marketId", selectedMarket);
      }

      if (filters.status && filters.status !== "all") {
        queryParams.append("status", filters.status);
      }

      if (filters.from) {
        queryParams.append("from", filters.from);
      }

      if (filters.to) {
        queryParams.append("to", filters.to);
      }

      // Pagination parametrlari
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());

      const response = await fetch(
        `http://localhost:2277/deliver/orders?${queryParams}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Orders API response:", data);
        
        setOrders(data.data || []); // Buyurtmalarni state ga saqlash
        
        // ✅ TO'G'RI PAGINATION - Backenddan to'g'ri kelgan ma'lumotlar
        const total = data.total || 0;        // Jami buyurtmalar soni
        const lim = data.limit || limit;      // Limit qiymati
        const currentPage = data.page || page; // Joriy sahifa

        setPagination({
          page: currentPage,
          limit: lim,
          total: total,
          totalPages: Math.ceil(total / lim), // ✅ Avtomatik hisoblaymiz: jami sahifalar soni
        });

      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error("Buyurtmalarni yuklab boʻlmadi:", error);
      showSnackbar("Buyurtmalarni yuklab boʻlmadi", "error");
    } finally {
      setLoading((prev) => ({ ...prev, orders: false })); // Yuklanish tugadi
    }
  };

  /**
   * Buyurtma tafsilotlarini olish
   * @param {string} orderId - Buyurtma ID si
   */
  const fetchOrderDetails = async (orderId) => {
    try {
      setLoading((prev) => ({ ...prev, details: true }));
      const response = await fetch(
        `http://localhost:2277/deliver/orders/${orderId}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const order = await response.json();
        setSelectedOrder(order); // Tanlangan buyurtmani saqlash
        setOrderDialogOpen(true); // Dialogni ochish
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error("Buyurtma ma'lumotlarini olish mumkin emas:", error);
      showSnackbar("Buyurtma ma'lumotlarini olish mumkin emas", "error");
    } finally {
      setLoading((prev) => ({ ...prev, details: false }));
    }
  };

  // ==================== PAGINATION FUNCTIONS ====================

  /**
   * Sahifa o'zgartirish
   * @param {number} newPage - Yangi sahifa raqami
   */
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchOrders(newPage, pagination.limit); // Yangi sahifani yuklash
    }
  };

  /**
   * Limit o'zgartirish (sahifadagi elementlar soni)
   * @param {number} newLimit - Yangi limit qiymati
   */
  const handleLimitChange = (newLimit) => {
    fetchOrders(1, newLimit); // 1-sahifadan boshlab yangi limit bilan yuklash
  };

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Market ID bo'yicha market nomini olish
   * @param {string|object} marketId - Market ID yoki market objekti
   * @returns {string} Market nomi
   */
  const getMarketName = (marketId) => {
    if (!marketId) return "Noma'lum market";
    
    // Agar marketId object bo'lsa va name property si bo'lsa
    if (typeof marketId === 'object' && marketId.name) {
      return marketId.name;
    }
    
    // Xaritadan market nomini olish
    const marketName = marketNames[marketId];
    return marketName || "Noma'lum market";
  };

  /**
   * Mahsulot ID bo'yicha mahsulot nomini olish
   * @param {string|object} productId - Mahsulot ID yoki mahsulot objekti
   * @returns {string} Mahsulot nomi
   */
  const getProductName = (productId) => {
    if (!productId) return "Noma'lum mahsulot";
    
    if (typeof productId === 'object' && productId.name) {
      return productId.name;
    }
    
    const productName = productNames[productId];
    return productName || "Noma'lum mahsulot";
  };

  /**
   * Buyurtmani qabul qilish
   * @param {string} orderId - Buyurtma ID si
   */
  const acceptOrder = async (orderId) => {
    try {
      const response = await fetch(
        `http://localhost:2277/deliver/${orderId}/accept-order`,
        {
          method: "PATCH",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        showSnackbar("Buyurtma muvaffaqiyatli qabul qilindi", "success");
        fetchOrders(pagination.page, pagination.limit); // Yangilangan ro'yxatni yuklash
        setOrderDialogOpen(false); // Dialogni yopish
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error("Buyurtmani qabul qilib boʻlmadi:", error);
      showSnackbar("Buyurtmani qabul qilib boʻlmadi", "error");
    }
  };

  /**
   * Buyurtmani yetkazib berish
   * @param {string} orderId - Buyurtma ID si
   */
  const deliverOrder = async (orderId) => {
    try {
      const response = await fetch(
        `http://localhost:2277/deliver/${orderId}/delivered-order`,
        {
          method: "PATCH",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        showSnackbar("Buyurtma muvaffaqiyatli yetkazib berildi", "success");
        fetchOrders(pagination.page, pagination.limit);
        setOrderDialogOpen(false);
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error("Buyurtmani yetkazib berib boʻlmadi:", error);
      showSnackbar("Buyurtmani yetkazib berib boʻlmadi", "error");
    }
  };

  /**
   * Buyurtmani rad etish (bekor qilish)
   * @param {string} orderId - Buyurtma ID si
   */
  const rejectOrder = async (orderId) => {
    try {
      // Foydalanuvchidan tasdiq olish
      const isConfirmed = window.confirm(
        "Haqiqatan ham bu buyurtmani bekor qilmoqchimisiz?"
      );
      if (!isConfirmed) return;

      const response = await fetch(
        `http://localhost:2277/deliver/${orderId}/reject-order`,
        {
          method: "PATCH",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        showSnackbar("Buyurtma muvaffaqiyatli bekor qilindi", "warning");
        fetchOrders(pagination.page, pagination.limit);
        setOrderDialogOpen(false);
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error("Buyurtmani bekor qilib boʻlmadi:", error);
      showSnackbar("Buyurtmani bekor qilib boʻlmadi", "error");
    }
  };

  /**
   * Excel faylga export qilish
   * Barcha filtrlangan ma'lumotlarni Excel fayl sifatida yuklab olish
   */
  const exportToExcel = async () => {
    try {
      setLoading((prev) => ({ ...prev, export: true }));

      const queryParams = new URLSearchParams();

      // Export uchun barcha ma'lumotlarni olish (pagination siz)
      if (selectedMarket && selectedMarket !== "all") {
        queryParams.append("marketId", selectedMarket);
      }
      if (filters.status && filters.status !== "all") {
        queryParams.append("status", filters.status);
      }
      if (filters.from) {
        queryParams.append("from", filters.from);
      }
      if (filters.to) {
        queryParams.append("to", filters.to);
      }

      // Export endpoint'iga so'rov
      const response = await fetch(
        `http://localhost:2277/deliver/export?${queryParams}`,
        {
          method: "GET",
          headers: {
            accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const blob = await response.blob(); // Excel fayl ni olish
        
        // Blob ni tekshirish
        if (blob.size === 0) {
          throw new Error("Fayl bo'sh");
        }

        // Faylni yuklab olish
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        
        // Fayl nomi
        const fileName = `buyurtmalar_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.download = fileName;
        
        document.body.appendChild(a);
        a.click(); // Faylni yuklab olish
        
        // Tozalash
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showSnackbar("Excel fayl muvaffaqiyatli yuklab olindi", "success");
      } else {
        const errorText = await response.text();
        console.error("Export xatosi:", errorText);
        throw new Error(`Server xatosi: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("Export qilib boʻlmadi:", error);
      showSnackbar(`Export qilib boʻlmadi: ${error.message}`, "error");
    } finally {
      setLoading((prev) => ({ ...prev, export: false }));
    }
  };

  // ==================== EXCEL TABLE FUNCTIONS ====================

  /**
   * Excel jadvali uchun ma'lumotlarni hisoblash
   * Mahsulotlar va buyurtmalar o'rtasidagi bog'liqlikni hisoblaydi
   * @returns {object} Excel jadvali uchun tayyor ma'lumotlar
   */
  const calculateExcelTableData = () => {
    const productData = {};    // Mahsulotlar ma'lumotlari: {productName: {orderKey: quantity}}
    const orderColumns = {};   // Buyurtma ustunlari: {orderKey: {order, status, marketName, date}}

    orders.forEach((order) => {
      const marketName = getMarketName(order.marketId);
      const date = new Date(order.createdAt).toLocaleDateString();
      const status = order.status;
      // Buyurtma kaliti: Market nomi (sana) - buyurtma ID si (qisqartirilgan)
      const orderKey = `${marketName} (${date}) `;

      orderColumns[orderKey] = {
        order: order,
        status: status,
        marketName: marketName,
        date: date,
      };

      // Har bir mahsulot uchun ma'lumotlarni to'plash
      order.products?.forEach((product) => {
        const productName = getProductName(product.productId);

        if (!productData[productName]) {
          productData[productName] = {};
        }

        // Mahsulot miqdorini saqlash
        productData[productName][orderKey] = product.quantity;
      });
    });

    return {
      productData,
      orderColumns,
      orderKeys: Object.keys(orderColumns).sort(), // Tartiblangan buyurtma kalitlari
    };
  };

  /**
   * Excel jadvali uchun jami summalarni hisoblash
   * @param {object} productData - Mahsulotlar ma'lumotlari
   * @param {array} orderKeys - Buyurtma kalitlari
   * @returns {object} Jami summalar
   */
  const calculateTotals = (productData, orderKeys) => {
    const rowTotals = {};      // Qator jami: har bir mahsulotning umumiy miqdori
    const columnTotals = {};   // Ustun jami: har bir buyurtmaning umumiy miqdori
    let grandTotal = 0;        // Umumiy jami: barcha mahsulotlarning umumiy miqdori

    // Har bir mahsulot uchun qator jami hisoblash
    Object.keys(productData).forEach((productName) => {
      rowTotals[productName] = orderKeys.reduce((sum, orderKey) => {
        return sum + (productData[productName][orderKey] || 0);
      }, 0);
    });

    // Har bir buyurtma uchun ustun jami hisoblash
    orderKeys.forEach((orderKey) => {
      columnTotals[orderKey] = Object.keys(productData).reduce(
        (sum, productName) => {
          return sum + (productData[productName][orderKey] || 0);
        },
        0
      );
    });

    // Umumiy jami hisoblash
    grandTotal = Object.values(rowTotals).reduce(
      (sum, total) => sum + total,
      0
    );

    return { rowTotals, columnTotals, grandTotal };
  };

  /**
   * Xabar ko'rsatish funksiyasi
   * @param {string} message - Xabar matni
   * @param {string} severity - Xabar turi: success, error, warning, info
   */
  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  /**
   * Status bo'yicha rang olish
   * @param {string} status - Buyurtma holati
   * @returns {string} Rang kodi
   */
  const getStatusColor = (status) => {
    switch (status) {
      case "new":        // Yangi buyurtma - ko'k
        return "#1976d2";
      case "accepted":   // Qabul qilingan - to'q sariq
        return "#ed6c02";
      case "delivered":  // Yetkazilgan - yashil
        return "#2e7d32";
      case "rejected":   // Rad etilgan - qizil
        return "#d32f2f";
      default:           // Noma'lum - kulrang
        return "#666666";
    }
  };

  /**
   * Status bo'yicha matn olish
   * @param {string} status - Buyurtma holati
   * @returns {string} Status matni
   */
  const getStatusText = (status) => {
    switch (status) {
      case "new":
        return "Yangi";
      case "accepted":
        return "Qabul qilindi";
      case "delivered":
        return "Yetkazib berildi";
      case "rejected":
        return "Rad etildi";
      default:
        return status;
    }
  };

  // ==================== USE EFFECT HOOKS ====================

  // Komponent yuklanganda marketlar va mahsulotlarni yuklash
  useEffect(() => {
    fetchMarkets();
    fetchProducts();
  }, []);

  // Market yoki filtr o'zgarganda buyurtmalarni qayta yuklash
  useEffect(() => {
    // Filtr o'zgarganda 1-sahifaga qaytish
    fetchOrders(1, pagination.limit);
  }, [selectedMarket, filters]);

  // Excel jadval ma'lumotlarini hisoblash
  const { productData, orderColumns, orderKeys } = calculateExcelTableData();
  const { rowTotals, columnTotals, grandTotal } = calculateTotals(
    productData,
    orderKeys
  );

  // ==================== RENDER ====================

  return (
    <div className={styles.dashboard}>
      {/* FILTR PANELI - Buyurtmalarni filtrlash uchun interfeys */}
      <div className={styles.filterPanel}>
  

        <div className={styles.filterControls}>
          {/* Market tanlash - Qaysi marketning buyurtmalarini ko'rish */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Market</label>
            <select
              className={styles.filterSelect}
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
            >
              <option value="all">Barcha Marketlar</option>
              {markets.map((market) => (
                <option key={market._id} value={market._id}>
                  {market.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status filtri - Buyurtma holati bo'yicha filtrlash */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Status</label>
            <select
              className={styles.filterSelect}
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="all">Barchasi</option>
              <option value="new">Yangi</option>
              <option value="accepted">Qabul qilindi</option>
              <option value="delivered">Yetkazib berildi</option>
              <option value="rejected">Rad etildi</option>
            </select>
          </div>

          {/* Sana filtrlari - Vaqt oralig'i bo'yicha filtrlash */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Dan</label>
            <input
              type="date"
              className={styles.filterInput}
              value={filters.from}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, from: e.target.value }))
              }
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Gacha</label>
            <input
              type="date"
              className={styles.filterInput}
              value={filters.to}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, to: e.target.value }))
              }
            />
          </div>

          {/* Export tugmasi - Excel faylga export qilish */}
          <button
            className={styles.exportButton}
            onClick={exportToExcel}
            disabled={loading.export || loading.orders || orders.length === 0}
          >
            {loading.export ? (
              <FaSpinner className={styles.buttonSpinner} />
            ) : (
              <FaDownload className={styles.buttonIcon} />
            )}
            {loading.export ? "Yuklanmoqda..." : "Excelga Export"}
          </button>
        </div>
      </div>

      {/* ✅ TO'G'RI PAGINATION CONTROLS - Sahifalash boshqaruvi */}
      {orders.length > 0 && (
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInfo}>
            Jami: {pagination.total} ta buyurtma | 
            Sahifa: {pagination.page} / {pagination.totalPages}
          </div>
          
          <div className={styles.paginationControls}>
            {/* Sahifadagi elementlar sonini o'zgartirish */}
            <select
              className={styles.pageSizeSelect}
              value={pagination.limit}
              onChange={(e) => handleLimitChange(parseInt(e.target.value))}
            >
              <option value={5}>5 ta</option>
              <option value={10}>10 ta</option>
              <option value={25}>25 ta</option>
              <option value={50}>50 ta</option>
            </select>

            {/* Oldingi sahifaga o'tish */}
            <button
              className={styles.paginationBtn}
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1} // 1-sahifada disabled
            >
              <FaChevronLeft />
            </button>

            {/* Sahifa raqamlari */}
            <span className={styles.pageInfo}>
              {pagination.page} / {pagination.totalPages}
            </span>

            {/* Keyingi sahifaga o'tish */}
            <button
              className={styles.paginationBtn}
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages} // Oxirgi sahifada disabled
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* EXCEL JADVALI - Buyurtmalar va mahsulotlarni ko'rsatish */}
      <div className={styles.excelTablePanel}>
        {loading.orders ? (
          // Yuklanish ko'rsatkichi
          <div className={styles.loading}>
            <FaSpinner className={styles.spinner} />
            <span>Buyurtmalar yuklanmoqda...</span>
          </div>
        ) : orders.length > 0 ? (
          // Excel style jadval
          <div className={styles.excelTableContainer}>
            <table className={styles.excelTable}>
              <thead>
                <tr>
                  <th className={styles.productHeader}>
                    Mahsulot NOMi / Bo'g'chalar
                  </th>
                  {/* Buyurtma ustunlari - har bir buyurtma alohida ustun */}
                  {orderKeys.map((orderKey) => {
                    const order = orderColumns[orderKey]?.order;
                    const status = orderColumns[orderKey]?.status;
                    return (
                      <th
                        key={orderKey}
                        className={styles.orderHeader}
                        style={{
                          backgroundColor: getStatusColor(status),
                          color: "white",
                        }}
                        onClick={() => order && fetchOrderDetails(order._id)}
                        title={`${orderKey} - ${getStatusText(
                          status
                        )} (Batafsil ko'rish uchun bosing)`}
                      >
                        <div className={styles.orderHeaderContent}>
                          <div className={styles.orderTitle}>{orderKey}</div>
                          <div className={styles.statusBadge}>
                            {getStatusText(status)}
                          </div>
                        </div>
                      </th>
                    );
                  })}
                  <th className={styles.totalHeader}>Jami</th>
                </tr>
              </thead>
              <tbody>
                {/* Mahsulot qatorlari - har bir mahsulot alohida qator */}
                {Object.keys(productData).map((productName) => (
                  <tr key={productName} className={styles.productRow}>
                    <td className={styles.productCell}>{productName}</td>
                    {/* Har bir buyurtma uchun mahsulot miqdori */}
                    {orderKeys.map((orderKey) => (
                      <td key={orderKey} className={styles.quantityCell}>
                        {productData[productName][orderKey] || 0}
                      </td>
                    ))}
                    {/* Qator jami */}
                    <td className={styles.rowTotal}>
                      {rowTotals[productName]}
                    </td>
                  </tr>
                ))}

                {/* JAMI QATORI - Barcha ustunlar va qatorlar uchun jami */}
                <tr className={styles.grandTotalRow}>
                  <td className={styles.grandTotalLabel}>JAMI</td>
                  {orderKeys.map((orderKey) => (
                    <td key={orderKey} className={styles.columnTotal}>
                      {columnTotals[orderKey]}
                    </td>
                  ))}
                  <td className={styles.grandTotal}>{grandTotal}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          // Hech qanday ma'lumot topilmaganda
          <div className={styles.noData}>
            <FaExclamationTriangle className={styles.noDataIcon} />
            <div>Hech qanday buyurtma topilmadi</div>
            <div className={styles.noDataSubtitle}>
              Filtrlarni o'zgartirib ko'ring yoki boshqa market tanlang
            </div>
          </div>
        )}
      </div>

      {/* BUYURTMA TAFSILOTLARI DIALOGI - Buyurtma haqida batafsil ma'lumot */}
      {orderDialogOpen && selectedOrder && (
        <div
          className={styles.dialogOverlay}
          onClick={() => setOrderDialogOpen(false)}
        >
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dialogHeader}>
              <h2>Buyurtma Tafsilotlari</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setOrderDialogOpen(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.dialogContent}>
              {loading.details ? (
                <div className={styles.loading}>
                  <FaSpinner className={styles.spinner} />
                  <span>Ma'lumotlar yuklanmoqda...</span>
                </div>
              ) : (
                <div>
                  {/* Umumiy ma'lumotlar bo'limi */}
                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Umumiy ma'lumotlar</h3>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <label>Buyurtma ID:</label>
                        <div className={styles.detailValue}>
                          {selectedOrder._id}
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Market:</label>
                        <div className={styles.detailValue}>
                          {getMarketName(selectedOrder.marketId)}
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Holati:</label>
                        <div
                          className={styles.statusBadgeLarge}
                          style={{
                            backgroundColor: getStatusColor(
                              selectedOrder.status
                            ),
                          }}
                        >
                          {getStatusText(selectedOrder.status)}
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <label>Sana:</label>
                        <div className={styles.detailValue}>
                          {new Date(selectedOrder.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mahsulotlar bo'limi */}
                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                      Mahsulotlar ({selectedOrder.products?.length || 0})
                    </h3>
                    <div className={styles.productsTable}>
                      {selectedOrder.products?.map((product, index) => (
                        <div key={index} className={styles.productRowDetail}>
                          <div className={styles.productName}>
                            {getProductName(product.productId)}
                          </div>
                          <div className={styles.productQuantity}>
                            {product.quantity} ta
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dialog amallari - buyurtma holatini o'zgartirish */}
            <div className={styles.dialogActions}>
              <button
                className={styles.closeDialogBtn}
                onClick={() => setOrderDialogOpen(false)}
              >
                Yopish
              </button>

              {/* Yangi buyurtma uchun amallar */}
              {selectedOrder.status === "new" && (
                <>
                  <button
                    className={styles.acceptBtn}
                    onClick={() => acceptOrder(selectedOrder._id)}
                  >
                    <FaCheckCircle className={styles.actionIcon} />
                    Qabul qilish
                  </button>
                  <button
                    className={styles.rejectBtn}
                    onClick={() => rejectOrder(selectedOrder._id)}
                  >
                    <FaTimesCircle className={styles.actionIcon} />
                    Bekor qilish
                  </button>
                </>
              )}

              {/* Qabul qilingan buyurtma uchun amallar */}
              {selectedOrder.status === "accepted" && (
                <button
                  className={styles.deliverBtn}
                  onClick={() => deliverOrder(selectedOrder._id)}
                >
                  <FaCheckCircle className={styles.actionIcon} />
                  Yetkazish
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* XABARLAR UCHUN SNACKBAR - Foydalanuvchiga xabar ko'rsatish */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default DashboardD;