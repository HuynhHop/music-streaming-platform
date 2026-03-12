import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation, useParams } from 'react-router-dom';
import SongItemV2 from './SongItemV2';  // Component để hiển thị từng bài hát
import { AuthContext } from '../context/AuthContext'; // Để lấy token xác thực
import './PlayListInfo.css';
import {FaShare } from 'react-icons/fa';
import ShareForm from '../components/ShareForm';

const PlaylistPage = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Lấy ID playlist từ URL
    const location = useLocation();
    const { playlist: initialPlaylist } = location.state || { playlist: null };
    const { authState } = useContext(AuthContext); // Để lấy thông tin xác thực từ context
    const [playlist, setPlaylist] = useState(initialPlaylist);
    const enableDelete = playlist && authState.user && playlist.creator && authState.user._id === playlist.creator._id ; // Cho phép xóa nếu user là người tạo playlist
    const [isDeleting, setIsDeleting] = useState(false); // State để quản lý trạng thái xóa
    const [songToDelete, setSongToDelete] = useState(null); // Lưu ID bài hát cần xóa

    const shareLink = window.location.href;
    const [showShareForm, setShowShareForm] = useState(false);
    // Hàm lấy thông tin playlist từ API
    const getPlaylistById = async (playlistId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/playlists/${playlistId}`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${authState.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const playlist = await response.json();
                setPlaylist(playlist);
            } else {
                console.error("Error getting playlist:", response.statusText);
            }
        } catch (error) {
            console.error("Error getting playlist:", error);
        }
    };

    // Hàm xóa bài hát khỏi playlist
    const deleteSongFromPlaylist = async (songId) => {
        console.log("Deleting song:", songId, "from playlist:", id);
        try {
            const response = await fetch(`http://localhost:5000/api/playlists/${id}/song/${songId}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${authState.accessToken}`,
                    'Content-Type': 'application/json',
                }, body: JSON.stringify({ playlistId: id, songId }),

            });
            if (response.ok) {
                setPlaylist(prevPlaylist => ({
                    ...prevPlaylist,
                    songs: prevPlaylist.songs.filter(song => song._id !== songId),
                }));
                setSongToDelete(null); // Reset songToDelete
                setIsDeleting(false);  // Close confirm dialog
            } else {
                console.error("Error deleting song:", response.statusText);
            }
        } catch (error) {
            console.error("Error deleting song:", error);
        }
    };

    // Hàm xác nhận xóa bài hát
    const handleDeleteConfirm = (songId) => {
        setIsDeleting(true);
        setSongToDelete(songId);
    };

    const handleDeleteCancel = () => {
        setIsDeleting(false);
        setSongToDelete(null);
    };

    // Gọi hàm getPlaylistById khi component được mount hoặc ID thay đổi
    useEffect(() => {
        if (!playlist) {
            getPlaylistById(id);
        }
    }, [id, playlist]);

    if (!playlist) {
        return <p>Loading playlist data...</p>;
    }

    const handleSongClick = (song) => {
        navigate(`/song/${song._id}`, { state: { song } });
    };

    const toggleShareForm = () => {
        setShowShareForm(!showShareForm);
    };

    const handleCloseShareForm = () => {
        setShowShareForm(false);
    };

    return (
        <div className="playlist-page">
            <div className="playlist-container">
                <div className="playlist-info">
                    <h1>{playlist.title}</h1>
                    <p><strong>Creator:</strong> {playlist.creator.fullname}</p>
                    <p><strong>Description:</strong> {playlist.desc}</p>
                    <p><strong>Created At:</strong> {new Date(playlist.createAt).toLocaleString()}</p>
                    
                    {/* Nút Share */}
                    
                    <button onClick={toggleShareForm} className="song-info-share-button">
                        <FaShare />
                    </button>
                </div>

                <div className="songs-list">
                    <h2>Danh sách bài hát trong playlist</h2>
                    {playlist.songs && playlist.songs.length > 0 ? (
                        <ul>
                            {playlist.songs.map((song) => (
                                <SongItemV2
                                    key={song._id}
                                    song={song}
                                    onSongClick={handleSongClick}
                                    onDelete={() => handleDeleteConfirm(song._id)}
                                    enableDelete={enableDelete}
                                />
                            ))}
                        </ul>
                    ) : (
                        <p>No songs available in this playlist.</p>
                    )}
                </div>

                {/* Modal xác nhận xóa */}
                {isDeleting && (
                    <div className="confirm-delete-modal">
                        <div className="modal-content">
                            <h3>Are you sure you want to delete this song?</h3>
                            <button onClick={() => deleteSongFromPlaylist(songToDelete)}>Yes</button>
                            <button onClick={handleDeleteCancel}>No</button>
                        </div>
                    </div>
                )}
                {showShareForm && 
                <ShareForm shareLink={shareLink}
                onClose={handleCloseShareForm}
                />}
            </div>
        </div>
    );
};

export default PlaylistPage;
