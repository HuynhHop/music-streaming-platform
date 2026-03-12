import React, { useState } from 'react';
import './ShareForm.css'; // Đảm bảo không có dấu "s" thừa

const ShareForm = ({ shareLink, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(shareLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      })
      .catch((err) => console.error('Failed to copy text: ', err));
  };

  return (
    <div>
      {/* Lớp overlay */}
      <div className="share-form-overlay" onClick={onClose}></div>

      {/* ShareForm */}
      <div className="share-form">
        {/* Nút đóng */}
        <button className="close-button" onClick={onClose}>
          &times; {/* Biểu tượng dấu X */}
        </button>
        <h4>Share this link</h4>
        <input 
          type="text" 
          value={shareLink} 
          readOnly 
          className="share-link-input" 
        />
        <button onClick={handleCopyClick}>
          {copied ? 'Copied!' : 'Copy Link'}
        </button>

        {/* Optional: You can add more buttons here for social sharing */}
        <button onClick={() => window.open(`mailto:?subject=Check this out&body=${shareLink}`, '_blank')}>
          Share via Email
        </button>
        <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${shareLink}`, '_blank')}>
          Share on Twitter
        </button>
        <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareLink}`, '_blank')}>
          Share on Facebook
        </button>
      </div>
    </div>
  );
};

export default ShareForm;
