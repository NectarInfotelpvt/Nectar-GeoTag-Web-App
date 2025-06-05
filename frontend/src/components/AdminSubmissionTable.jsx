import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const AdminSubmissionsTable = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentErpId, setCurrentErpId] = useState("");

    const districts = [ "SAHARANPUR", "MUZAFFARNAGAR", "SHAMLI", "AMROHA", "MORADABAD", "SAMBHAL",
  "BADAUN", "SHAHJAHANPUR", "PILIBHIT", "BAREILLY", "RAMPUR", "SITAPUR",
  "LAKHIMPUR KHERI", "BARABANKI", "LUCKNOW", "BAHRAICH", "SHRAVASTI", "AYODHYA",
  "AMBEDKARNAGAR", "SULTANPUR", "AMETHI", "RAEBARELI", "JAUNPUR", "MAU",
  "DEORIA", "AZAMGARH", "GORAKHPUR", "MAHARAJGANJ", "SANTKABEERNAGAR",
  "BASTI", "SIDDHARTHNAGAR"];
  

  const [selectedDistrict, setSelectedDistrict] = useState("");

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/submissions");
        const data = await res.json();
        if (res.ok) {
          setSubmissions(data);

          // Dynamically update districts from fetched data (if you want)
          const uniqueDistricts = [
            ...new Set(data.map((s) => s.district).filter(Boolean)),
          ].sort();
          setDistricts(uniqueDistricts);
        } else {
          console.error("Failed to fetch submissions.");
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  // Filter submissions by ERP ID and District
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesErp = sub.erpId
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDistrict = selectedDistrict
      ? sub.district === selectedDistrict
      : true;
    return matchesErp && matchesDistrict;
  });

  const handleDownloadAllImages = async (photos) => {
    if (!photos || photos.length === 0) return;

    const zip = new JSZip();
    const erpId = currentErpId || "ERP";

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const url = typeof photo === "string" ? photo : photo.url;
      const label = photo.label || `Photo${i + 1}`;

      try {
        const response = await fetch(url);
        const blob = await response.blob();
        zip.file(`${erpId}_${label}.jpg`, blob);
      } catch (error) {
        console.error(`Error fetching photo ${label}:`, error);
      }
    }

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, `${erpId}_photos.zip`);
    });
  };

  const openModalWithPhotos = (photos, erpId) => {
    setSelectedPhotos(photos);
    setCurrentErpId(erpId);
    setShowModal(true);
  };

  if (loading) return <p>Loading submissions...</p>;

  return (
    <div className="container mt-3">
      <h5 className="mb-3">Admin Submissions</h5>

      {/* District Filter Dropdown - Add this ABOVE ERP ID input */}
      <select
        className="form-select mb-3"
        value={selectedDistrict}
        onChange={(e) => setSelectedDistrict(e.target.value)}
      >
        <option value="">Filter by District</option>
        {districts.map((district) => (
          <option key={district} value={district}>
            {district}
          </option>
        ))}
      </select>

      {/* ERP ID Search Input */}
      <input
        type="text"
        placeholder="Search by ERP ID..."
        className="form-control mb-3"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-primary">
            <tr>
              <th>ERP ID</th>
              <th>DCCB</th>
              <th>District</th>
              <th>State</th>
              <th>Location</th>
              <th>Submitted At</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Photos</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.map((submission, index) => (
              <tr key={index}>
                <td>{submission.erpId}</td>
                <td>{submission.dccb}</td>
                <td>{submission.district}</td>
                <td>{submission.state}</td>
                <td>{submission.locationName || "N/A"}</td>
                <td>{new Date(submission.submittedAt).toLocaleString()}</td>
                <td>{submission.latitude}</td>
                <td>{submission.longitude}</td>
                <td>
                  {submission.photos && submission.photos.length > 0 ? (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() =>
                        openModalWithPhotos(submission.photos, submission.erpId)
                      }
                    >
                      View Photos
                    </button>
                  ) : (
                    "No Photos"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal to view photos */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Submission Photos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-wrap justify-content-center gap-3">
            {selectedPhotos.map((photo, idx) => {
              const url = typeof photo === "string" ? photo : photo.url;
              const label = photo.label || `Photo ${idx + 1}`;
              return (
                <div key={idx} className="text-center">
                  <img
                    src={url}
                    alt={`Photo ${idx + 1}`}
                    style={{
                      maxWidth: "200px",
                      maxHeight: "150px",
                      borderRadius: "8px",
                      objectFit: "cover",
                    }}
                  />
                  <br />
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary mt-2 me-1"
                  >
                    View
                  </a>
                  <a
                    href={`http://localhost:5001/api/download-image?url=${encodeURIComponent(
                      url
                    )}`}
                    download
                    className="btn btn-sm btn-success mt-2"
                  >
                    Download
                  </a>
                </div>
              );
            })}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="success"
            onClick={() => handleDownloadAllImages(selectedPhotos)}
          >
            Download All
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminSubmissionsTable;
