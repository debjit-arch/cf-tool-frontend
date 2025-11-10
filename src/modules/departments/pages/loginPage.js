// import React, { useState } from "react";
// import { useHistory } from "react-router-dom";
// import axios from "axios";

// const LoginPage = ({ onLogin }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const history = useHistory();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const res = await axios.post(
//         "https://cftoolbackend.duckdns.org/api/users/login",
//         { email, password }
//       );

//       sessionStorage.setItem("token", res.data.token);
//       sessionStorage.setItem("user", JSON.stringify(res.data.user));

//       console.log("✅ Login successful:", res.data.user);

//       if (onLogin) onLogin(res.data.user);
//       history.push("/risk-assessment");
//     } catch (err) {
//       console.error("❌ Login failed:", err.response?.data?.error);
//       setError(err.response?.data?.error || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🎨 Styles
//   const pageStyle = {
//     marginTop: "60px",
//     padding: "15px",
//     maxWidth: "400px",
//     margin: "100px auto",
//   };

//   const cardStyle = {
//     background: "white",
//     borderRadius: "12px",
//     padding: "30px",
//     boxShadow: "0 3px 12px rgba(0, 0, 0, 0.06)",
//     border: "1px solid #e9ecef",
//     textAlign: "center",
//   };

//   const inputStyle = {
//     width: "100%",
//     padding: "12px",
//     margin: "8px 0",
//     borderRadius: "8px",
//     border: "1px solid #e9ecef",
//     fontSize: "14px",
//   };

//   const buttonStyle = {
//     width: "100%",
//     padding: "12px",
//     background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
//     border: "none",
//     borderRadius: "8px",
//     color: "white",
//     fontSize: "15px",
//     cursor: loading ? "not-allowed" : "pointer",
//     marginTop: "10px",
//     transition: "all 0.3s ease",
//     opacity: loading ? 0.7 : 1,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: "8px",
//   };

//   const spinnerStyle = {
//     width: "18px",
//     height: "18px",
//     border: "2px solid white",
//     borderTop: "2px solid transparent",
//     borderRadius: "50%",
//     animation: "spin 0.8s linear infinite",
//   };

//   return (
//     <div style={pageStyle}>
//       <div style={cardStyle}>
//         <h1 style={{ color: "#2c3e50", marginBottom: "8px", fontSize: "22px" }}>
//           🔐 Login
//         </h1>
//         <p style={{ color: "#7f8c8d", fontSize: "14px", marginBottom: "20px" }}>
//           Access your risk dashboard
//         </p>

//         {error && (
//           <p style={{ color: "red", fontSize: "13px", marginBottom: "10px" }}>
//             {error}
//           </p>
//         )}

//         <form onSubmit={handleLogin}>
//           <input
//             type="email"
//             placeholder="Email"
//             style={inputStyle}
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />

//           <input
//             type="password"
//             placeholder="Password"
//             style={inputStyle}
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />

//           <button
//             type="submit"
//             style={buttonStyle}
//             disabled={loading}
//             onMouseEnter={(e) =>
//               !loading && (e.currentTarget.style.transform = "translateY(-2px)")
//             }
//             onMouseLeave={(e) =>
//               !loading && (e.currentTarget.style.transform = "translateY(0)")
//             }
//           >
//             {loading ? (
//               <>
//                 <div style={spinnerStyle}></div>
//                 Logging in...
//               </>
//             ) : (
//               "Login"
//             )}
//           </button>
//         </form>
//       </div>

//       {/* 🔁 Spinner animation keyframes */}
//       <style>
//         {`
//           @keyframes spin {
//             from { transform: rotate(0deg); }
//             to { transform: rotate(360deg); }
//           }
//         `}
//       </style>
//     </div>
//   );
// };

// export default LoginPage;

















import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import "./loginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://cftoolbackend.duckdns.org/api/users/login",
        { email, password }
      );
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      history.push("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">SAFESPHERE Login</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            autoComplete="username"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete="current-password"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
