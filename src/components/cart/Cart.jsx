import React from 'react';
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse
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
  getUnitText 
}) {
  const getCartItemDetails = (productId) => {
    return products.find(p => p._id === productId);
  };

  const renderCartItem = ({ item }) => {
    const product = getCartItemDetails(item.productId);
    if (!product) return null;

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
  secondary={`${getUnitText(product.unit)} • ${item.quantity} ta`}

  secondaryTypographyProps={{ style: { color: '#A7BEAE' } }} 
/>

          <div className={styles.cartQuantityControls}>
            <IconButton 
              size="small" 
              onClick={() => onUpdateCartQuantity(item.productId, item.quantity - 1)}
              className={styles.cartQuantityBtn}
            >
              <MdRemove />
            </IconButton>
            <span className={styles.quantityText}>{item.quantity}</span>
            <IconButton 
              size="small" 
              onClick={() => onUpdateCartQuantity(item.productId, item.quantity + 1)}
              className={styles.cartQuantityBtn}
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
              startIcon={<MdLocalShipping />}
              onClick={onPlaceOrder}
              className={styles.orderButton}
            >
              Buyurtma berish
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;