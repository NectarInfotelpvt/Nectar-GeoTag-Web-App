import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SubmissionTable from "../components/SubmissionTable";
import { FaCamera } from "react-icons/fa";


const REQUIRED_PHOTOS = [
  "Inside PACS - Front View",
  "Inside PACS - Side View",
  "Inside PACS - Staff Area",
  "Outside PACS - Front Gate",
  "Outside PACS - Surrounding Left View",
  "Your Photo with PACS Main Board"
];

const MainDashboard = () => {
  const [showAttendancePanel, setShowAttendancePanel] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [currentLabelIndex, setCurrentLabelIndex] = useState(0);
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [locationName, setLocationName] = useState("Fetching location...");
  const [dccb, setDccb] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [viewAttendance, setViewAttendance] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [bgColor, setBgColor] = useState("#e3f2fd");
  const [erpId, setErpId] = useState("");
  const [loading, setLoading] = useState(false);

  const pacsInputRef = useRef(null);
  const districts = [
  "SAHARANPUR", "MUZAFFARNAGAR", "SHAMLI", "AMROHA", "MORADABAD", "SAMBHAL",
  "BADAUN", "SHAHJAHANPUR", "PILIBHIT", "BAREILLY", "RAMPUR", "SITAPUR",
  "LAKHIMPUR KHERI", "BARABANKI", "LUCKNOW", "BAHRAICH", "SHRAVASTI", "AYODHYA",
  "AMBEDKARNAGAR", "SULTANPUR", "AMETHI", "RAEBARELI", "JAUNPUR", "MAU",
  "DEORIA", "AZAMGARH", "GORAKHPUR", "MAHARAJGANJ", "SANTKABEERNAGAR",
  "BASTI", "SIDDHARTHNAGAR"
];



  function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
}

  useEffect(() => {
    

    const storedErpId = localStorage.getItem("erpId");
    console.log("Loaded ERP ID:", storedErpId);
    if (storedErpId) setErpId(storedErpId);

    const hour = new Date().getHours();
    setGreeting(
      hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening"
    );
    setBgColor("#e3f2fd");
  }, []);

  useEffect(() => {
    if (showAttendancePanel && pacsInputRef.current) {
      pacsInputRef.current.focus();
    }
  }, [showAttendancePanel]);
const captureLocation = () => {
  if (!navigator.geolocation) {
    setLocationName("Geolocation not supported by browser.");
    alert("Your browser does not support location services.");
    return;
  }

  setLocationName("Fetching location...");

  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      const { latitude, longitude } = coords;
      console.log("📍 Got coordinates:", latitude, longitude);
      setLocation({ lat: latitude, lon: longitude });

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );

        if (!res.ok) throw new Error("Reverse geocoding failed");

        const data = await res.json();
        const address = data.display_name || "Unknown Location";
        console.log("📌 Reverse geocoded address:", address);
        setLocationName(address);
      } catch (err) {
        console.error("❌ Reverse geocoding error:", err);
        setLocationName("Unknown Location");
        alert("Unable to determine address from coordinates.");
      }
    },
    (error) => {
      console.error("❌ Geolocation error:", error);
      if (error.code === 1) {
        alert("Permission denied. Please allow location access.");
      } else if (error.code === 2) {
        alert("Position unavailable. Try again later.");
      } else if (error.code === 3) {
        alert("Location request timed out. Please try again.");
      } else {
        alert("An unknown error occurred while fetching location.");
      }
      setLocationName("Location not available");
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
};


  const handleShowAttendance = () => {
    setShowAttendancePanel(true);
    setViewAttendance(false);
    captureLocation();
  };

  const capturePhoto = async () => {
  if (!location.lat || !location.lon) {
    alert("Location is not available. Please click 'Refetch Location'.");
    return;
  }

  setLoading(true);
  try {
   const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    width: { ideal: 1600 },
    height: { ideal: 1200 },
    facingMode: { ideal: "environment" }  // 👈 this line selects rear camera if available
  },
});

    const video = document.createElement("video");
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.style.display = "none";
    document.body.appendChild(video);

    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play();
        resolve();
      };
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText(`📍 ${locationName}`, 20, canvas.height - 60);
    ctx.fillText(`Lat: ${location.lat?.toFixed(5)} | Lon: ${location.lon?.toFixed(5)}`, 20, canvas.height - 35);
    ctx.fillText(`🕒 ${new Date().toLocaleString()}`, 20, canvas.height - 10);

    const photoData = canvas.toDataURL("image/png");

    setPhotos((prev) => [
      ...prev,
      { label: REQUIRED_PHOTOS[currentLabelIndex], data: photoData },
    ]);
    setCurrentLabelIndex((prev) => prev + 1);

    stream.getTracks().forEach((track) => track.stop());
    video.remove();
  } catch {
    alert("Failed to capture photo. Check camera permissions.");
  } finally {
    setLoading(false);
  }
};


 const handleSubmit = async () => {
  console.log("Submitting with ERP ID:", erpId);
  console.log({ erpId, dccb, district, state, photosLength: photos.length });

 const invalidLocations = ["Location not available", "Unknown Location", "Fetching location..."];

if (
  !erpId ||
  !dccb ||
  !district ||
  !state ||
  photos.length < REQUIRED_PHOTOS.length ||
  invalidLocations.includes(locationName)
) {
  alert("All fields must be completed and a valid location must be captured before submission.");
  return;
}


  const formData = new FormData();
  formData.append("erpId", erpId);
  formData.append("dccb", dccb);
  formData.append("district", district);
  formData.append("state", state);
  formData.append("latitude", location.lat);
  formData.append("longitude", location.lon);
  formData.append("locationName", locationName);

  photos.forEach(({ label, data }, index) => {
  const blob = dataURLtoBlob(data);
  formData.append("photos", blob, `${label}-${index + 1}.png`);
  formData.append("photoLabels[]", label); // NEW: send labels
});


  try {
    const response = await fetch("http://localhost:5001/api/erp-submission", {
      method: "POST",
      body: formData,
    });
 
    const contentType = response.headers.get("content-type");

    // Detect if server returns HTML (i.e. error page instead of JSON)
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();

      if (response.ok) {
        alert("ERP Data submitted successfully!");
        setPhotos([]);
        setCurrentLabelIndex(0);
        setDccb("");
        setDistrict("");
        setState("");
      } else {
        alert("Submission failed: " + data.message);
      }
    } else {
      const text = await response.text();
      console.error("Unexpected response:", text);
      alert("Unexpected response from server (not JSON). Check the backend route.");
    }
  } catch (error) {
    console.error("Submission error:", error);
    alert("An error occurred while submitting data.");
  }
};


  return (
    <div style={{ backgroundColor: bgColor, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header className="app-header d-flex align-items-center px-4" style={{ backgroundColor: "#0d47a1" }}>
  <img 
    src="/nectar-logo.png" 
    alt="Nectar Logo" 
    height={40} 
    width={40} 
    className="me-2"
  />
  <h4 className="m-0 text-white fw-bold">Nectar Infotel</h4>
</header>

      <motion.div className="w-100 text-center text-dark py-4 greeting-card-full shadow-sm"
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
        <h5>{greeting}</h5>
      </motion.div>

      <main className="container my-3 flex-grow-1">
        <motion.div className="row justify-content-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}>
          <div className="col-md-6 mb-3">
            <motion.div whileHover={{ scale: 1.05 }} className="card text-center shadow-sm panel-card"
              onClick={handleShowAttendance} style={{ cursor: "pointer", backgroundColor: "#d0e7ff" }}>
              <div className="card-body"> 
                <h5 className="card-title">GeoTag</h5>
                <p className="card-text">Submit your GeoTag</p>
                <button className="btn btn-outline-primary">Start</button>
              </div>
            </motion.div>
          </div>
          <div className="col-md-6 mb-3">
            <motion.div whileHover={{ scale: 1.05 }} className="card text-center shadow-sm panel-card"
              onClick={() => { setViewAttendance(true); setShowAttendancePanel(false); }}
              style={{ cursor: "pointer", backgroundColor: "#d0e7ff" }}>
              <div className="card-body">
                <h5 className="card-title">GeoTag Submission</h5>
                <p className="card-text">Check your submitted GeoTag and history.</p>
                <button className="btn btn-outline-primary">View Submission</button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <AnimatePresence>
          {showAttendancePanel && (
            <motion.div className="row justify-content-center mt-4"
              initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}>
              <div className="col-md-10">
                <div className="card shadow-sm p-4 panel-card" style={{ backgroundColor: "#e7f0ff" }}>
                  <h4 className="mb-4 text-primary">GeoTag Panel</h4>

                  <div className="mb-3">
                    <label className="form-label">Select PACS Name</label>
                    <input ref={pacsInputRef} type="text" className="form-control" placeholder="Enter PACS Name"
                      value={dccb} onChange={(e) => setDccb(e.target.value)} />
                  </div>

                  <div className="mb-3">
                   <label htmlFor="district" className="form-label text-primary">District</label>
                   <select
                   id="district"
                   className="form-select"
                   value={district}
                   onChange={(e) => setDistrict(e.target.value)}
                   required
                  >
                   <option value="">Select your district</option>
                   {districts.map((dist, idx) => (
                   <option key={idx} value={dist}>{dist}</option>
                   ))}
                   </select>
                   </div>


                  <div className="mb-3">
                    <label className="form-label">Select State</label>
                    <select className="form-select" value={state} onChange={(e) => setState(e.target.value)}>
                      <option value="">Choose State</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                    </select>
                  </div>
                   
                  <div className="mb-3">
                  <label className="form-label">Capture Photos</label>
                 <div
                 className="p-3 border rounded bg-light"
                 >

                 {currentLabelIndex < REQUIRED_PHOTOS.length ? (
                  <>
                 <div
                 className="camera-label-box d-flex align-items-center mb-3 p-3 bg-white shadow-sm rounded"
                 style={{ width: "100%" }}
                 >
                <FaCamera size={40} color="#0d6efd" className="me-3" />
                 <h5 className="mb-0">{REQUIRED_PHOTOS[currentLabelIndex]}</h5>
                 </div>
                <button
          className="btn btn-primary w-100"
          onClick={capturePhoto}
          disabled={loading || currentLabelIndex >= REQUIRED_PHOTOS.length}
        >
          {loading ? "Capturing..." : "Capture Photo"}
        </button>
      </>
    ) : (
      <p className="text-success fw-bold">✅ All required photos captured</p>
    )}

    {/* Thumbnails of captured photos */}
    <div className="photo-grid mt-4" >
      {photos.map((p, i) => (
        <div key={i} className="photo-item card shadow-sm p-2 mb-3">
         <div className="photo-label">{p.label}</div>
          <img src={p.data} alt={p.label} className="img-fluid rounded" />
        </div>
      ))}
    </div>
  </div>
</div>

       <div className="mb-3">
             <strong>📍 Current Location:</strong> {locationName} <br />
             <small>
             Latitude: {location.lat?.toFixed(5) || "--"} | Longitude: {location.lon?.toFixed(5) || "--"}
             </small>
             <br />
             <button className="btn btn-sm btn-link p-0 mt-1" onClick={captureLocation}>Refetch Location</button>
             </div>

             <button className="btn btn-primary w-100 mt-3" onClick={handleSubmit} disabled={photos.length < REQUIRED_PHOTOS.length}>
             Submit
              </button>
                </div>
              </div>
            </motion.div>
          )}

          {viewAttendance && (
            <motion.div className="row justify-content-center mt-4"
              initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}>
              <div className="col-md-10">
                <div className="card shadow-sm p-4 panel-card" style={{ backgroundColor: "#e7f0ff" }}>
                  <h4 className="mb-4 text-primary">Your Submission History</h4>
                  <SubmissionTable erpId={erpId} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="text-white text-center py-3" style={{ backgroundColor: "#0d6efd" }}>
        <small>&copy; {new Date().getFullYear()} Nectar Infotel. All rights reserved.</small>
      </footer>

      <style>{`
        .panel-card {
          border-radius: 1rem;
          transition: transform 0.3s ease;
        }
        .photo-box img {
          max-height: 150px;
        }
        .greeting-card-full {
          background: #d0e7ff;
          border-bottom-left-radius: 20%;
          border-bottom-right-radius: 20%;
          border: 2px solid #2196f3;
        }
        .photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 16px;
        }
        ..photo-item {
  background-color: #f8f9fa;
  border-radius: 0.75rem;
  overflow: hidden;
  text-align: center;
  padding: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

          .camera-label-box {
  border: 2px solid #0d6efd;
  border-radius: 0.75rem;
  background-color: white;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.photo-item {
  background-color: #f8f9fa;
  border-radius: 0.75rem;
}

.photo-label {
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 8px;
  text-align: center;
  color: #333;
}


      `}</style>
    </div>
  );
};

export default MainDashboard;
