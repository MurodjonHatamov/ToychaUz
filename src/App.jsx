import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Dashboard from './pages/dashboard/Dashboard'
import Sidebar from './components/sidebar/Sidebar'
import MobileBottomNav from './components/mobileBottomNav/MobileBottomNav'
import TopNavbar from './components/topNavbar/TopNavbar'
import { useState } from 'react'
import MyOrders from './pages/myOrders/MyOrders'
import Help from './pages/help/Help'

function App() {
const [openSidebar,setOpenSidebar]=useState(true)
  
  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar openSidebar={openSidebar}/>
        <div className="main-content">
          <div className="top-navbar-container">
            <TopNavbar openSidebar={openSidebar} setOpenSidebar={setOpenSidebar}/>
          </div>
          <div className="content">
            <Routes>
              <Route path="/" element={<Dashboard/>} />
              <Route path="/help" element={<Help/>} />
              <Route path="/myorders" element={<MyOrders/>} />
            </Routes>
          </div>
          <MobileBottomNav/>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App