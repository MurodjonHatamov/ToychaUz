import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Dashboard from "./pages/dashboard/Dashboard";
import Sidebar from "./components/sidebar/Sidebar";
import MobileBottomNav from "./components/mobileBottomNav/MobileBottomNav";
import TopNavbar from "./components/topNavbar/TopNavbar";
import { useState, useEffect } from "react";
import MyOrders from "./pages/myOrders/MyOrders";
import Help from "./pages/help/Help";
import Login from "./pages/login/Login";
import User from "./pages/user/User";
import DashboardD from "./pages/dashboardD/DashboardD";
import MarketsD from "./pages/marketsD/MarketsD";
import ProductsD from "./pages/productsD/ProductsD";
import ChatD from "./pages/chatD/ChatD";
import Deliver from "./pages/deliver/Deliver";
import ProductLimitD from "./pages/productLimit/ProductLimitD";

// ✅ YANGILANGAN: logout handler
const handleLogout = async () => {
  const userType = localStorage.getItem("userType") || "market";
  
  try {
    const logoutUrl = userType === "market" 
      ?`${baseURL}/auth/market-logout`
      : `${baseURL}/auth/deliver-logout`;
    
    const response = await fetch(logoutUrl, {
      method: "DELETE",
      headers: {
        accept: "*/*",
      },
      credentials: "include",
    });

  
  } catch (error) {
    // Logout API xatosi:
  } finally {
    manualLogout();
  }
};

// ✅ YANGILANGAN: Manual logout
const manualLogout = () => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userType");
  localStorage.removeItem("loginTime");

  window.dispatchEvent(new Event("storage"));
  window.location.href = "/login";
};

// ✅ YANGILANGAN: Login holatini tekshirish
const isLoggedIn = () => {
  const localStorageAuth = localStorage.getItem("isLoggedIn") === "true";
  
  // Session vaqtini tekshirish (24 soat)
  const loginTime = localStorage.getItem("loginTime");
  if (loginTime) {
    const loginDate = new Date(loginTime);
    const now = new Date();
    const diffHours = (now - loginDate) / (1000 * 60 * 60);
    
    if (diffHours > 24) {
   
      manualLogout();
      return false;
    }
  }
  
  return localStorageAuth;
};

// ✅ USER TURINI TEKSHIRISH
const getUserType = () => {
  return localStorage.getItem("userType") || "market";
};

// ✅ YANGILANGAN: Protected Route - verify qilmaymiz, faqat localStorage tekshiramiz
const ProtectedRoute = ({ children }) => {
  const [authStatus, setAuthStatus] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = isLoggedIn();
      setAuthStatus(loggedIn);
    };

    checkAuth();
    
    // Storage o'zgarishlarini kuzatish
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Faqat session vaqtini tekshirish uchun interval
    const sessionCheckInterval = setInterval(() => {
      const loginTime = localStorage.getItem("loginTime");
      if (loginTime) {
        const loginDate = new Date(loginTime);
        const now = new Date();
        const diffHours = (now - loginDate) / (1000 * 60 * 60);
        
        if (diffHours > 24) {
         
          manualLogout();
        }
      }
    }, 60000); // Har 1 daqiqada tekshirish

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(sessionCheckInterval);
    };
  }, []);

  if (authStatus === null) {
    return (
      <div className="loading-container">
        <div>Yuklanmoqda...</div>
      </div>
    );
  }

  return authStatus ? children : <Navigate to="/login" />;
};

// ✅ YANGILANGAN: ROLE-BASED PROTECTED ROUTE
const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [authStatus, setAuthStatus] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = isLoggedIn();
      const currentUserType = getUserType();
      setAuthStatus(loggedIn);
      setUserType(currentUserType);
    };

    checkAuth();
    
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (authStatus === null || userType === null) {
    return (
      <div className="loading-container">
        <div>Yuklanmoqda...</div>
      </div>
    );
  }

  if (!authStatus) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.includes(userType)) {
    return children;
  }

  return <Navigate to="/" />;
};

// ✅ YANGILANGAN: Public Route
const PublicRoute = ({ children }) => {
  const [authStatus, setAuthStatus] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = isLoggedIn();
      setAuthStatus(loggedIn);
    };

    checkAuth();
    
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (authStatus === null) {
    return (
      <div className="loading-container">
        <div>Yuklanmoqda...</div>
      </div>
    );
  }

  return !authStatus ? children : <Navigate to="/" />;
};

// ✅ App Content komponenti
const AppContent = ({ openSidebar, setOpenSidebar, setNotifications, notifications }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isAuthenticated = isLoggedIn();
  const userType = getUserType();

  return (
    <div className={`app ${isLoginPage ? "login-page" : ""}`}>
      {isAuthenticated && !isLoginPage && (
        <Sidebar
          openSidebar={openSidebar}
          handleLogout={handleLogout}
          userType={userType}
        />
      )}

      <div className={`main-content ${!openSidebar ? "sidebar-closed" : ""}`}>
        {isAuthenticated && !isLoginPage && (
          <div className="top-navbar-container">
            <TopNavbar
              handleLogout={handleLogout}
              openSidebar={openSidebar}
              setOpenSidebar={setOpenSidebar}
              userType={userType}
              setNotifications={setNotifications} 
              notifications={notifications} 
            />
          </div>
        )}

        <div className="content">
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  {userType === "market" && <Dashboard />}
                  {userType === "deliver" && <DashboardD />}
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <User userType={userType} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/help"
              element={
                <ProtectedRoute>
                  <Help />
                </ProtectedRoute>
              }
            />

            <Route
              path="/myorders"
              element={
                <RoleProtectedRoute allowedRoles={["market"]}>
                  <MyOrders />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/markets"
              element={
                <RoleProtectedRoute allowedRoles={["deliver"]}>
                  <MarketsD />
                </RoleProtectedRoute>
              }
            />
            
            <Route
              path="/products"
              element={
                <RoleProtectedRoute allowedRoles={["deliver"]}>
                  <ProductsD />
                </RoleProtectedRoute>
              }
            />
            
            <Route
              path="/chat"
              element={
                <RoleProtectedRoute allowedRoles={["deliver"]}>
                  <ChatD setNotifications={setNotifications} notifications={notifications} />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/delivers"
              element={
                <RoleProtectedRoute allowedRoles={["deliver"]}>
                  <Deliver />
                </RoleProtectedRoute>
              }
            />

            <Route
              path="/product-limit"
              element={
                <RoleProtectedRoute allowedRoles={["deliver"]}>
                  <ProductLimitD />
                </RoleProtectedRoute>
              }
            />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

        {isAuthenticated && !isLoginPage && (
          <MobileBottomNav userType={userType} />
        )}
      </div>
    </div>
  );
};

function App() {
  const [openSidebar, setOpenSidebar] = useState(true);
  const [notifications, setNotifications] = useState(null);

  return (
    <BrowserRouter>
      <AppContent 
        openSidebar={openSidebar} 
        setOpenSidebar={setOpenSidebar} 
        setNotifications={setNotifications} 
        notifications={notifications} 
      />
    </BrowserRouter>
  );
}

export default App;