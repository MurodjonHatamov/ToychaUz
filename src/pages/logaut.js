export const logaut = (response) => {

    // Login sahifasida bo‘lsa – logout NI ISHLATMA!
    if (window.location.pathname === "/login") {
      return;
    }
  
    if (response.status === 401 || response.status === 402) {
  
      // alert("⚠️ Token vaqti tugadi. Qayta login qilishingiz kerak!");
  
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userType");
      localStorage.removeItem("loginTime");
  
      window.location.replace("/login");
  
      return null;
    }
  };
  