import React, { useState } from 'react';
import { Button, IconButton } from '@mui/material';
import { MdShoppingCart, MdAdd, MdRemove } from 'react-icons/md';
import styles from './ProductCard.module.css';

function ProductCard({ product, onAddToCart, getUnitText,isInCart }) {

 
  
  // quantity — string bo'ladi
  const [quantity, setQuantity] = useState("0");

  const handleAddToCart = () => {
    const num = Number(quantity);

    if (num > 0) {
      onAddToCart(product._id, num);
    }
  };

  return (
    <div className={isInCart ?styles.isInCart :styles.productCard}>
{isInCart && <div className={styles.inCartBadge}>Savatda</div>}

      <div className={styles.productInfo}>
        <h3>{product.name}</h3>
        <p>Oʻlchov birligi: {getUnitText(product.unit)}</p>
      </div>

      <div className={styles.quantitySection}>
        <div className={styles.quantityRow}>

          <div className={styles.quantityControls}>

            {/* MINUS BUTTON */}
            <IconButton
              size="small"
              onClick={() => {
                const num = Number(quantity);
                const newVal = Math.max(0, num - 1);
                setQuantity(String(newVal));
              }}
              className={styles.quantityBtn}
            >
              <MdRemove />
            </IconButton>

            {/* INPUT */}
            <input
              type="number"
              min="0"
              value={quantity}
              disabled={isInCart}
              onChange={(e) => {
                const val = e.target.value;

                // Bo‘sh bo‘lsa bo‘sh qoldiramiz
                if (val === "") {
                  setQuantity("");
                  return;
                }

                // Raqam bo‘lsa va 0 dan kichik bo‘lmasa
                const num = parseInt(val);
                if (!isNaN(num) && num >= 0) {
                  setQuantity(String(num));
                }
              }}
              className={styles.quantityInput}
            />

            {/* PLUS BUTTON */}
            <IconButton
              size="small"
              onClick={() => {
                const num = Number(quantity) || 0;
                setQuantity(String(num + 1));
              }}
              className={styles.quantityBtn}
            >
              <MdAdd />
            </IconButton>

          </div>

          {/* ADD TO CART BUTTON */}
          <Button
            variant="contained"
            startIcon={<MdShoppingCart />}
            onClick={handleAddToCart}
            className={styles.addButton}
            disabled={quantity === "" || Number(quantity) === 0 || isInCart}
          >
            Qo'shish
          </Button>

        </div>
      </div>

    </div>
  );
}

export default ProductCard;
