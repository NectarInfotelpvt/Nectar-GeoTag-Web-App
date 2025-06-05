import React, { useState, useEffect } from "react";
import {
  FaDownload,
  FaMapMarkedAlt,
  FaUserPlus,
  FaClipboardList,
} from "react-icons/fa";
import { motion } from "framer-motion";
import AdminSubmissionsTable from "../components/AdminSubmissionTable";

const AdminPanel = () => {
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [date, setDate] = useState("");
  const [erpIdDownload, setErpIdDownload] = useState("");
  const [bgColor, setBgColor] = useState("#e3f2fd");

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [districtList, setDistrictList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [dateList, setDateList] = useState([]);

  useEffect(() => {
    setBgColor("#e3f2fd");

    fetch("http://localhost:5001/api/admin/unique-districts")
      .then((res) => res.json())
      .then(setDistrictList)
      .catch((err) => console.error("❌ Failed to fetch districts:", err));

    fetch("http://localhost:5001/api/admin/unique-states")
      .then((res) => res.json())
      .then(setStateList)
      .catch((err) => console.error("❌ Failed to fetch states:", err));

    fetch("http://localhost:5001/api/admin/unique-dates")
      .then((res) => res.json())
      .then(setDateList)
      .catch((err) => console.error("❌ Failed to fetch dates:", err));
  }, []);

  const handleDownload = () => {
    if (!district || !state || !date) {
      alert("Please fill all fields to download filtered dataset.");
      return;
    }
    const query = new URLSearchParams({ district, state, date }).toString();
    window.open(`http://localhost:5001/api/admin/download-submissions?${query}`, "_blank");
  };

  const handleDownloadAll = () => {
    window.open("http://localhost:5001/api/admin/download-submissions", "_blank");
  };

  const handleDownloadByErpId = () => {
    if (!erpIdDownload.trim()) {
      alert("Please enter ERP ID.");
      return;
    }

    const link = document.createElement("a");
    link.href = `http://localhost:5001/api/admin/download-submissions/${erpIdDownload}`;
    link.download = `${erpIdDownload}_submissions.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAdminRegister = async (e) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      alert("Please enter email and password.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Admin created successfully.");
        setAdminEmail("");
        setAdminPassword("");
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error("❌ Error creating admin:", err);
      alert("Server error.");
    }
  };

  return (
    <div style={{ backgroundColor: bgColor, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header className="py-4 text-center text-white" style={{ backgroundColor: "#0d6efd" }}>
        <h2><FaMapMarkedAlt className="me-2" /> Admin Panel</h2>
      </header>

      <motion.div
        className="w-100 text-center text-dark py-4 greeting-card-full shadow-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      />

      <main className="container my-4 flex-grow-1">
        <div className="row g-4">

          {/* Download Dataset Section */}
          <motion.div className="col-md-6 d-flex" whileHover={{ scale: 1.02 }}>
            <div className="card shadow-sm panel-card w-100 d-flex flex-column" style={{ backgroundColor: "#e7f0ff" }}>
              <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white fw-bold">
                <span><FaDownload className="me-2" /> Download Dataset</span>
              </div>
              <div className="card-body d-flex flex-column flex-grow-1">

                <select
                  className="form-select mb-2"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  <option value="">Select District</option>
                  {districtList.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <select
                  className="form-select mb-2"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                >
                  <option value="">Select State</option>
                  {stateList.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <select
                  className="form-select mb-3"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                >
                  <option value="">Select Date</option>
                  {dateList.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <button className="btn btn-primary w-100 mb-3" onClick={handleDownload}>
                  Download Filtered Dataset
                </button>

                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Enter ERP ID to download"
                  value={erpIdDownload}
                  onChange={(e) => setErpIdDownload(e.target.value)}
                />
                <button className="btn btn-success w-100 mb-3" onClick={handleDownloadByErpId}>
                  Download My ERP Dataset
                </button>

                <button className="btn btn-outline-primary w-100 py-3 fs-5" onClick={handleDownloadAll}>
                  Download Entire Dataset
                </button>
              </div>
            </div>
          </motion.div>

          {/* Add New Admin Section */}
          <motion.div className="col-md-6 d-flex" whileHover={{ scale: 1.02 }}>
            <div className="card shadow-sm panel-card w-100 d-flex flex-column" style={{ backgroundColor: "#e7f0ff" }}>
              <div className="card-header bg-primary text-white fw-bold">
                <FaUserPlus className="me-2" /> Add New Admin
              </div>
              <div className="card-body d-flex flex-column flex-grow-1">
                <form onSubmit={handleAdminRegister} className="d-flex flex-column flex-grow-1">
                  <input
                    type="email"
                    className="form-control mb-3"
                    placeholder="Email Address"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                  />
                  <input
                    type="password"
                    className="form-control mb-4"
                    placeholder="Password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary w-100 py-2 fs-5 mt-auto">
                    Register Admin
                  </button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* All ERP Submissions Section */}
          <motion.div className="col-12" whileHover={{ scale: 1.01 }}>
            <div className="card mt-4 mb-5 shadow-sm panel-card" style={{ backgroundColor: "#e7f0ff" }}>
              <div className="card-header bg-primary text-white fw-bold">
                <FaClipboardList className="me-2" /> All ERP Submissions
              </div>
              <div className="card-body">
                <AdminSubmissionsTable />
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      <footer className="text-white text-center py-3" style={{ backgroundColor: "#0d6efd" }}>
        <small>&copy; {new Date().getFullYear()} Nectar Infotel. All rights reserved.</small>
      </footer>

      <style>{`
        .panel-card {
          border-radius: 1rem;
          transition: transform 0.3s ease;
        }
        .greeting-card-full {
          background: #d0e7ff;
          border-bottom-left-radius: 20%;
          border-bottom-right-radius: 20%;
          border: 2px solid #2196f3;
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
 