import React, { useState } from 'react';
import './ContactPage.css'; // Import file CSS

const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thông tin liên hệ: \nTên: ${name} \nEmail: ${email} \nTin nhắn: ${message}`);
  };

  return (
    <div className="contact-form-container">
      <h2>Liên hệ với chúng tôi</h2>

      {/* Thông tin nhóm */}
      <div className="info-box">
        <h3>Thông tin nhóm</h3>
        <p><strong>Tên nhóm:</strong> Nhóm 18 </p>
        <p><strong>Môn:</strong> </p>
        <p><strong>Điện thoại:</strong> </p>
        <p><strong>Email:</strong> </p>
      </div>

      <form onSubmit={handleSubmit} className="contact-form">
        <div className="input-container">
          <label>Tên</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên của bạn"
            required
          />
        </div>
        <div className="input-container">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email của bạn"
            required
          />
        </div>
        <div className="input-container">
          <label>Tin nhắn</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nhập tin nhắn của bạn"
            required
          ></textarea>
        </div>
        <button type="submit" className="submit-btn">Gửi</button>
      </form>
    </div>
  );
};

export default ContactPage;
