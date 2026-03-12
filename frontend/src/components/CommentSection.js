import React from 'react';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

const CommentSection = ({ comments = [], onAddComment, onEditComment, onDeleteComment }) => {
  const sortedComments = [...comments].sort((a, b) => new Date(b.createAt) - new Date(a.createAt));

  return (
    <div className="song-info-comments-section">
      <h2>Bình luận</h2>
      <CommentForm addComment={onAddComment} />
        {comments.length > 0 && (
      <div className="song-info-comments-list">
          {sortedComments.map(comment => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onEdit={onEditComment}
              onDelete={onDeleteComment}
            />
          ))}
      </div>)}
    </div>
  );
};

export default CommentSection;
