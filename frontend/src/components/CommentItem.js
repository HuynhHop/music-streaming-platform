import React, { useState, useContext } from 'react';
import './CommentItem.css';
import { AuthContext } from '../context/AuthContext';

const CommentItem = ({ comment, onEdit, onDelete }) => {
  const { _id, content, createAt } = comment;
  const { authState } = useContext(AuthContext);
  const { user } = authState;
  const [isEditing, setIsEditing] = useState(false);
  const [newContent, setNewContent] = useState(content);

  const handleEditChange = (e) => setNewContent(e.target.value);

  const handleEditSubmit = () => {
    onEdit(_id, newContent);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa bình luận này không?');
    if (confirmDelete) {
      onDelete(_id);
    }
  };

  return (
    <div className="song-info-comment-item">
      <p className="song-info-comment-text">
        <strong>{comment.user.fullname}</strong> ({new Date(createAt).toLocaleString()}):
        {isEditing ? (
          <div>
            <textarea value={newContent} onChange={handleEditChange} />
            <button onClick={handleEditSubmit}>Lưu</button>
          </div>
        ) : (
          content
        )}
      </p>
      {user._id === comment.user._id && (
          <div className="comment-actions">
          <button onClick={() => setIsEditing(!isEditing)} className="edit-button">
            {isEditing ? 'Hủy' : 'Sửa'}
          </button>
          <button onClick={handleDeleteClick} className="delete-button">Xóa</button>
        </div>
      )}
    </div>
  );
};

export default CommentItem;
