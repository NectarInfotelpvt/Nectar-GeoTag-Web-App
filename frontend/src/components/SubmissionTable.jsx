import React, { useEffect, useState } from "react";

const SubmissionTable = ({ erpId }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5001/api/submissions/${erpId}`);

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch submissions.");
        }

        const data = await res.json();
        setRecords(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Unable to load submissions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (erpId) fetchSubmissions();
  }, [erpId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (!records.length) return <p className="text-muted">No submissions found.</p>;

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-hover">
        <thead className="table-primary">
          <tr>
            <th>#</th>
            <th>DCCB</th>
            <th>District</th>
            <th>State</th>
            <th>Location</th>
            <th>Time</th>
            <th>Photos</th>
          </tr>
        </thead>
        <tbody>
          {records.map((entry, index) => (
            <tr key={entry._id}>
              <td>{index + 1}</td>
              <td>{entry.dccb}</td>
              <td>{entry.district}</td>
              <td>{entry.state}</td>
              <td>{entry.locationName || "N/A"}</td>
              <td>
                {entry.submittedAt
                  ? new Date(entry.submittedAt).toLocaleString()
                  : "N/A"}
              </td>
             <td>
  {entry.photos && entry.photos.length > 0 ? (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        maxHeight: "300px",
        overflowY: "auto",
      }}
    >
      {entry.photos.map((photo, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img
            src={photo.url}
            alt={`Photo ${i + 1}`}
            style={{
              width: "120px",
              height: "80px",
              objectFit: "cover",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <span style={{ fontSize: "12px", maxWidth: "200px", wordBreak: "break-word" }}>
            {photo.label}
          </span>
        </div>
      ))}
    </div>
  ) : (
    "No photos"
  )}
</td>


            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubmissionTable;