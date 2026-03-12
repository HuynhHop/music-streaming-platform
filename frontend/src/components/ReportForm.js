import React, { useState } from 'react';
import './ReportForm.css';

const ReportForm = ({ onSubmit, onClose }) => {
  const [reason, setReason] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason) {
      alert('Vui lòng chọn lý do báo cáo!');
      return;
    }
    
    onSubmit(reason, content);
    setReason('');
    setContent('');
  };

  return (
    <div className="report-form-modal">
      <div className="report-form-container">
        <h2 className="report-form-title">Báo cáo vấn đề</h2>
        <form onSubmit={handleSubmit}>
          <div className="report-form-group">
            <label htmlFor="reason">Lý do báo cáo:</label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="report-select"
            >
              <option value="">Chọn lý do</option>
              <option value="Spam">Spam</option>
              <option value="Nội dung xấu">Nội dung xấu</option>
              <option value="Sao chép vi phạm bản quyền">Sao chép vi phạm bản quyền</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div className="report-form-group">
            <label htmlFor="description">Mô tả chi tiết (tùy chọn):</label>
            <textarea
              id="description"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập mô tả chi tiết"
              className="report-textarea"
            />
          </div>

          <div className="report-form-actions">
            <button type="submit" className="btn submit-button">Gửi báo cáo</button>
            <button type="button" className="btn close-button" onClick={onClose}>Đóng</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportForm;
