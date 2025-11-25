import { Button } from '@mui/material'
import React from 'react'
import { MdRefresh } from 'react-icons/md'
import styles from "./Error.module.css"
function Error({error,fetchOrders}) {
  return (
    <div className={styles.container}>
    <div className={styles.error}>
      <h3>Xatolik yuz berdi</h3>
      <p>{error}</p>
      <Button 
        variant="contained" 
        onClick={() => fetchOrders(1, filters.status)}
        startIcon={<MdRefresh />}
        className={styles.retryButton}
      >
        Qayta Urinish
      </Button>
    </div>
  </div>
  )
}

export default Error