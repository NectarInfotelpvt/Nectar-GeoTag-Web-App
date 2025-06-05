import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const API = "http://localhost:5001/api";

    try {
      if (isLogin) {

        localStorage.setItem("erpId", loginId);
console.log("ERP ID saved:", loginId);

        const res = await fetch(`${API}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ loginId, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Login failed");
          return;
        }

        alert("Login successful!");
        localStorage.setItem("erpId", loginId);
console.log("ERP ID saved:", loginId);

if (data.isAdmin) {
  navigate("/admin");
} else {
  navigate("/user");
}
      } else {
  // Registration flow
  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email: loginId, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Registration failed");
    return;
  }

  // ✅ Store session info (auto-login)
  localStorage.setItem("erpId", data.email); // or data.userId

  alert("Registered and logged in successfully!");

  // ✅ Redirect to correct dashboard
  if (data.isAdmin) {
    navigate("/admin");
  } else {
    navigate("/user");
  }
}


      setName("");
      setLoginId("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("API error:", err);
      alert("Something went wrong. Check console.");
    }
  };

  return (
    <div>
      <Navbar />

      <div className="welcome-box text-center mb-5">
        <h2 className="fw-bold text-white">Submit ERP ID with Geotag</h2>
        <p className="text-light fs-5">
        Ensure PACS accuracy using ERP ID and GPS location
        </p>
      </div>

      <div className="container mt-4">
        <div className="row justify-content-center g-4">
          <div className="col-md-6">
            <div className="card form-card shadow-lg p-4 border-0">
              <h4 className={`text-center mb-4 ${isLogin ? "text-primary" : "text-info"}`}>
                {isLogin ? "Login" : "Register"}
              </h4>

              <form onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label text-primary">Pacs Name</label>
                    <input
                      type="text"
                      id="name"
                      className="form-control"
                      placeholder="Enter Pacs Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="loginId" className="form-label text-primary"> PACS ERP ID</label>
                  <input
                    type="text"
                    id="loginId"
                    className="form-control"
                    placeholder="Enter your PACS ERP ID"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label text-primary">Password</label>
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    placeholder={isLogin ? "Enter your password" : "Create a password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {!isLogin && (
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label text-primary">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      className="form-control"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                )}

                <button type="submit" className={`btn w-100 mb-3 ${isLogin ? "btn-primary" : "btn-info text-white"}`}>
                  {isLogin ? "Login" : "Register"}
                </button>
              </form>

              <div className="text-center">
                <button className="btn btn-link text-decoration-none text-secondary" onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? "Don't have an account? Register here" : "Already have an account? Login here"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-primary text-light text-center py-3 mt-5">
        <div className="container">
          <small>© {new Date().getFullYear()} Nectar Infotel. All rights reserved.</small>
        </div>
      </footer>

      <style jsx="true">{`
        body {
          background-color: #e6f0ff;
        }
        .welcome-box {
          background: linear-gradient(to right, #66b2ff, #3399ff);
          padding: 40px;
          border-bottom-left-radius: 20%;
          border-bottom-right-radius: 20%;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          margin-top: -16px;
        }
        .form-card {
          background: #f0f8ff;
          border-radius: 15px;
          transition: all 0.3s ease-in-out;
        }
        .form-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }
        .form-label {
          font-weight: 600;
        }
        .btn-primary, .btn-info {
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        input:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }
        ::placeholder {
          color: #b0c4de;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;