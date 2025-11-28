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
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState("all");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [marketNames, setMarketNames] = useState({});
  const [productNames, setProductNames] = useState({});

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 1000,
    total: 0,
    totalPages: 0
  });

  console.log("Orders:", orders);
  console.log("Selected Order:", selectedOrder);
  console.log("Pagination:", pagination);

  // Filtrlar
  const [filters, setFilters] = useState({
    status: "all",
    from: "",
    to: "",
  });

  // Yuklanish holatlari
  const [loading, setLoading] = useState({
    markets: true,
    orders: false,
    export: false,
    details: false,
    products: true,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

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

      if (response.ok) {
        const marketsData = await response.json();
        setMarkets(marketsData);
        
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
      setLoading((prev) => ({ ...prev, markets: false }));
    }
  };

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
        setProducts(productsData);

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

  const fetchOrders = async (page = 1, limit = 10) => {
    try {
      setLoading((prev) => ({ ...prev, orders: true }));

      const queryParams = new URLSearchParams();

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
        
        setOrders(data.data || []);
        
        // Pagination ma'lumotlarini yangilash
        if (data.pagination) {
          setPagination({
            page: data.pagination.currentPage || page,
            limit: data.pagination.limit || limit,
            total: data.pagination.total || 0,
            totalPages: data.pagination.totalPages || 1
          });
        } else {
          // Agar pagination ma'lumotlari kelmasa
          setPagination(prev => ({
            ...prev,
            page,
            limit
          }));
        }
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error("Buyurtmalarni yuklab boʻlmadi:", error);
      showSnackbar("Buyurtmalarni yuklab boʻlmadi", "error");
    } finally {
      setLoading((prev) => ({ ...prev, orders: false }));
    }
  };

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
        console.log("Order details API response:", order);
        setSelectedOrder(order);
        setOrderDialogOpen(true);
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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchOrders(newPage, pagination.limit);
    }
  };

  const handleLimitChange = (newLimit) => {
    fetchOrders(1, newLimit);
  };

  // ==================== HELPER FUNCTIONS ====================

  const getMarketName = (marketId) => {
    if (!marketId) return "Noma'lum market";
    
    if (typeof marketId === 'object' && marketId.name) {
      return marketId.name;
    }
    
    const marketName = marketNames[marketId];
    return marketName || "Noma'lum market";
  };

  const getProductName = (productId) => {
    if (!productId) return "Noma'lum mahsulot";
    
    if (typeof productId === 'object' && productId.name) {
      return productId.name;
    }
    
    const productName = productNames[productId];
    return productName || "Noma'lum mahsulot";
  };

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
        fetchOrders(pagination.page, pagination.limit);
        setOrderDialogOpen(false);
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      console.error("Buyurtmani qabul qilib boʻlmadi:", error);
      showSnackbar("Buyurtmani qabul qilib boʻlmadi", "error");
    }
  };

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

  const rejectOrder = async (orderId) => {
    try {
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
        const blob = await response.blob();
        
        // Blob ni tekshirish
        if (blob.size === 0) {
          throw new Error("Fayl bo'sh");
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        
        // Fayl nomi
        const fileName = `buyurtmalar_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.download = fileName;
        
        document.body.appendChild(a);
        a.click();
        
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

  const calculateExcelTableData = () => {
    const productData = {};
    const orderColumns = {};

    console.log("Calculating excel data with orders:", orders);

    orders.forEach((order) => {
      const marketName = getMarketName(order.marketId);
      const date = new Date(order.createdAt).toLocaleDateString();
      const status = order.status;
      const orderKey = `${marketName} (${date}) - ${order._id.substring(0, 8)}`;

      orderColumns[orderKey] = {
        order: order,
        status: status,
        marketName: marketName,
        date: date,
      };

      order.products?.forEach((product) => {
        const productName = getProductName(product.productId);

        if (!productData[productName]) {
          productData[productName] = {};
        }

        productData[productName][orderKey] = product.quantity;
      });
    });

    return {
      productData,
      orderColumns,
      orderKeys: Object.keys(orderColumns).sort(),
    };
  };

  const calculateTotals = (productData, orderKeys) => {
    const rowTotals = {};
    const columnTotals = {};
    let grandTotal = 0;

    Object.keys(productData).forEach((productName) => {
      rowTotals[productName] = orderKeys.reduce((sum, orderKey) => {
        return sum + (productData[productName][orderKey] || 0);
      }, 0);
    });

    orderKeys.forEach((orderKey) => {
      columnTotals[orderKey] = Object.keys(productData).reduce(
        (sum, productName) => {
          return sum + (productData[productName][orderKey] || 0);
        },
        0
      );
    });

    grandTotal = Object.values(rowTotals).reduce(
      (sum, total) => sum + total,
      0
    );

    return { rowTotals, columnTotals, grandTotal };
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "#1976d2";
      case "accepted":
        return "#ed6c02";
      case "delivered":
        return "#2e7d32";
      case "rejected":
        return "#d32f2f";
      default:
        return "#666666";
    }
  };

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

  useEffect(() => {
    fetchMarkets();
    fetchProducts();
  }, []);

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
      {/* FILTR PANELI */}
      <div className={styles.filterPanel}>
        <div className={styles.filterHeader}>
          <h2>Excel Jadval - Har Bir Buyurtma Alohida</h2>
        </div>

        <div className={styles.filterControls}>
          {/* Market tanlash */}
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

          {/* Status filtri */}
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

          {/* Sana filtrlari */}
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

          {/* Export tugmasi */}
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

      {/* PAGINATION CONTROLS */}
      {orders.length > 0 && (
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInfo}>
            Jami: {pagination.total} ta buyurtma
          </div>
          
          <div className={styles.paginationControls}>
            <select
              className={styles.pageSizeSelect}
              value={pagination.limit}
              onChange={(e) => handleLimitChange(parseInt(e.target.value))}
            >
              <option value={10}>10 ta</option>
              <option value={25}>25 ta</option>
              <option value={50}>50 ta</option>
              <option value={100}>100 ta</option>
            </select>

            <button
              className={styles.paginationBtn}
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <FaChevronLeft />
            </button>

            <span className={styles.pageInfo}>
              {pagination.page} / {pagination.totalPages}
            </span>

            <button
              className={styles.paginationBtn}
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* EXCEL JADVALI */}
      <div className={styles.excelTablePanel}>
        {loading.orders ? (
          <div className={styles.loading}>
            <FaSpinner className={styles.spinner} />
            <span>Buyurtmalar yuklanmoqda...</span>
          </div>
        ) : orders.length > 0 ? (
          <div className={styles.excelTableContainer}>
            <table className={styles.excelTable}>
              <thead>
                <tr>
                  <th className={styles.productHeader}>
                    Mahsulot NOMi / Bo'g'chalar
                  </th>
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
                {Object.keys(productData).map((productName) => (
                  <tr key={productName} className={styles.productRow}>
                    <td className={styles.productCell}>{productName}</td>
                    {orderKeys.map((orderKey) => (
                      <td key={orderKey} className={styles.quantityCell}>
                        {productData[productName][orderKey] || 0}
                      </td>
                    ))}
                    <td className={styles.rowTotal}>
                      {rowTotals[productName]}
                    </td>
                  </tr>
                ))}

                {/* JAMI QATORI */}
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
          <div className={styles.noData}>
            <FaExclamationTriangle className={styles.noDataIcon} />
            <div>Hech qanday buyurtma topilmadi</div>
            <div className={styles.noDataSubtitle}>
              Filtrlarni o'zgartirib ko'ring yoki boshqa market tanlang
            </div>
          </div>
        )}
      </div>

      {/* BUYURTMA TAFSILOTLARI DIALOGI */}
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

            <div className={styles.dialogActions}>
              <button
                className={styles.closeDialogBtn}
                onClick={() => setOrderDialogOpen(false)}
              >
                Yopish
              </button>

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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default DashboardD;