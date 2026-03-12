import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation, useParams } from 'react-router-dom';
import SongItemV2 from './SongItemV2';
import { AuthContext } from '../context/AuthContext';
import "./AlbumInfo.css";
import {FaShare } from 'react-icons/fa';
import ShareForm from '../components/ShareForm';

const AlbumPage = () => {
    const navigate = useNavigate();
    const { id } = useParams(); 
    const location = useLocation();
    const { album: initialAlbum } = location.state || { album: null };
    const { authState } = useContext(AuthContext);

    const [album, setAlbum] = useState(initialAlbum);
    const shareLink = window.location.href;
    const [showShareForm, setShowShareForm] = useState(false);

    const getAlbumById = async (albumId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/albums/${albumId}`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${authState.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const album = await response.json();
                setAlbum(album); 
            } else {
                console.error("Error getting album:", response.statusText);
            }
        } catch (error) {
            console.error("Error getting album:", error);
        }
    };

    useEffect(() => {
        if (!album) {
            getAlbumById(id);  
        }
    }, [id, album]);  

    if (!album) {
        return <p>Loading album data...</p>;  
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
        <div className="album-page">
            <div className="album-container">
                <div className="album-info">
                    <h1>{album.title}</h1>
                    <img src={album.linkImg} alt={album.title} className="album-image" />
                    <p><strong>Creator:</strong> {album.creator.fullname}</p>
                    <p><strong>Description:</strong> {album.desc}</p>
                    <p><strong>Created At:</strong> {new Date(album.createAt).toLocaleString()}</p>
                </div>
                
                <div className="songs-list">
                    <div className='song-title'>
                    <h2>Danh sách bài hát trong album</h2>
                    <button onClick={toggleShareForm} className="song-info-share-button">
                        <FaShare />
                    </button>
                    </div>
                    {album.songs && album.songs.length > 0 ? (
                        <ul>
                            {album.songs.map((song) => (
                                <SongItemV2 key={song._id} song={song}  onSongClick={handleSongClick} />
                            ))}
                        </ul>
                    ) : (
                        <p>No songs available in this album.</p>
                    )}
                </div>
                {showShareForm && 
                <ShareForm shareLink={shareLink}
                onClose={handleCloseShareForm}
                />}
            </div>
        </div>
    );
};

export default AlbumPage;
