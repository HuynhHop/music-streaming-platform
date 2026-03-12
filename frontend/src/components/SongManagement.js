import React, { useEffect, useState } from "react";
import "./SongManagement.css";
import SongDetailForm from "./SongDetailForm";
import axios from "axios";

const SongManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [songs, setSongs] = useState([]);

  const handleFetchAllSongs = async () => {
    const accessToken = localStorage.getItem("accessToken");
    console.log("Access Token:", accessToken);

    try {
      const response = await axios.get("http://localhost:5000/api/songs", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      setSongs(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  };

  useEffect(() => {
    handleFetchAllSongs();
  }, []);

  const handleViewDetail = (song) => {
    setSelectedSong(song);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSong(null);
  };

  const handleDeleteSong = async (songId) => {
    try {
      // Call API to delete the song
      const response = await axios.delete(
        `http://localhost:5000/api/songs/${songId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      // Remove the song from the state after deletion
      setSongs((prevSongs) => prevSongs.filter((song) => song.id !== songId));
      setIsModalOpen(false);
      alert("Song deleted successfully");
      reloadSongs();
    } catch (error) {
      console.error("Error deleting song:", error);
      alert("Error deleting song");
    }
  };

  const handleBlockSong = async (songId) => {
    try {
      // Call API to block the song
      const response = await axios.delete(
        `http://localhost:5000/api/songs/${songId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      // Update the song state to reflect the block status
      setSongs((prevSongs) =>
        prevSongs.map((song) =>
          song.id === songId ? { ...song, isBlocked: true } : song
        )
      );
      setIsModalOpen(false);
      alert("Song blocked successfully");
      reloadSongs();
    } catch (error) {
      console.error("Error blocking song:", error);
      alert("Error blocking song");
    }
  };

  const reloadSongs = async () => {
    handleFetchAllSongs();
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value); // Update the status filter
  };

  const filteredSongs = songs.filter((song) => {
    const matchesSearch = song.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && !song.isDeleted && !song.isBlocked) ||
      (statusFilter === "blocked" && song.isBlocked) ||
      (statusFilter === "deleted" && song.isDeleted);
    return matchesSearch && matchesStatus;
  });

  const sortedSongs = filteredSongs.sort((a, b) =>
    sortOrder === "asc"
      ? new Date(a.createAt) - new Date(b.createAt)
      : new Date(b.createAt) - new Date(a.createAt)
  );

  return (
    <div className="management-section">
      <h3>Manage Songs</h3>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search songs..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="search-input"
      />

      {/* Status Filter */}
      <select
        value={statusFilter}
        onChange={handleStatusFilterChange}
        className="status-filter"
      >
        <option value="all">All Statuses</option>
        <option value="active">Active</option>
        <option value="blocked">Blocked</option>
        <option value="deleted">Deleted</option>
      </select>

      {/* Sort button 
      <button onClick={handleSortChange} className="sort-btn">
        Sort by Date ({sortOrder === "asc" ? "Ascending" : "Descending"})
      </button>*/}

      {/* Scrollable Table Container */}
      <div className="scrollable-table-container">
        <table className="songs-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Creator</th>
              <th>Artist</th>
              <th>Type</th>
              <th>Total Plays</th>
              <th>Status</th>
              <th>Date Create</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedSongs.map((song) => (
              <tr key={song.id}>
                <td>{song.title}</td>
                <td>{song.creator.fullname}</td>
                <td>{song.artist.fullName}</td>
                <td>{song.type}</td>
                <td>{song.totalPlays}</td>
                <td>
                  {song.isDeleted && song.isBlocked ? (
                    <span style={{ color: "purple" }}>Blocked & Deleted</span>
                  ) : song.isDeleted ? (
                    <span style={{ color: "red" }}>Deleted</span>
                  ) : song.isBlocked ? (
                    <span style={{ color: "orange" }}>Blocked</span>
                  ) : (
                    <span style={{ color: "green" }}>Active</span>
                  )}
                </td>
                <td>{new Date(song.createdAt).toLocaleDateString()}</td>
                <td>
                  {/* Disable the 'View Details' button if song is deleted */}
                  <button
                    className="view-detail-btn"
                    onClick={() => handleViewDetail(song)}
                    disabled={song.isDeleted}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedSong && (
        <div className="overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <SongDetailForm song={selectedSong} />
            <div className="modal-actions">
              {/* Show the delete button only if song is deleted and blocked */}
              <button
                className="delete-btn"
                onClick={() => handleDeleteSong(selectedSong._id)}
                disabled={selectedSong.isDeleted}
              >
                Delete
              </button>
              {/* Always show block button */}
              <button
                className="block-btn"
                onClick={() => handleBlockSong(selectedSong._id)}
              >
                {selectedSong.isBlocked ? "Already Blocked" : "Block"}
              </button>
            </div>
            <button className="close-btn" onClick={handleCloseModal}>
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SongManagement;
