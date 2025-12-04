// components/orderCard/OrderCard.js
import React, { useState, useEffect } from "react";
import { Button, TextField, MenuItem, CircularProgress } from "@mui/material";
import styles from "./OrderCard.module.css";


import {
  MdAccessTime,
  MdCancel,
  MdCheckCircle,
  MdEdit,
  MdDelete,
  MdAdd,
  MdSave,
  MdClose,
  MdDoneAll
} from "react-icons/md";
import { logaut } from "../../pages/logaut";

const OrderCard = ({
  order,
  onUpdateProduct,
  onCancelOrder,
}) => {
  // ========== STATE LAR ==========
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [localProducts, setLocalProducts] = useState([...order.products]);

  
  // 🎯 YANGI: Faqat shu OrderCard uchun loader statelari
  const [isSaving, setIsSaving] = useState(false); // Saqlash jarayoni
  const [isCanceling, setIsCanceling] = useState(false); // Bekor qilish jarayoni

  // ========== USE EFFECT HOOKS ==========
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // 🎯 Tahrirlash rejimi yoqilganda mahsulotlarni yuklaymiz
  useEffect(() => {
    const fetchAvailableProducts = async () => {
      try {
        const response = await fetch(`${baseURL}/orders/products`, {
          method: "GET",
          credentials: "include",
        });
        logaut(response);

        if (response.ok) {
          const products = await response.json();
          setAvailableProducts(products);
        }
      } catch (error) {
        // Mahsulotlarni olishda xatolik
      }
    };

    if (isEditing) {
      fetchAvailableProducts();
      setLocalProducts([...order.products]);
    }
  }, [isEditing, order.products]);

  // ========== YORDAMCHI FUNKSIYALAR ==========
  const getButtonText = (type) => {
    if (isMobile) {
      const texts = {
        edit: "Tahrir",
        save: "Saqlash",
        cancel: "Bekor",
        add: "Qo'shish",
        ready: "Tayyor",
      };
      return texts[type] || type;
    }

    return {
      edit: "Tahrirlash",
      save: "Saqlash",
      cancel: "Bekor Qilish",
      add: "Yangi mahsulot qo'shish",
      ready: "Tayyor",
    }[type];
  };

  const getStatusConfig = (status) => {
    const configs = {
      new: {
        icon: <MdAccessTime />,
        text: "Yangi",
        bgColor: "statusNew",
      },
      delivered: {
        icon: <MdCheckCircle />,
        text: "Yetkazilgan",
        bgColor: "statusDelivered",
      },
      accepted: {
        icon: <MdDoneAll />,
        text: "Qabul qilingan",
        bgColor: "statusAccepted",
      },
      rejected: {
        icon: <MdCancel />,
        text: "Bekor qilingan",
        bgColor: "statusCancelled",
      }
    };
    return configs[status] || configs.new;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
  
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
  
    return `${day}.${month}.${year}`;
  };
  

  const getTotalItems = (products) => {
    return products.reduce((total, product) => total + product.quantity, 0);
  };

  // ========== ASOSIY HANDLER FUNKSIYALARI ==========

  /**
   * ✏️ Tahrirlash rejimini yoqadi
   */
  const handleStartEdit = () => {
    setIsEditing(true);
  };

  /**
   * ✅ Tahrirlash rejimini yopadi va barcha o'zgarishlarni bekor qiladi
   */
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingProduct(null);
    setNewProduct(null);
    setLocalProducts([...order.products]);
  };

  /**
   * 💾 Barcha o'zgarishlarni saqlaydi va backendga yuboradi
   */
  const handleSaveAllChanges = async () => {
    try {
      setIsSaving(true); // 🎯 Faqat Saqlash tugmasi uchun loader
      
      // Backend formatiga moslashtiramiz
      const productsForBackend = localProducts.map(product => ({
        productId: product.productId,
        quantity: product.quantity
      }));

      // Parent komponentga yangilangan mahsulotlar ro'yxatini yuboramiz
      await onUpdateProduct(order._id, { products: productsForBackend });
      
      setIsEditing(false);
      setEditingProduct(null);
      setNewProduct(null);
      
    } catch (error) {
      // Saqlashda xatolik
    } finally {
      setIsSaving(false); // 🎯 Loaderni o'chiramiz
    }
  };

  /**
   * 🛠️ Mahsulotni tahrirlash uchun tanlaydi
   */
  const handleEditProduct = (product) => {
    setEditingProduct({ ...product });
    setNewProduct(null);
  };

  /**
   * 💾 Bitta mahsulotni yangilaydi (faqat local state da)
   */
  const handleUpdateProduct = () => {
    if (editingProduct) {
      const updatedProducts = localProducts.map(product =>
        product._id === editingProduct._id ? editingProduct : product
      );
      setLocalProducts(updatedProducts);
      setEditingProduct(null);
    }
  };

  /**
   * 🗑️ Mahsulotni o'chiradi (faqat local state dan)
   */
  const handleDeleteProduct = (productId) => {
    const updatedProducts = localProducts.filter(product => product._id !== productId);
    setLocalProducts(updatedProducts);
  };

  /**
   * ➕ Yangi mahsulot qo'shish rejimini yoqadi
   */
  const handleAddProduct = () => {
    const product = {
      _id: `temp-${Date.now()}`,
      productId: "",
      quantity: 1,
      productName: "",
      unit: "",
    };
    setNewProduct(product);
    setEditingProduct(null);
  };

  /**
   * 💾 Yangi mahsulotni qo'shadi (faqat local state ga)
   */
  const handleSaveNewProduct = () => {
    if (newProduct && newProduct.productId) {
      const selectedProduct = availableProducts.find(
        (p) => p._id === newProduct.productId
      );
      
      const productToSave = {
        ...newProduct,
        productName: selectedProduct?.name || "Noma'lum mahsulot",
        unit: selectedProduct?.unit || "dona",
      };
      
      const updatedProducts = [...localProducts, productToSave];
      setLocalProducts(updatedProducts);
      setNewProduct(null);
    }
  };

  /**
   * 🔄 Mahsulot maydonlarining o'zgarishini boshqaradi
   */
  const handleProductChange = (field, value, productType) => {
    if (field === "productId") {
      const selectedProduct = availableProducts.find((p) => p._id === value);

      if (productType === "new") {
        setNewProduct({
          ...newProduct,
          productId: value,
          productName: selectedProduct?.name || "",
          unit: selectedProduct?.unit || "",
        });
      } else {
        setEditingProduct({
          ...editingProduct,
          productId: value,
          productName: selectedProduct?.name || "",
          unit: selectedProduct?.unit || "",
        });
      }
    } else {
      if (productType === "new") {
        setNewProduct({
          ...newProduct,
          [field]: value,
        });
      } else {
        setEditingProduct({
          ...editingProduct,
          [field]: value,
        });
      }
    }
  };

  /**
   * ❌ Butun buyurtmani bekor qilish
   */
  const handleCancelOrder = async () => {
    if (window.confirm("Haqiqatan ham bu buyurtmani bekor qilmoqchimisiz?")) {
      try {
        setIsCanceling(true); // 🎯 Faqat Bekor qilish tugmasi uchun loader
        
        await onCancelOrder(order._id);
        
      } catch (error) {
        // Bekor qilishda xatolik
      } finally {
        setIsCanceling(false); // 🎯 Loaderni o'chiramiz
      }
    }
  };

  // ========== RENDER QISMI ==========
  const statusConfig = getStatusConfig(order.status);

  return (
    <div className={`${styles.orderCard} ${isEditing ? styles.editingMode : ""}`}>
      <div className={styles.cardContent}>
        
        {/* 📝 Sarlavha qismi */}
        <div className={styles.orderHeader}>
          <div className={styles.orderInfo}>
            <h3 className={styles.orderNumber}>
              Buyurtma #{order._id.slice(-6).toUpperCase()}
            </h3>
            <p className={styles.orderDate}>{formatDate(order.createdAt)}</p>
          </div>
          <div className={styles.orderActions}>
            <div className={`${styles.statusChip} ${styles[statusConfig.bgColor]}`}>
              {statusConfig.icon}
              <span>{statusConfig.text}</span>
            </div>

            {/* 🔧 Tahrirlash tugmalari */}
            {order.status === "new" && (
              <div className={styles.editActions}>
                {!isEditing ? (
                  // Tahrirlashni boshlash tugmasi
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<MdEdit />}
                    onClick={handleStartEdit}
                    className={styles.editButton}
                    disabled={isSaving || isCanceling} // 🎯 Faqat loader paytida disable
                  >
                    {getButtonText("edit")}
                  </Button>
                ) : (
                  // Saqlash va bekor qilish tugmalari
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={isSaving ? <CircularProgress size={16} /> : <MdSave />}
                      onClick={handleSaveAllChanges}
                      className={styles.saveButton}
                      disabled={isSaving || isCanceling} // 🎯 Faqat loader paytida disable
                    >
                      {isSaving ? "Saqlanmoqda..." : getButtonText("save")}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<MdClose />}
                      onClick={handleCancelEdit}
                      className={styles.cancelButton}
                      disabled={isSaving || isCanceling} // 🎯 Faqat loader paytida disable
                    >
                      {getButtonText("cancel")}
                    </Button>
                  </div>
                )}

                {/* Buyurtmani butunlay bekor qilish tugmasi */}
                {!isEditing && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={isCanceling ? <CircularProgress size={16} /> : <MdDelete />}
                    onClick={handleCancelOrder}
                    className={styles.cancelOrderButton}
                    disabled={isSaving || isCanceling} // 🎯 Faqat loader paytida disable
                  >
                    {isCanceling ? "Bekor qilinmoqda..." : getButtonText("cancel")}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 📊 Mahsulotlar jadvali */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeader}>Mahsulot</th>
                <th className={styles.tableHeader} style={{ textAlign: "right" }}>
                  Miqdor
                </th>
                <th className={styles.tableHeader} style={{ textAlign: "right" }}>
                  Birlik
                </th>
                {isEditing && <th className={styles.tableHeader}>Harakatlar</th>}
              </tr>
            </thead>
            <tbody>
              {/* 📋 Mavjud mahsulotlar (local statedan o'qiymiz) */}
              {localProducts.map((product) => (
                <tr key={product._id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    {isEditing && editingProduct?._id === product._id ? (
                    <TextField
  select
  value={editingProduct.productId}
  onChange={(e) =>
    handleProductChange("productId", e.target.value, "edit")
  }
  size="small"
  sx={{
    width: "100%",
    maxWidth: "120px",
    minWidth: "80px",

    // 🔹 Select text rangi
    "& .MuiSelect-select": {
      color: "var(--text)",
    },

    // 🔹 Default & hover border
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "var(--border)",
      borderRadius: "var(--radius)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "var(--secondary-dark)",
    },

    // 🔹 Fokus bo‘lganda border
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "var(--primary)",
      borderWidth: "2px",
    },

    // 🔹 Fokus bo‘lganda label rangi
    "& .MuiInputLabel-root.Mui-focused": {
      color: "var(--primary)",
    },

    // 🔹 Disabled style
    "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
      borderColor: "var(--border)",
      opacity: 0.6,
    },
    "& .MuiSelect-select.Mui-disabled": {
      color: "var(--text-light)",
    },
  }}
  disabled={isSaving || isCanceling} // loader paytida disable
>
  <MenuItem value="">Tanlang</MenuItem>
  {availableProducts.map((prod) => (
    <MenuItem key={prod._id} value={prod._id}>
      {prod.name}
    </MenuItem>
  ))}
</TextField>

                    ) : (
                      <span className={styles.productName}>
                        {product.productName}
                      </span>
                    )}
                  </td>

                  <td className={styles.tableCell} style={{ textAlign: "right" }}>
                    {isEditing && editingProduct?._id === product._id ? (
                <TextField
                type="number"
                value={editingProduct.quantity}
                onChange={(e) =>
                  handleProductChange(
                    "quantity",
                    parseInt(e.target.value) || 1,
                    "edit"
                  )
                }
                size="small"
                sx={{
                  width: "80px",
                  maxWidth: "80px",
              
                  // 🔹 INPUT (text) rangi
                  "& .MuiInputBase-input": {
                    color: "var(--text)",
                    padding: "6px 8px",
                  },
              
                  // 🔹 Default & hover border rangi
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--secondary-dark)",
                  },
              
                  // 🔹 Fokus bo‘lganda border rang — ko‘kka o‘tmasin
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--primary)",
                    borderWidth: "2px",
                  },
              
                  // 🔹 Fokus (aktiv) holatda ichki text rangi
                  "& .MuiOutlinedInput-root.Mui-focused": {
                    color: "var(--primary)",
                  },
              
                  // 🔹 Disabled (bloklangan paytida)
                  "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
                    borderColor: "var(--border)",
                    opacity: 0.6,
                  },
                  "& .MuiInputBase-input.Mui-disabled": {
                    color: "var(--text-light)",
                  },
                }}
                inputProps={{ min: 1 }}
                disabled={isSaving || isCanceling}
              />
              
                    ) : (
                      <span className={styles.productQuantity}>
                        {product.quantity}
                      </span>
                    )}
                  </td>

                  <td className={styles.tableCell} style={{ textAlign: "right" }}>
                    <span className={styles.productUnit}>{product.unit}</span>
                  </td>

                  {/* 🔧 Harakatlar ustuni (faqat tahrirlash rejimida) */}
                  {isEditing && (
                    <td className={styles.tableCell}>
                      <div className={styles.productActions}>
                        {editingProduct?._id === product._id ? (
                          <>
                            <Button
                              size="small"
                              onClick={handleUpdateProduct}
                              className={styles.saveBtn}
                              disabled={!editingProduct.productId || isSaving || isCanceling}
                            >
                              {isSaving ? <CircularProgress size={16} /> : <MdSave />}
                            </Button>
                            <Button
                              size="small"
                              onClick={() => setEditingProduct(null)}
                              className={styles.cancelBtn}
                              disabled={isSaving || isCanceling}
                            >
                              <MdClose />
                            </Button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditProduct(product)}
                              className={styles.editIcon}
                              title="Tahrirlash"
                              disabled={isSaving || isCanceling}
                            >
                              <MdEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className={styles.deleteIcon}
                              title="O'chirish"
                              disabled={isSaving || isCanceling}
                            >
                              <MdDelete />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}

              {/* ➕ Yangi mahsulot qo'shish qatori */}
              {isEditing && newProduct && (
                <tr className={styles.newProductRow}>
                  <td className={styles.tableCell}>
                    <TextField
                      select
                      value={newProduct.productId}
                      onChange={(e) =>
                        handleProductChange("productId", e.target.value, "new")
                      }
                      size="small"
                      sx={{
                        width: "100%",
                        maxWidth: "120px",
                        minWidth: "80px",
                    
                        // 🔹 Select text rangi
                        "& .MuiSelect-select": {
                          color: "var(--text)",
                        },
                    
                        // 🔹 Default & hover border
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "var(--border)",
                          borderRadius: "var(--radius)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "var(--secondary-dark)",
                        },
                    
                        // 🔹 Fokus bo‘lganda border
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "var(--primary)",
                          borderWidth: "2px",
                        },
                    
                        // 🔹 Fokus bo‘lganda label rangi
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "var(--primary)",
                        },
                    
                        // 🔹 Disabled style
                        "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
                          borderColor: "var(--border)",
                          opacity: 0.6,
                        },
                        "& .MuiSelect-select.Mui-disabled": {
                          color: "var(--text-light)",
                        },
                      }}
                      disabled={isSaving || isCanceling}
                    >
                      <MenuItem value="">Tanlang</MenuItem>
                      {availableProducts.map((prod) => (
                        <MenuItem key={prod._id} value={prod._id}>
                          {prod.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </td>

                  <td className={styles.tableCell} style={{ textAlign: "right" }}>
                    <TextField
                      type="number"
                      value={newProduct.quantity}
                      onChange={(e) =>
                        handleProductChange("quantity", parseInt(e.target.value) || 1, "new")
                      }
                      size="small"
                      sx={{
                        width: "80px",
                        maxWidth: "80px",
                    
                        // 🔹 INPUT (text) rangi
                        "& .MuiInputBase-input": {
                          color: "var(--text)",
                          padding: "6px 8px",
                        },
                    
                        // 🔹 Default & hover border rangi
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "var(--border)",
                          borderRadius: "var(--radius)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "var(--secondary-dark)",
                        },
                    
                        // 🔹 Fokus bo‘lganda border rang — ko‘kka o‘tmasin
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "var(--primary)",
                          borderWidth: "2px",
                        },
                    
                        // 🔹 Fokus (aktiv) holatda ichki text rangi
                        "& .MuiOutlinedInput-root.Mui-focused": {
                          color: "var(--primary)",
                        },
                    
                        // 🔹 Disabled (bloklangan paytida)
                        "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
                          borderColor: "var(--border)",
                          opacity: 0.6,
                        },
                        "& .MuiInputBase-input.Mui-disabled": {
                          color: "var(--text-light)",
                        },
                      }}
                      inputProps={{ min: 1 }}
                      disabled={isSaving || isCanceling}
                    />
                  </td>

                  <td className={styles.tableCell} style={{ textAlign: "right" }}>
                    <span>{newProduct.unit || "-"}</span>
                  </td>

                  <td className={styles.tableCell}>
                    <div className={styles.productActions}>
                      <Button
                        size="small"
                        onClick={handleSaveNewProduct}
                        className={styles.saveBtn}
                        disabled={!newProduct.productId || isSaving || isCanceling}
                      >
                        {isSaving ? <CircularProgress size={16} /> : <MdSave />}
                      </Button>
                      <Button
                        size="small"
                        onClick={() => setNewProduct(null)}
                        className={styles.cancelBtn}
                        disabled={isSaving || isCanceling}
                      >
                        <MdClose />
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ➕ Yangi mahsulot qo'shish tugmasi */}
          {isEditing && !newProduct && (
            <div className={styles.addProductSection}>
              <Button
                variant="outlined"
                onClick={handleAddProduct}
                fullWidth
                startIcon={<MdAdd />}
                className={styles.addProductButton}
                disabled={isSaving || isCanceling}
              >
                {getButtonText("add")}
              </Button>
            </div>
          )}
        </div>

        {/* 📊 Pastki qism */}
        <div className={styles.orderFooter}>
          <p className={styles.totalItems}>
            Jami {getTotalItems(localProducts)} ta mahsulot
          </p>
     
        </div>
      </div>
    </div>
  );
};

export default OrderCard;