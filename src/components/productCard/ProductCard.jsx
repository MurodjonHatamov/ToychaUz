import React, { useState } from 'react';
import { Button, IconButton } from '@mui/material';
import { MdShoppingCart, MdAdd, MdRemove } from 'react-icons/md';
import styles from './ProductCard.module.css';

function ProductCard({ product, onAddToCart, getUnitText }) {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    onAddToCart(product._id, quantity);
    setQuantity(1);
  };

  return (
    <div className={styles.productCard}>

      <div className={styles.productInfo}>
        <h3>{product.name}</h3>
        <p>Oʻlchov birligi: {getUnitText(product.unit)}</p>
      </div>
      
      <div className={styles.quantitySection}>
        <div className={styles.quantityRow}>
          <div className={styles.quantityControls}>
            <IconButton 
              size="small" 
              onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              className={styles.quantityBtn}
            >
              <MdRemove />
            </IconButton>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className={styles.quantityInput}
            />
            <IconButton 
              size="small" 
              onClick={() => setQuantity(prev => prev + 1)}
              className={styles.quantityBtn}
            >
              <MdAdd />
            </IconButton>
          </div>
          
          <Button
            variant="contained"
            startIcon={<MdShoppingCart />}
            onClick={handleAddToCart}
            className={styles.addButton}
          >
            Qo'shish
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;