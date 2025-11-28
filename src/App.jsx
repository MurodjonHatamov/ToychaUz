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

// 🔹 DELIVER UCHUN YANGI SAHIFALARNI IMPORT QILISH KERAK
// import DeliverDashboard from "./pages/deliver/DeliverDashboard";
// import DeliverOrders from "./pages/deliver/DeliverOrders";
// import DeliverTasks from "./pages/deliver/DeliverTasks";

const handleLogout = async () => {
  try {
    // Logout API ga so'rov
    const response = await fetch("http://localhost:2277/auth/market-logout", {
      method: "DELETE",
      headers: {
        accept: "*/*",
      },
      credentials: "include",
    });

    if (response.ok) {
      // LocalStorage ni tozalash
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userType");
      localStorage.removeItem("loginTime");

      // App ni yangilash
      window.dispatchEvent(new Event("storage"));

      // Login sahifasiga yo'naltirish
      window.location.href = "/login";
    } else {
      console.error("Logout xatosi:", response.status);
      // Agar API xato bersa, manual logout qilamiz
      manualLogout();
    }
  } catch (error) {
    console.error("Logout xatosi:", error);
    // Agar network xatosi bo'lsa, manual logout qilamiz
    manualLogout();
  }
};

// Manual logout (fallback)
const manualLogout = () => {
  // Cookie ni tozalash
  document.cookie = "AuthToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

  // LocalStorage ni tozalash
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userType");
  localStorage.removeItem("loginTime");

  // App ni yangilash
  window.dispatchEvent(new Event("storage"));

  // Login sahifasiga yo'naltirish
  window.location.href = "/login";
};

// Cookie helper funksiyasi
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

// Login holatini tekshirish
const isLoggedIn = () => {
  const token = getCookie("AuthToken");
  const localStorageAuth = localStorage.getItem("isLoggedIn") === "true";
  return !!(token && localStorageAuth);
};

// 🔹 USER TURINI TEKSHIRISH (market, deliver)
const getUserType = () => {
  return localStorage.getItem("userType") || "market";
};

// Protected Route komponenti
const ProtectedRoute = ({ children }) => {
  const [authStatus, setAuthStatus] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = isLoggedIn();
      setAuthStatus(loggedIn);
    };

    checkAuth();

    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
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

// 🔹 ROLE-BASED PROTECTED ROUTE (faqat ma'lum role lar uchun)
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

    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  if (authStatus === null || userType === null) {
    return (
      <div className="loading-container">
        <div>Yuklanmoqda...</div>
      </div>
    );
  }

  // Agar login qilmagan bo'lsa
  if (!authStatus) {
    return <Navigate to="/login" />;
  }

  // Agar role ruxsat etilgan bo'lsa
  if (allowedRoles.includes(userType)) {
    return children;
  }

  // Agar role ruxsat etilmagan bo'lsa, asosiy sahifaga yo'naltirish
  return <Navigate to="/" />;
};

// Public Route (faqat login bo'lmaganlar uchun)
const PublicRoute = ({ children }) => {
  const [authStatus, setAuthStatus] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = isLoggedIn();
      setAuthStatus(loggedIn);
    };

    checkAuth();

    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
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

// App Content komponenti - location ni olish uchun
const AppContent = ({ openSidebar, setOpenSidebar,setNotifications, notifications }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isAuthenticated = isLoggedIn();
  const userType = getUserType();

  return (
    <div className={`app ${isLoginPage ? "login-page" : ""}`}>
      {/* Sidebar faqat login bo'lganida va login sahifasida emasda ko'rinadi */}
      {isAuthenticated && !isLoginPage && (
        <Sidebar
          openSidebar={openSidebar}
          handleLogout={handleLogout}
          userType={userType} // 🔹 User type ni sidebar ga uzatish
        />
      )}

      <div className={`main-content ${!openSidebar ? "sidebar-closed" : ""}`}>
        {/* TopNavbar faqat login bo'lganida va login sahifasida emasda ko'rinadi */}
        {isAuthenticated && !isLoginPage && (
          <div className="top-navbar-container">
            <TopNavbar
              handleLogout={handleLogout}
              openSidebar={openSidebar}
              setOpenSidebar={setOpenSidebar}
              userType={userType} // 🔹 User type ni navbar ga uzatish
              setNotifications={setNotifications} notifications={notifications} 
            />
          </div>
        )}

        <div className="content">
          <Routes>
            {/* Public route - faqat login bo'lmaganlar uchun */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* 🔹 ASOSIY DASHBOARD - User type ga qarab */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  {/* User type ga qarab turli dashboard ko'rsatish */}
                  {userType === "market" && <Dashboard />}
                  {userType === "deliver" && <DashboardD />}{" "}
                  {/* 🔹 Deliver dashboard */}
                </ProtectedRoute>
              }
            />

            {/* 🔹 PROFIL - Ikkala user uchun ham */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <User />
                </ProtectedRoute>
              }
            />

            {/* 🔹 YORDAM - Ikkala user uchun ham */}
            <Route
              path="/help"
              element={
                <ProtectedRoute>
                  <Help />
                </ProtectedRoute>
              }
            />

            {/* 🔹 MARKET UCHUN SAHIFALAR (faqat market user lar uchun) */}
            <Route
              path="/myorders"
              element={
                <RoleProtectedRoute allowedRoles={["market"]}>
                  <MyOrders />
                </RoleProtectedRoute>
              }
            />

            {/* 🔹 DELIVER UCHUN SAHIFALAR (faqat deliver user lar uchun) */}
            <Route
              path="/markets"
              element={
                <RoleProtectedRoute allowedRoles={["deliver"]}>
          
                 <MarketsD/>
                </RoleProtectedRoute>
              }
            />
     <Route
              path="/products"
              element={
                <RoleProtectedRoute allowedRoles={["deliver"]}>
          
                 <ProductsD/>
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
              path="/deliver-user"
              element={
                <RoleProtectedRoute allowedRoles={["deliver"]}>
          
                <Deliver/>
                </RoleProtectedRoute>
              }
            />

            {/* Not found route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

        {/* MobileBottomNav faqat login bo'lganida va login sahifasida emasda ko'rinadi */}
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
      <AppContent openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} setNotifications={setNotifications} notifications={notifications} />
    </BrowserRouter>
  );
}

export default App;
