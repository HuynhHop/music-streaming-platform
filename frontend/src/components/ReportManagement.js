import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ReportManagement.css";

const ReportManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [feedback, setFeedback] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createAt",
    direction: "asc",
  });
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get("http://localhost:5000/api/reports", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setReports(response.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
      alert("Failed to fetch reports.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const deleteReport = async (reportId) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.delete(`http://localhost:5000/api/reports/${reportId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setReports((prev) => prev.filter((report) => report._id !== reportId));
      alert("Report deleted successfully.");
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("Failed to delete the report.");
    }
  };

  const updateReportStatus = async (reportId, status) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.patch(
        `http://localhost:5000/api/reports/${reportId}`,
        { status, feedback },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setReports((prev) =>
        prev.map((report) =>
          report._id === reportId ? { ...report, status, feedback } : report
        )
      );
      alert(`Report marked as ${status.toLowerCase()}.`);
      handleCloseModal();
    } catch (error) {
      console.error("Error updating report status:", error);
      alert("Failed to update the report status.");
    }
  };

  const handleResolve = () => {
    if (!feedback) {
      alert("Please provide feedback before resolving.");
      return;
    }
    updateReportStatus(selectedReport._id, "Resolved");
  };

  const handleReject = () => {
    if (!feedback) {
      alert("Please provide feedback before rejecting.");
      return;
    }
    updateReportStatus(selectedReport._id, "Rejected");
  };

  const handleViewDetail = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
    setFeedback("");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
    setFeedback("");
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedReports = [...reports].sort((a, b) => {
    const { key, direction } = sortConfig;
    const order = direction === "asc" ? 1 : -1;
    if (key === "createAt") {
      return order * (new Date(a[key]) - new Date(b[key]));
    }
    return a[key] < b[key] ? -order : a[key] > b[key] ? order : 0;
  });

  const filteredReports = sortedReports.filter(
    (report) =>
      report.reason.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (statusFilter === "all" || report.status.toLowerCase() === statusFilter)
  );

  return (
    <div className="management-section">
      <h3>Manage Reports</h3>
      <p>Here you can review, resolve, or reject reports.</p>
      <input
        type="text"
        placeholder="Search by reason..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="status-filter"
      >
        <option value="all">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="resolved">Resolved</option>
        <option value="rejected">Rejected</option>
      </select>
      <button onClick={() => handleSort("createAt")} className="sort-button">
        Sort by Date Created {sortConfig.direction === "asc" ? "↑" : "↓"}
      </button>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="scrollable-table-container">
          <table className="reports-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("song")}>Song</th>
                <th onClick={() => handleSort("user")}>User</th>
                <th onClick={() => handleSort("reason")}>Reason</th>
                <th onClick={() => handleSort("status")}>Status</th>
                <th onClick={() => handleSort("createAt")}>Date Created</th>
                <th>Feedback</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report._id}>
                  <td>{report.song?.title || "N/A"}</td>
                  <td>{report.user?.fullname || "N/A"}</td>
                  <td>{report.reason}</td>
                  <td>{report.status}</td>
                  <td>{new Date(report.createAt).toLocaleDateString()}</td>
                  <td>{report.content || "N/A"}</td>
                  <td>
                    <button
                      className="add-btn"
                      onClick={() => handleViewDetail(report)}
                    >
                      Details
                    </button>
                    <button
                      className="add-btn"
                      onClick={() => deleteReport(report._id)}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {isModalOpen && selectedReport && (
        <div className="overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Report Details</h4>
            <p>
              <strong>Song:</strong> {selectedReport.song?.title || "N/A"}
            </p>
            <p>
              <strong>User:</strong> {selectedReport.user?.fullname || "N/A"}
            </p>
            <p>
              <strong>Reason:</strong> {selectedReport.reason}
            </p>
            <p>
              <strong>Status:</strong> {selectedReport.status}
            </p>
            <button onClick={handleCloseModal} className="close-btn">
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagement;
