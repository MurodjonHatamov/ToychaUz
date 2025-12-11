import React, { useState, useEffect } from 'react';
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  CircularProgress
} from '@mui/material';
import { TransitionGroup } from 'react-transition-group';
import { 
  MdShoppingCart, 
  MdLocalShipping, 
  MdInventory,
  MdAdd,
  MdRemove,
  MdDelete
} from 'react-icons/md';
import styles from './Cart.module.css';

function Cart({ 
  cart, 
  products, 
  onRemoveFromCart, 
  onUpdateCartQuantity, 
  onPlaceOrder,
  getUnitText,
  orderLoading
}) {
  // 🎯 INPUT QIYMATLARINI SAQLASH UCHUN STATE
  const [inputValues, setInputValues] = useState({});

  // ✅ CART O'ZGARGANDA INPUT QIYMATLARNI YANGILASH
  useEffect(() => {
    const newInputValues = {};
    cart.forEach(item => {
      newInputValues[item.productId] = item.quantity.toString();
    });
    setInputValues(newInputValues);
  }, [cart]);

  // ✅ MAHSULOT MA'LUMOTLARINI OLISH
  const getCartItemDetails = (productId) => {
    return products.find(p => p._id === productId);
  };

  // ✅ INPUT QIYMATINI O'ZGARTIRISH
  const handleInputChange = (productId, value) => {
    // Input qiymatini saqlaymiz
    setInputValues(prev => ({
      ...prev,
      [productId]: value
    }));

    // Bo'sh qator bo'lsa, hech narsa qilmaymiz
    if (value === "") {
      return;
    }

    // Raqamga o'tkazish
    const numValue = parseInt(value);

    // ❌ Noto'g'ri qiymat (NaN yoki manfiy son)
    if (isNaN(numValue) || numValue < 0) {
      return;
    }

    // ❌ 0 bo'lsa, savatdan o'chirish
    if (numValue === 0) {
      onRemoveFromCart(productId);
      return;
    }

    // ✅ Yangi qiymatni saqlash
    onUpdateCartQuantity(productId, numValue);
  };

  // ✅ INPUT'NI TARK ETGANDA (blur)
  const handleInputBlur = (productId, value) => {
    // Agar input bo'sh bo'lsa yoki noto'g'ri qiymat bo'lsa
    if (value === "" || isNaN(parseInt(value)) || parseInt(value) < 0) {
      // Cart'dagi haqiqiy qiymatga qaytaramiz
      const cartItem = cart.find(item => item.productId === productId);
      if (cartItem) {
        setInputValues(prev => ({
          ...prev,
          [productId]: cartItem.quantity.toString()
        }));
      }
    }
  };

  // ✅ +/- TUGMALARI BOSILGANDA
  const handleButtonQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      onRemoveFromCart(productId);
    } else {
      onUpdateCartQuantity(productId, newQuantity);
    }
  };

  // ✅ MAHSULOTNI SAVATDA KO'RSATISH
  const renderCartItem = ({ item }) => {
    const product = getCartItemDetails(item.productId);
    if (!product) return null;

    // Input qiymatini olish (state'dan yoki cart'dan)
    const inputValue = inputValues[item.productId] !== undefined 
      ? inputValues[item.productId] 
      : item.quantity.toString();

    return (
      <Collapse key={item.productId}>
        <ListItem
          className={styles.cartItem}
          secondaryAction={
            <IconButton
              edge="end"
              aria-label="delete"
              title="O'chirish"
              onClick={() => onRemoveFromCart(item.productId)}
              className={styles.deleteBtn}
            >
              <MdDelete />
            </IconButton>
          }
        >
          <ListItemIcon className={styles.cartItemIcon}>
            <MdInventory />
          </ListItemIcon>
          <ListItemText
            primary={product.name}
            secondary={`${getUnitText(product.unit)}`}
            secondaryTypographyProps={{ style: { color: '#A7BEAE' } }} 
          />

          {/* 🎯 QUANTITY CONTROLS WITH INPUT */}
          <div className={styles.cartQuantityControls}>
            {/* MINUS BUTTON */}
            <IconButton 
              size="small" 
              onClick={() => handleButtonQuantityChange(item.productId, item.quantity - 1)}
              className={styles.cartQuantityBtn}
              disabled={item.quantity <= 1}
              title="Kamaytirish"
            >
              <MdRemove />
            </IconButton>

            {/* INPUT FIELD */}
            <input
              type="number"
              value={inputValue}
              onChange={(e) => handleInputChange(item.productId, e.target.value)}
              onBlur={(e) => handleInputBlur(item.productId, e.target.value)}
              className={styles.quantityInput}
              min="0"
            />

            {/* PLUS BUTTON */}
            <IconButton 
              size="small" 
              onClick={() => handleButtonQuantityChange(item.productId, item.quantity + 1)}
              className={styles.cartQuantityBtn}
              title="Oshirish"
            >
              <MdAdd />
            </IconButton>
          </div>
        </ListItem>
      </Collapse>
    );
  };

  return (
    <div className={styles.cartSection}>
      <div className={styles.cartCard}>
        <h2 className={styles.cartTitle}>
          <MdShoppingCart />
          Savat
        </h2>
        
        {cart.length === 0 ? (
          <div className={styles.emptyCart}>
            <MdShoppingCart size={32} />
            <p>Savat boʻsh</p>
          </div>
        ) : (
          <>
            <List className={styles.cartItems}>
              <TransitionGroup>
                {cart.map((item) => renderCartItem({ item }))}
              </TransitionGroup>
            </List>

            <div className={styles.cartSummary}>
              <div className={styles.summaryRow}>
                <span>Mahsulotlar:</span>
                <span>{cart.length} ta</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Jami miqdor:</span>
                <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
            </div>

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={orderLoading ? <CircularProgress size={20} style={{ color: 'white' }} /> : <MdLocalShipping />}
              onClick={onPlaceOrder}
              disabled={orderLoading || cart.length === 0}
              className={styles.orderButton}
            >
              {orderLoading ? 'Joʻnatilmoqda...' : 'Buyurtma berish'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;