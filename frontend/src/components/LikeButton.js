// src/components/LikeButton.js
import React from 'react';

const LikeButton = ({ likes, onLike }) => {
  return (
    <button onClick={onLike} className="like-button">
      Like {likes}
    </button>
  );
};

export default LikeButton;
