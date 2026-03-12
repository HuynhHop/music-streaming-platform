import React from "react";
import "./SongDetailForm.css";

const SongDetailForm = ({ song }) => {
  return (
    <div className="song-detail-form">
      <h4>Song Details</h4>
      <form>
        <div className="form-group">
          <label>Title</label>
          <p>{song.title}</p>
        </div>
        <div className="form-group">
          <label>Artist</label>
          <p>{song.artist.fullName}</p>
        </div>
        <div className="form-group">
          <label>Type</label>
          <p>{song.type}</p>
        </div>
        <div className="form-group">
          <label>Description</label>
          <p>{song.description}</p>
        </div>
        <div className="form-group">
          <label>Lyrics</label>
          <p>{song.lyrics}</p>
        </div>
        <div className="form-group">
          <label>Creator</label>
          <p>{song.creator.fullname}</p>
        </div>
        <div className="form-group">
          <label>Link to Image</label>
          <img src={song.linkImg} alt="Song" />
        </div>
        <div className="form-group">
          <label>Link to Song</label>
          <a href={song.linkSong} target="_blank" rel="noopener noreferrer">
            Listen to the Song
          </a>
        </div>
        <div className="form-group">
          <label>Created At</label>
          <p>{song.createAt}</p>
        </div>
        <div className="form-group">
          <label>Updated At</label>
          <p>{song.updateAt}</p>
        </div>
        <div className="form-group">
          <label>Status</label>
          <p>{song.isDeleted ? "Deleted" : "Active"}</p>
          <p>{song.isBlocked ? "Blocked" : "Not Blocked"}</p>
        </div>
        <div className="form-group">
          <label>Total Plays</label>
          <p>{song.totalPlays}</p>
        </div>
      </form>
    </div>
  );
};

export default SongDetailForm;
