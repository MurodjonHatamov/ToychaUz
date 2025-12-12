import React, { useState, useEffect } from 'react';
import styles from './EditOrderModal.module.css';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaSave, FaTimes } from "react-icons/fa";
import { MdDelete, MdEdit } from 'react-icons/md';
import { baseURL } from '../../pages/config';
import { logaut } from '../../pages/logaut';

function EditOrderModal({
  setOrderDialogOpen, 
  selectedOrder, 
  loading, 
  getMarketName, 
  getStatusColor, 
  getStatusText, 
  formatDateTime, 
  getProductName, 
  acceptOrder, 
  rejectOrder, 
  deliverOrder,
  fetchOrders,
  products,
  setSnackbar
}) {
  // Edit mode uchun state
  const [isEditing, setIsEditing] = useState(false);
  const [editedProducts, setEditedProducts] = useState([]);
  const [editLoading, setEditLoading] = useState(false);


  // Mahsulot o'lchov birliklari
  const unitOptions = [
    { value: 'piece', label: 'Dona' },
    { value: 'liter', label: 'Litr' },
    { value: 'kg', label: 'Kilogram' },
    { value: 'm', label: 'Metr' }
  ];

  // Modal ochilganda ma'lumotlarni yuklash
  useEffect(() => {
    if (selectedOrder && selectedOrder.products) {
      setEditedProducts([...selectedOrder.products]);
    }
  }, [selectedOrder]);

  // Mahsulot birligini olish
  const getProductUnit = (productId) => {
    const product = products.find(p => p._id === productId);
    if (!product || !product.unit) return '';
    const unit = unitOptions.find(u => u.value === product.unit);
    return unit ? unit.label : '';
  };

  // Orderni o'chirish funksiyasi
  const deletOrder = async(id) => {
    const confirmDelete = window.confirm("Haqiqatan ham bu buyurtmani o'chirmoqchimisiz?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${baseURL}/deliver/order/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'accept': '*/*' },
        credentials: 'include'
      });

      logaut(response);

      if (response.ok) {
        setSnackbar({ open: true, message: "Buyurtma o'chirildi", severity: "success" });
        fetchOrders();
        setOrderDialogOpen(false);
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      setSnackbar({ open: true, message: `O'chirib bo'lmadi: ${error.message}`, severity: "error" });
    }
  };

  // Orderni tahrirlash funksiyasi
  const editOrder = async() => {
    if (selectedOrder.status !== "new") {
      setSnackbar({ open: true, message: "Faqat 'Yangi' holatdagi buyurtmani tahrirlash mumkin", severity: "warning" });
      return;
    }

    const validProducts = editedProducts.filter(product => product.productId && product.quantity > 0);
    if (validProducts.length === 0) {
      setSnackbar({ open: true, message: "Kamida bitta mahsulot bo'lishi kerak", severity: "warning" });
      return;
    }

    try {
      setEditLoading(true);
      
      const requestData = {
        products: validProducts.map(product => ({
          productId: product.productId,
          quantity: product.quantity
        }))
      };

      const response = await fetch(`${baseURL}/deliver/order/${selectedOrder._id}`, {
        method: 'PATCH',
        headers: { 'accept': '*/*', 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestData)
      });

      logaut(response);

      if (response.ok) {
        setSnackbar({ open: true, message: "Buyurtma yangilandi", severity: "success" });
        setIsEditing(false);
        fetchOrders();
        setOrderDialogOpen(false);
      } else {
        throw new Error(`Server xatosi: ${response.status}`);
      }
    } catch (error) {
      setSnackbar({ open: true, message: `Yangilab bo'lmadi: ${error.message}`, severity: "error" });
      setOrderDialogOpen(false)
    } finally {
      setEditLoading(false);
      setOrderDialogOpen(false);
    }
  };

  // Mahsulot miqdorini o'zgartirish
  const handleQuantityChange = (index, value) => {
    const newValue = parseInt(value);
    if (isNaN(newValue) || newValue < 0) return;

    const newProducts = [...editedProducts];
    newProducts[index] = { ...newProducts[index], quantity: newValue };
    setEditedProducts(newProducts);
  };

  // Mahsulotni ro'yxatdan o'chirish
  const handleRemoveProduct = (index) => {
    const newProducts = editedProducts.filter((_, i) => i !== index);
    setEditedProducts(newProducts);
  };

  // Yangi mahsulot qo'shish
  const handleAddProduct = () => {
    if (products.length > 0) {
      const newProduct = {
        productId: products[0]._id,
        quantity: 1,
        _id: `temp_${Date.now()}`
      };
      setEditedProducts([...editedProducts, newProduct]);
    }
  };

  // Mahsulot tanlash
  const handleProductSelect = (index, productId) => {
    const newProducts = [...editedProducts];
    newProducts[index] = { ...newProducts[index], productId: productId };
    setEditedProducts(newProducts);
  };

  // Edit mode dan chiqish
  const cancelEdit = () => {
    setIsEditing(false);
    if (selectedOrder && selectedOrder.products) {
      setEditedProducts([...selectedOrder.products]);
    }
  };

  return (
    <div className={styles.dialogOverlay} onClick={() => !isEditing && setOrderDialogOpen(false)}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dialogHeader}>
          <h2>{isEditing ? "Buyurtmani Tahrirlash" : "Buyurtma Tafsilotlari"}</h2>
          <button className={styles.closeBtn} onClick={() => setOrderDialogOpen(false)} disabled={editLoading}>
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
              {/* Umumiy ma'lumotlar */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Umumiy ma'lumotlar</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <label>Market:</label>
                    <div className={styles.detailValue}>{getMarketName(selectedOrder.marketId)}</div>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Holati:</label>
                    <div className={styles.statusBadgeLarge} style={{backgroundColor: getStatusColor(selectedOrder.status)}}>
                      {getStatusText(selectedOrder.status)}
                    </div>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Sana va Vaqt:</label>
                    <div className={styles.detailValue}>{formatDateTime(selectedOrder.createdAt)}</div>
                  </div>
                </div>
              </div>

              {/* Mahsulotlar */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>
                    Mahsulotlar ({editedProducts.length})
                    {isEditing && selectedOrder.status === "new" && (
                      <button type="button" className={styles.addProductBtn} onClick={handleAddProduct} disabled={products.length === 0}>
                        + Qo'shish
                      </button>
                    )}
                  </h3>
                </div>
                
                {isEditing && selectedOrder.status === "new" ? (
                  // Edit mode
                  <div className={styles.productsEditTable}>
                    {editedProducts.map((product, index) => (
                      <div key={product._id || index} className={styles.productEditRow}>
                        <select
                          className={styles.productSelect}
                          value={product.productId}
                          onChange={(e) => handleProductSelect(index, e.target.value)}
                          disabled={editLoading}
                        >
                          <option value="">Mahsulot tanlang</option>
                          {products.map(prod => (
                            <option key={prod._id} value={prod._id}>
                              {prod.name} ({getProductUnit(prod._id)})
                            </option>
                          ))}
                        </select>

                        <div className={styles.quantityControl}>
                          <input
                            type="number"
                            min="1"
                            value={product.quantity}
                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                            className={styles.quantityInput}
                            disabled={editLoading || !product.productId}
                          />
                          <span className={styles.unitLabel}>{product.productId ? getProductUnit(product.productId) : ""}</span>
                        </div>

                        {editedProducts.length > 1 && (
                          <button type="button" className={styles.removeBtn} onClick={() => handleRemoveProduct(index)} disabled={editLoading}>
                            <FaTimes />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  // View mode
                  <div className={styles.productsTable}>
                    {selectedOrder.products?.map((product, index) => (
                      <div key={index} className={styles.productRowDetail}>
                        <div className={styles.productName}>{getProductName(product.productId)}</div>
                        <div className={styles.productQuantity}>{product.quantity} {getProductUnit(product.productId)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action tugmalari */}
        <div className={styles.dialogActions}>
          {isEditing ? (
            // Edit mode
            <>
              <button className={styles.cancelBtn} onClick={cancelEdit} disabled={editLoading}>
                <FaTimes className={styles.actionIcon} /> Bekor qilish
              </button>
              <button className={styles.saveBtn} onClick={editOrder} disabled={editLoading}>
                {editLoading ? <FaSpinner className={styles.spinner} /> : <FaSave className={styles.actionIcon} />}
                {editLoading ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </>
          ) : (
            // View mode
            <>
            
                <button onClick={() => deletOrder(selectedOrder._id)} className={styles.deleteBtn} disabled={loading.details}>
                  <MdDelete className={styles.actionIcon} /> O'chirish
                </button>
             

              {selectedOrder.status === "new" && (
                <button onClick={() => setIsEditing(true)} className={styles.editBtn} disabled={loading.details}>
                  <MdEdit className={styles.actionIcon} /> Tahrirlash
                </button>
              )}

              {selectedOrder.status === "new" && (
                <>
                  <button className={styles.acceptBtn} onClick={() => acceptOrder(selectedOrder._id)} disabled={loading.details}>
                    <FaCheckCircle className={styles.actionIcon} /> Qabul qilish
                  </button>
                  <button className={styles.rejectBtn} onClick={() => rejectOrder(selectedOrder._id)} disabled={loading.details}>
                    <FaTimesCircle className={styles.actionIcon} /> Bekor qilish
                  </button>
                </>
              )}

              {selectedOrder.status === "accepted" && (
                <button className={styles.deliverBtn} onClick={() => deliverOrder(selectedOrder._id)} disabled={loading.details}>
                  <FaCheckCircle className={styles.actionIcon} /> Yetkazish
                </button>
              )}

             
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditOrderModal;