import React, { useEffect, useState } from 'react';
import { Button, IconButton } from '@mui/material';
import { MdShoppingCart, MdAdd, MdRemove } from 'react-icons/md';
import styles from './ProductCard.module.css';
import { logaut } from '../../pages/logaut';
import { baseURL } from '../../pages/config';

function ProductCard({ product, onAddToCart, getUnitText,isInCart }) {
  console.log(product);
  const unitOptions = [
    { value: 'piece', label: 'Dona' },
    { value: 'liter', label: 'Litr' },
    { value: 'kg', label: 'Kilogram'},
    { value: 'm', label: 'Metr'}
  ];

  
  const [quantity, setQuantity] = useState("0");
  const [limitProducts, setLimitProducts] = useState([]);

  const getLimitProduct = async () => {
    try {
      const response = await fetch(`${baseURL}/product-limit/own`, {
        method: 'GET',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
  
      logaut(response);
  
      if (!response.ok) {
        throw new Error(`Server xatosi: ${response.status}`);
      }
  
      const data = await response.json();
      setLimitProducts(data)
      console.log(data);
      
    } catch (error) {
      console.error(error);
      showSnackbar(error.message, 'error');
    }
  };
  
  useEffect(() => {
    getLimitProduct();
  }, []);
  

  const productLimit = limitProducts.find(
    (item) => item.productId === product?._id
  );
  
  // quantity — string bo'ladi

  const handleAddToCart = () => {
    const num = Number(quantity);

    if (num > 0) {
      onAddToCart(product._id, num);
    }
  };

  return (
    <div className={isInCart ?styles.isInCart :styles.productCard}>
{isInCart && <div className={styles.inCartBadge}>Savatda</div>}


{productLimit && (
  <div className={styles.limit}>
    <p>
      {productLimit.days} kunlik limit: {productLimit.amount}{" "}
      {unitOptions.find(item => item.value === product?.unit)?.label}.
    </p>
  </div>
)}




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
