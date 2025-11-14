// MyOrders.js
import React, { useState, useEffect } from 'react';
import { Button, TextField, MenuItem, CircularProgress, Dialog } from '@mui/material';
import {
  MdShoppingCart,
  MdCheckCircle,
  MdAccessTime,
  MdCancel,
  MdEdit,
  MdDelete,
  MdAdd
} from 'react-icons/md';
import styles from './MyOrders.module.css';

// Mock ma'lumotlar
const mockProducts = [
  { "_id": "1", "name": "Coca-Cola 1,5", "unit": "dona" },
  { "_id": "2", "name": "Sariyog' 500g", "unit": "dona" },
  { "_id": "3", "name": "Olma", "unit": "kg" },
  { "_id": "4", "name": "Sut", "unit": "litr" },
  { "_id": "5", "name": "Tuxum", "unit": "dona" },
  { "_id": "6", "name": "Tvorog 300gr", "unit": "dona" },
  { "_id": "7", "name": "Tovuq go'shti", "unit": "kg" },
  { "_id": "8", "name": "Mayiz", "unit": "kg" },
  { "_id": "9", "name": "Non", "unit": "dona" },
  { "_id": "10", "name": "Choy", "unit": "dona" },
];

const mockOrders = [
  {
    "_id": "69064ad11d2854575b18ffdf",
    "products": [
      { "productId": "1", "quantity": 20, "_id": "69064ad11d2854575b18ffe0" },
      { "productId": "2", "quantity": 25, "_id": "69064ad11d2854575b18ffe1" },
      { "productId": "3", "quantity": 2, "_id": "69064ad11d2854575b18ffe2" }
    ],
    "status": "new",
    "createdAt": "2025-11-01T18:00:49.577Z",
  },
  {
    "_id": "69078be8156fae69f2254ff3",
    "products": [
      { "productId": "4", "quantity": 12, "_id": "69078be8156fae69f2254ff4" },
      { "productId": "5", "quantity": 30, "_id": "69078be8156fae69f2254ff5" }
    ],
    "status": "delivered",
    "createdAt": "2025-11-02T16:50:48.178Z",
  },
  {
    "_id": "691493cf8a17859b85e95f5f",
    "products": [
      { "productId": "6", "quantity": 5, "_id": "691493cf8a17859b85e95f60" },
      { "productId": "7", "quantity": 3, "_id": "691493cf8a17859b85e95f61" }
    ],
    "status": "cancelled",
    "createdAt": "2025-11-12T14:03:59.805Z",
  }
];

// OrderStats komponenti
const OrderStats = ({ orders }) => {
  const stats = {
    total: orders.length,
    delivered: orders.filter(order => order.status === 'delivered').length,
    new: orders.filter(order => order.status === 'new').length,
    cancelled: orders.filter(order => order.status === 'cancelled').length
  };

  return (
    <div className={styles.statsCard}>
      <div className={styles.statsContent}>
        <h2 className={styles.statsTitle}>Buyurtma Statistikasi</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <MdShoppingCart className={styles.statIcon} />
            <div className={`${styles.statNumber} ${styles.statNumberPrimary}`}>
              {stats.total}
            </div>
            <div className={styles.statLabel}>Jami Buyurtma</div>
          </div>
          <div className={styles.statItem}>
            <MdCheckCircle className={styles.statIcon} />
            <div className={`${styles.statNumber} ${styles.statNumberSuccess}`}>
              {stats.delivered}
            </div>
            <div className={styles.statLabel}>Yetkazilgan</div>
          </div>
          <div className={styles.statItem}>
            <MdAccessTime className={styles.statIcon} />
            <div className={`${styles.statNumber} ${styles.statNumberWarning}`}>
              {stats.new}
            </div>
            <div className={styles.statLabel}>Yangi</div>
          </div>
          <div className={styles.statItem}>
            <MdCancel className={styles.statIcon} />
            <div className={`${styles.statNumber} ${styles.statNumberCancelled}`}>
              {stats.cancelled}
            </div>
            <div className={styles.statLabel}>Ko'rib chiqilgan</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// OrderCard komponenti
const OrderCard = ({ order, onEdit }) => {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalItems = (products) => {
    return products.reduce((total, product) => total + product.quantity, 0);
  };

  const statusConfig = getStatusConfig(order.status);

  return (
    <div className={styles.orderCard}>
      <div className={styles.cardContent}>
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
            {order.status === 'new' && (
              <Button 
                variant="outlined" 
                size="small"
                startIcon={<MdEdit />}
                onClick={() => onEdit(order)}
                className={styles.editButton}
              >
                Tahrirlash
              </Button>
            )}
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.tableHeader}>Mahsulot</th>
                <th className={styles.tableHeader} style={{textAlign: 'right'}}>Miqdor</th>
                <th className={styles.tableHeader} style={{textAlign: 'right'}}>Birlik</th>
              </tr>
            </thead>
            <tbody>
              {order.products.map((product) => (
                <tr key={product._id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <span className={styles.productName}>
                      {product.productName}
                    </span>
                  </td>
                  <td className={styles.tableCell} style={{textAlign: 'right'}}>
                    <span className={styles.productQuantity}>
                      {product.quantity}
                    </span>
                  </td>
                  <td className={styles.tableCell} style={{textAlign: 'right'}}>
                    <span className={styles.productUnit}>
                      {product.unit}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

// EditOrderModal komponenti
const EditOrderModal = ({ 
  open, 
  onClose, 
  currentOrder, 
  editingProduct, 
  setEditingProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddProduct,
  onProductChange,
  onSaveOrder,
  mockProducts 
}) => {
  if (!currentOrder) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ className: styles.dialogPaper }}
    >
      <div className={styles.dialogTitle}>
        Buyurtmani Tahrirlash
      </div>
      
      <div className={styles.dialogContent}>
        <div className={styles.editContainer}>
          <h3 className={styles.editTitle}>
            Mahsulotlar
          </h3>
          
          {currentOrder.products.map((product) => (
            <div key={product._id} className={styles.editProductItem}>
              {editingProduct && editingProduct._id === product._id ? (
                <div className={styles.editForm}>
                  <TextField
                    select
                    label="Mahsulot"
                    value={editingProduct.productId}
                    onChange={(e) => onProductChange('productId', e.target.value)}
                    fullWidth
                    size="small"
                    className={styles.selectField}
                  >
                    {mockProducts.map((product) => (
                      <MenuItem key={product._id} value={product._id}>
                        {product.name} ({product.unit})
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    type="number"
                    label="Miqdor"
                    value={editingProduct.quantity}
                    onChange={(e) => onProductChange('quantity', parseInt(e.target.value) || 1)}
                    fullWidth
                    size="small"
                    inputProps={{ min: 1 }}
                    className={styles.quantityField}
                  />
                </div>
              ) : (
                <div className={styles.productInfo}>
                  <div className={styles.productNameEdit}>
                    {product.productName}
                  </div>
                  <div className={styles.productDetails}>
                    {product.quantity} {product.unit}
                  </div>
                </div>
              )}
              
              <div className={styles.productActions}>
                {editingProduct && editingProduct._id === product._id ? (
                  <>
                    <Button 
                      size="small" 
                      onClick={onUpdateProduct}
                      className={styles.saveButton}
                    >
                      Saqlash
                    </Button>
                    <Button 
                      size="small" 
                      onClick={() => setEditingProduct(null)}
                      className={styles.cancelButton}
                    >
                      Bekor
                    </Button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setEditingProduct({ ...product })}
                      className={styles.editIcon}
                    >
                      <MdEdit />
                    </button>
                    <button 
                      onClick={() => onDeleteProduct(product._id)}
                      className={styles.deleteIcon}
                    >
                      <MdDelete />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          
          <Button 
            variant="outlined" 
            onClick={onAddProduct}
            fullWidth
            startIcon={<MdAdd />}
            className={styles.addProductButton}
          >
            Yangi mahsulot qo'shish
          </Button>
        </div>
      </div>
      
      <div className={styles.dialogActions}>
        <Button 
          onClick={onClose}
          className={styles.dialogCancel}
        >
          Bekor qilish
        </Button>
        <Button 
          onClick={onSaveOrder}
          variant="contained"
          className={styles.dialogSave}
        >
          Saqlash
        </Button>
      </div>
    </Dialog>
  );
};

// Asosiy MyOrders komponenti
function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setTimeout(() => {
          const ordersWithProducts = mockOrders.map(order => ({
            ...order,
            products: order.products.map(product => {
              const productInfo = mockProducts.find(p => p._id === product.productId);
              return {
                ...product,
                productName: productInfo?.name || "Noma'lum mahsulot",
                unit: productInfo?.unit || "dona"
              };
            })
          }));
          setOrders(ordersWithProducts);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Buyurtmalarni yuklab olishda xatolik');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleEditOrder = (order) => {
    setCurrentOrder(order);
    setEditDialogOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct({ ...product });
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;

    const updatedOrders = orders.map(order => {
      if (order._id === currentOrder._id) {
        const updatedProducts = order.products.map(product =>
          product._id === editingProduct._id ? editingProduct : product
        );
        return { ...order, products: updatedProducts };
      }
      return order;
    });

    setOrders(updatedOrders);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId) => {
    const updatedOrders = orders.map(order => {
      if (order._id === currentOrder._id) {
        const updatedProducts = order.products.filter(product => product._id !== productId);
        return { ...order, products: updatedProducts };
      }
      return order;
    });

    setOrders(updatedOrders);
  };

  const handleAddProduct = () => {
    const newProduct = {
      _id: Date.now().toString(),
      productId: mockProducts[0]._id,
      quantity: 1,
      productName: mockProducts[0].name,
      unit: mockProducts[0].unit
    };

    const updatedOrders = orders.map(order => {
      if (order._id === currentOrder._id) {
        return { ...order, products: [...order.products, newProduct] };
      }
      return order;
    });

    setOrders(updatedOrders);
  };

  const handleProductChange = (field, value) => {
    if (field === 'productId') {
      const selectedProduct = mockProducts.find(p => p._id === value);
      setEditingProduct({
        ...editingProduct,
        productId: value,
        productName: selectedProduct.name,
        unit: selectedProduct.unit
      });
    } else {
      setEditingProduct({
        ...editingProduct,
        [field]: value
      });
    }
  };

  const handleSaveOrder = () => {
    setEditDialogOpen(false);
    setEditingProduct(null);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <CircularProgress className={styles.spinner} />
        <div className={styles.loadingText}>
          Buyurtmalar yuklanmoqda...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorAlert}>
        {error}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Mening Buyurtmalarim
        </h1>
        <p className={styles.subtitle}>
          Barcha buyurtmalaringiz ro'yxati
        </p>
      </div>

      {/* Statistika - Eng tepada */}
      <OrderStats orders={orders} />

      <div className={styles.content}>
        {orders.length === 0 ? (
          <div className={styles.emptyCard}>
            <div className={styles.emptyContent}>
              <MdShoppingCart className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>
                Hali buyurtma yo'q
              </h3>
              <p className={styles.emptyDescription}>
                Birinchi buyurtma qilish uchun "Buyurtma Berish" bo'limiga o'ting
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.ordersGrid}>
            {orders.map((order) => (
              <OrderCard 
                key={order._id}
                order={order} 
                onEdit={handleEditOrder}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditOrderModal
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        currentOrder={currentOrder}
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onAddProduct={handleAddProduct}
        onProductChange={handleProductChange}
        onSaveOrder={handleSaveOrder}
        mockProducts={mockProducts}
      />
    </div>
  );
}

export default MyOrders;