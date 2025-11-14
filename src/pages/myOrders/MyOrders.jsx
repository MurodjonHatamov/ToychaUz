import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Grid
} from '@mui/material';
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
      { "productId": "7", "quantity": 3, "_id": "691493cf8a17859b85e95f61" },
      { "productId": "8", "quantity": 2, "_id": "691493cf8a17859b85e95f62" }
    ],
    "status": "cancelled",
    "createdAt": "2025-11-12T14:03:59.805Z",
  }
];

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
        setLoading(true);
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
        }, 800);
      } catch (err) {
        setError('Buyurtmalarni yuklab olishda xatolik');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusConfig = (status) => {
    const configs = {
      new: { 
        icon: <MdAccessTime />, 
        text: 'Yangi', 
        color: 'warning',
        bgColor: 'rgba(255, 152, 0, 0.1)',
        borderColor: 'rgba(255, 152, 0, 0.3)'
      },
      delivered: { 
        icon: <MdCheckCircle />, 
        text: 'Yetkazilgan', 
        color: 'success',
        bgColor: 'rgba(76, 175, 80, 0.1)',
        borderColor: 'rgba(76, 175, 80, 0.3)'
      },
      cancelled: { 
        icon: <MdCancel />, 
        text: 'Bekor qilingan', 
        color: 'error',
        bgColor: 'rgba(244, 67, 54, 0.1)',
        borderColor: 'rgba(244, 67, 54, 0.3)'
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
      <Box className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <CircularProgress className={styles.spinner} />
          <Typography variant="h6" className={styles.loadingText}>
            Buyurtmalar yuklanmoqda...
          </Typography>
        </div>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" className={styles.errorAlert}>
        {error}
      </Alert>
    );
  }

  return (
    <div className={styles.myOrders}>
      <div className={styles.ordersHeader}>
        <Typography variant="h4" className={styles.title}>
          Mening Buyurtmalarim
        </Typography>
        <Typography variant="body1" className={styles.subtitle}>
          Barcha buyurtmalaringiz ro'yxati
        </Typography>
      </div>

      <div className={styles.ordersGrid}>
        {orders.length === 0 ? (
          <Card className={styles.emptyCard}>
            <CardContent className={styles.emptyContent}>
              <MdShoppingCart className={styles.emptyIcon} />
              <Typography variant="h6" className={styles.emptyTitle}>
                Hali buyurtma yo'q
              </Typography>
              <Typography variant="body2" className={styles.emptyDescription}>
                Birinchi buyurtma qilish uchun "Buyurtma Berish" bo'limiga o'ting
              </Typography>
              <Button 
                variant="contained" 
                href="/"
                className={styles.emptyButton}
              >
                Buyurtma Berish
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              return (
                <Grid item xs={12} key={order._id}>
                  <Card className={styles.orderCard}>
                    <CardContent>
                      <div className={styles.orderHeader}>
                        <div className={styles.orderInfo}>
                          <Typography variant="h6" className={styles.orderNumber}>
                            Buyurtma #{order._id.slice(-6).toUpperCase()}
                          </Typography>
                          <Typography variant="body2" className={styles.orderDate}>
                            {formatDate(order.createdAt)}
                          </Typography>
                        </div>
                        <div className={styles.orderActions}>
                          <Chip
                            icon={statusConfig.icon}
                            label={statusConfig.text}
                            className={styles.statusChip}
                            style={{
                              backgroundColor: statusConfig.bgColor,
                              borderColor: statusConfig.borderColor
                            }}
                          />
                          {order.status === 'new' && (
                            <Button 
                              variant="outlined" 
                              size="small"
                              startIcon={<MdEdit />}
                              onClick={() => handleEditOrder(order)}
                              className={styles.editButton}
                            >
                              Tahrirlash
                            </Button>
                          )}
                        </div>
                      </div>

                      <TableContainer className={styles.productsTable}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell className={styles.tableHeader}>Mahsulot</TableCell>
                              <TableCell align="right" className={styles.tableHeader}>Miqdor</TableCell>
                              <TableCell align="right" className={styles.tableHeader}>Birlik</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {order.products.map((product) => (
                              <TableRow key={product._id} className={styles.tableRow}>
                                <TableCell>
                                  <Typography variant="body2" className={styles.productName}>
                                    {product.productName}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" className={styles.productQuantity}>
                                    {product.quantity}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" className={styles.productUnit}>
                                    {product.unit}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <div className={styles.orderFooter}>
                        <Typography variant="body2" className={styles.totalItems}>
                          Jami {getTotalItems(order.products)} ta mahsulot
                        </Typography>
                        <Chip
                          icon={statusConfig.icon}
                          label={statusConfig.text}
                          size="small"
                          className={styles.statusBadge}
                          style={{
                            backgroundColor: statusConfig.bgColor,
                            borderColor: statusConfig.borderColor
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </div>

      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ className: styles.editDialog }}
      >
        <DialogTitle className={styles.dialogTitle}>
          Buyurtmani Tahrirlash
        </DialogTitle>
        <DialogContent className={styles.dialogContent}>
          {currentOrder && (
            <div className={styles.editContainer}>
              <Typography variant="h6" className={styles.editTitle}>
                Mahsulotlar
              </Typography>
              
              {currentOrder.products.map((product) => (
                <div key={product._id} className={styles.editProductItem}>
                  {editingProduct && editingProduct._id === product._id ? (
                    <div className={styles.editForm}>
                      <TextField
                        select
                        label="Mahsulot"
                        value={editingProduct.productId}
                        onChange={(e) => handleProductChange('productId', e.target.value)}
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
                        onChange={(e) => handleProductChange('quantity', parseInt(e.target.value) || 1)}
                        fullWidth
                        size="small"
                        inputProps={{ min: 1 }}
                        className={styles.quantityField}
                      />
                    </div>
                  ) : (
                    <div className={styles.productInfo}>
                      <Typography variant="body1" className={styles.productNameEdit}>
                        {product.productName}
                      </Typography>
                      <Typography variant="body2" className={styles.productDetails}>
                        {product.quantity} {product.unit}
                      </Typography>
                    </div>
                  )}
                  
                  <div className={styles.productActions}>
                    {editingProduct && editingProduct._id === product._id ? (
                      <>
                        <Button 
                          size="small" 
                          onClick={handleUpdateProduct}
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
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditProduct(product)}
                          className={styles.editIcon}
                        >
                          <MdEdit />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteProduct(product._id)}
                          className={styles.deleteIcon}
                        >
                          <MdDelete />
                        </IconButton>
                      </>
                    )}
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outlined" 
                onClick={handleAddProduct}
                fullWidth
                startIcon={<MdAdd />}
                className={styles.addProductButton}
              >
                Yangi mahsulot qo'shish
              </Button>
            </div>
          )}
        </DialogContent>
        <DialogActions className={styles.dialogActions}>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            className={styles.dialogCancel}
          >
            Bekor qilish
          </Button>
          <Button 
            onClick={handleSaveOrder}
            variant="contained"
            className={styles.dialogSave}
          >
            Saqlash
          </Button>
        </DialogActions>
      </Dialog>

      {orders.length > 0 && (
        <div className={styles.statsSection}>
          <Card className={styles.statsCard}>
            <CardContent>
              <Typography variant="h6" className={styles.statsTitle}>
                Buyurtma Statistikasi
              </Typography>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <Typography variant="h4" className={`${styles.statNumber} ${styles.primary}`}>
                    {orders.length}
                  </Typography>
                  <Typography variant="body2" className={styles.statLabel}>
                    Jami Buyurtma
                  </Typography>
                </div>
                <div className={styles.statItem}>
                  <Typography variant="h4" className={`${styles.statNumber} ${styles.success}`}>
                    {orders.filter(o => o.status === 'delivered').length}
                  </Typography>
                  <Typography variant="body2" className={styles.statLabel}>
                    Yetkazilgan
                  </Typography>
                </div>
                <div className={styles.statItem}>
                  <Typography variant="h4" className={`${styles.statNumber} ${styles.warning}`}>
                    {orders.filter(o => o.status === 'new').length}
                  </Typography>
                  <Typography variant="body2" className={styles.statLabel}>
                    Jarayonda
                  </Typography>
                </div>
                <div className={styles.statItem}>
                  <Typography variant="h4" className={`${styles.statNumber} ${styles.error}`}>
                    {orders.filter(o => o.status === 'cancelled').length}
                  </Typography>
                  <Typography variant="body2" className={styles.statLabel}>
                    Bekor qilingan
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default MyOrders;