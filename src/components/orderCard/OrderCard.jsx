// components/orderCard/OrderCard.js
import React, { useState, useEffect } from 'react';
import { Button, TextField, MenuItem } from '@mui/material';
import styles from './OrderCard.module.css';
import { 
  MdAccessTime, 
  MdCancel, 
  MdCheckCircle, 
  MdEdit, 
  MdDelete, 
  MdAdd,
  MdSave,
  MdClose
} from 'react-icons/md';

const OrderCard = ({ 
  order, 
  mockProducts,
  onUpdateProduct,
  onDeleteProduct,
  onAddProduct,
  onCancelOrder 
}) => {
  // 🎯 State lar
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // 📱 Mobile aniqlash
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // 📱 Mobile uchun button textlari
  const getButtonText = (type) => {
    if (isMobile) {
      const texts = {
        edit: 'Tahrir',
        save: 'Saqlash',
        cancel: 'Bekor',
        add: 'Qo\'shish',
        ready: 'Tayyor'
      };
      return texts[type] || type;
    }
    
    return {
      edit: 'Tahrirlash',
      save: 'Saqlash', 
      cancel: 'Bekor Qilish',
      add: 'Yangi mahsulot qo\'shish',
      ready: 'Tayyor'
    }[type];
  };

  // 🎯 Status konfiguratsiyasi
  const getStatusConfig = (status) => {
    const configs = {
      new: { 
        icon: <MdAccessTime />, 
        text: 'Yangi', 
        bgColor: 'statusNew'
      },
      delivered: { 
        icon: <MdCheckCircle />, 
        text: 'Yetkazilgan', 
        bgColor: 'statusDelivered'
      },
      cancelled: { 
        icon: <MdCancel />, 
        text: "Ko'rib chiqilgan", 
        bgColor: 'statusCancelled'
      }
    };
    return configs[status] || configs.new;
  };

  // 🎯 Sana formati
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 🎯 Jami mahsulotlar soni
  const getTotalItems = (products) => {
    return products.reduce((total, product) => total + product.quantity, 0);
  };

  // 🎯 Tahrirlashni boshlash
  const handleStartEdit = () => {
    setIsEditing(true);
  };

  // 🎯 Tahrirlashni yakunlash
  const handleFinishEdit = () => {
    setIsEditing(false);
    setEditingProduct(null);
    setNewProduct(null);
  };

  // 🎯 Mahsulotni tahrirlashni boshlash
  const handleEditProduct = (product) => {
    setEditingProduct({ ...product });
    setNewProduct(null);
  };

  // 🎯 Mahsulotni yangilash
  const handleUpdateProduct = () => {
    if (editingProduct) {
      onUpdateProduct(order._id, editingProduct);
      setEditingProduct(null);
    }
  };

  // 🎯 Mahsulotni o'chirish
  const handleDeleteProduct = (productId) => {
    onDeleteProduct(order._id, productId);
  };

  // 🎯 Yangi mahsulot qo'shish
  const handleAddProduct = () => {
    const product = {
      _id: Date.now().toString(),
      productId: "",
      quantity: 1,
      productName: "",
      unit: ""
    };
    setNewProduct(product);
    setEditingProduct(null);
  };

  // 🎯 Yangi mahsulotni saqlash
  const handleSaveNewProduct = () => {
    if (newProduct && newProduct.productId) {
      const selectedProduct = mockProducts.find(p => p._id === newProduct.productId);
      const productToSave = {
        ...newProduct,
        productName: selectedProduct.name,
        unit: selectedProduct.unit
      };
      onAddProduct(order._id, productToSave);
      setNewProduct(null);
    }
  };

  // 🎯 Mahsulot o'zgarishi
  const handleProductChange = (field, value, product) => {
    if (field === 'productId') {
      const selectedProduct = mockProducts.find(p => p._id === value);
      if (product === 'new') {
        setNewProduct({
          ...newProduct,
          productId: value,
          productName: selectedProduct?.name || "",
          unit: selectedProduct?.unit || ""
        });
      } else {
        setEditingProduct({
          ...editingProduct,
          productId: value,
          productName: selectedProduct?.name || "",
          unit: selectedProduct?.unit || ""
        });
      }
    } else {
      if (product === 'new') {
        setNewProduct({
          ...newProduct,
          [field]: value
        });
      } else {
        setEditingProduct({
          ...editingProduct,
          [field]: value
        });
      }
    }
  };

  // 🎯 Buyurtmani bekor qilish
  const handleCancelOrder = () => {
    if (window.confirm("Haqiqatan ham bu buyurtmani bekor qilmoqchimisiz?")) {
      onCancelOrder(order._id);
    }
  };

  // 📱 Mobile uchun TextField sozlamalari - MUHIM: Kenglik chegaralari
  const getTextFieldProps = () => ({
    size: "small",
    ...(isMobile && {
      sx: {
        '& .MuiInputBase-root': {
          fontSize: '0.75rem',
          padding: '4px',
          maxWidth: '100px'
        }
      }
    })
  });

  // 📱 Mobile uchun Select sozlamalari - MUHIM: Menyu chegaralari
  const getSelectProps = () => ({
    ...(isMobile && {
      MenuProps: {
        PaperProps: {
          sx: {
            maxHeight: 200,
            maxWidth: '280px'
          }
        }
      }
    })
  });

  const statusConfig = getStatusConfig(order.status);

  return (
    <div className={`${styles.orderCard} ${isEditing ? styles.editingMode : ''}`}>
      <div className={styles.cardContent}>
        {/* 📝 Sarlavha qismi */}
        <div className={styles.orderHeader}>
          <div className={styles.orderInfo}>
            <h3 className={styles.orderNumber}>
              Buyurtma #{order._id.slice(-6).toUpperCase()}
            </h3>
            <p className={styles.orderDate}>
              {formatDate(order.createdAt)}
            </p>
          </div>
          <div className={styles.orderActions}>
            <div className={`${styles.statusChip} ${styles[statusConfig.bgColor]}`}>
              {statusConfig.icon}
              <span>{statusConfig.text}</span>
            </div>
            
            {/* 🔧 Tahrirlash tugmalari */}
            {order.status === 'new' && (
              <div className={styles.editActions}>
                {!isEditing ? (
                  <Button 
                    variant="outlined" 
                    size="small"
                    startIcon={<MdEdit />}
                    onClick={handleStartEdit}
                    className={styles.editButton}
                  >
                    {getButtonText('edit')}
                  </Button>
                ) : (
                  <Button 
                    variant="contained" 
                    size="small"
                    startIcon={<MdSave />}
                    onClick={handleFinishEdit}
                    className={styles.saveButton}
                  >
                    {getButtonText('ready')}
                  </Button>
                )}
                
                {isEditing && (
                  <Button 
                    variant="outlined" 
                    size="small"
                    startIcon={<MdDelete />}
                    onClick={handleCancelOrder}
                    className={styles.cancelOrderButton}
                  >
                    {getButtonText('cancel')}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 📊 Mahsulotlar jadvali - MUHIM: Kenglik chegaralari */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeader}>Mahsulot</th>
                <th className={styles.tableHeader} style={{textAlign: 'right'}}>Miqdor</th>
                <th className={styles.tableHeader} style={{textAlign: 'right'}}>Birlik</th>
                {isEditing && <th className={styles.tableHeader}>Harakatlar</th>}
              </tr>
            </thead>
            <tbody>
              {/* 📋 Mavjud mahsulotlar */}
              {order.products.map((product) => (
                <tr key={product._id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    {isEditing && editingProduct?._id === product._id ? (
                      <TextField
                        className={styles.productSelect}
                        select
                        value={editingProduct.productId}
                        onChange={(e) => handleProductChange('productId', e.target.value, 'edit')}
                        size="small"
                        // MUHIM: fullWidth o'rniga aniq kenglik
                        sx={{ 
                          width: '100%',
                          maxWidth: '120px',
                          minWidth: '80px',
                          '& .MuiInputBase-root': {
                            fontSize: '0.8rem',
                            maxWidth: '100%'
                          }
                        }}
                        SelectProps={{
                          sx: {
                            color: 'var(--text)', 
                            fontSize: '0.8rem',
                            maxWidth: '100%'
                          },
                        }}
                      >
                        <MenuItem value="">Tanlang</MenuItem>
                        {mockProducts.map((prod) => (
                          <MenuItem 
                            key={prod._id} 
                            value={prod._id}
                            sx={{
                              fontSize: '0.8rem',
                              maxWidth: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
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
                  
                  <td className={styles.tableCell} style={{textAlign: 'right'}}>
                    {isEditing && editingProduct?._id === product._id ? (
                      <TextField
                        className={styles.quantityInput}
                        type="number"
                        value={editingProduct.quantity}
                        onChange={(e) => handleProductChange('quantity', parseInt(e.target.value) || 1, 'edit')}
                        size="small"
                        // MUHIM: Aniq kenglik berish
                        sx={{ 
                          width: '80px',
                          maxWidth: '80px',
                          '& .MuiInputBase-root': {
                            fontSize: '0.8rem'
                          }
                        }}
                        inputProps={{ 
                          min: 1,
                          style: { 
                            textAlign: 'right',
                            padding: '6px 8px'
                          }
                        }}
                      />
                    ) : (
                      <span className={styles.productQuantity}>
                        {product.quantity}
                      </span>
                    )}
                  </td>
                  
                  <td className={styles.tableCell} style={{textAlign: 'right'}}>
                    <span className={styles.productUnit}>
                      {product.unit}
                    </span>
                  </td>
                  
                  {/* 🔧 Harakatlar ustuni */}
                  {isEditing && (
                    <td className={styles.tableCell}>
                      <div className={styles.productActions}>
                        {editingProduct?._id === product._id ? (
                          <>
                            <Button 
                              size="small" 
                              onClick={handleUpdateProduct}
                              className={styles.saveBtn}
                              disabled={!editingProduct.productId}
                            >
                              <MdSave />
                            </Button>
                            <Button 
                              size="small" 
                              onClick={() => setEditingProduct(null)}
                              className={styles.cancelBtn}
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
                            >
                              <MdEdit />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product._id)}
                              className={styles.deleteIcon}
                              title="O'chirish"
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
                      className={styles.productSelect}
                      select
                      value={newProduct.productId}
                      onChange={(e) => handleProductChange('productId', e.target.value, 'new')}
                      size="small"
                      sx={{ 
                        width: '100%',
                        maxWidth: '120px',
                        minWidth: '80px',
                        '& .MuiInputBase-root': {
                          fontSize: '0.8rem'
                        }
                      }}
                        SelectProps={{
                          sx: {
                            color: 'var(--text)', 
                            fontSize: '0.8rem',
                            maxWidth: '100%',
                            backgroundColor:'var(--background)'
                          },
                        }}
                      
                      placeholder="Mahsulot tanlang"
                    >
                      <MenuItem value="">Tanlang</MenuItem>
                      {mockProducts.map((prod) => (
                        <MenuItem 
                          key={prod._id} 
                          value={prod._id}
                          sx={{ fontSize: '0.8rem' }}
                        >
                          {prod.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </td>
                  
                  <td className={styles.tableCell} style={{textAlign: 'right'}}>
                    <TextField
                      className={styles.quantityInput}
                      type="number"
                      value={newProduct.quantity}
                      onChange={(e) => handleProductChange('quantity', parseInt(e.target.value) || 1, 'new')}
                      size="small"
                      sx={{ 
                        width: '80px',
                        maxWidth: '80px',
                        '& .MuiInputBase-root': {
                          fontSize: '0.8rem'
                        }
                      }}
                      inputProps={{ 
                        min: 1,
                        style: { textAlign: 'right' }
                      }}
                    />
                  </td>
                  
                  <td className={styles.tableCell} style={{textAlign: 'right'}}>
                    <span>{newProduct.unit || "-"}</span>
                  </td>
                  
                  <td className={styles.tableCell}>
                    <div className={styles.productActions}>
                      <Button 
                        size="small" 
                        onClick={handleSaveNewProduct}
                        className={styles.saveBtn}
                        disabled={!newProduct.productId}
                      >
                        <MdSave />
                      </Button>
                      <Button 
                        size="small" 
                        onClick={() => setNewProduct(null)}
                        className={styles.cancelBtn}
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
              >
                {getButtonText('add')}
              </Button>
            </div>
          )}
        </div>

        {/* 📊 Pastki qism */}
        <div className={styles.orderFooter}>
          <p className={styles.totalItems}>
            Jami {getTotalItems(order.products)} ta mahsulot
          </p>
          <div className={`${styles.statusBadge} ${styles[statusConfig.bgColor]}`}>
            {statusConfig.icon}
            <span>{statusConfig.text}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;