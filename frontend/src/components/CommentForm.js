import React, { useState } from 'react';

const CommentForm = ({ addComment }) => {
  const [comment, setComment] = useState('');

  const handleCommentChange = (e) => setComment(e.target.value);

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      addComment(comment); 
      setComment('');
    }
  };

  return (
    <div className="song-info-comment-form">
      <textarea
        placeholder="Viết bình luận..."
        value={comment}
        onChange={handleCommentChange}
      />
      <button onClick={handleCommentSubmit} className="song-info-comment-submit">
        Gửi
      </button>
    </div>
  );
};

export default CommentForm;
