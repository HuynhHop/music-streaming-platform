// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullname: '',
    email: '',
    phone: '',
    gender: 'Male', // Default to Male
    birthday: '',
    desc: '',
  });

  const [error, setError] = useState('');

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.email || !formData.password || !formData.username) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    try {
      console.log("Sending data:", formData);  // Log form data

      // Send data to the server
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status);  // Log response status

      const data = await response.json();
      console.log("Response data:", data);  // Log the response data

      if (response.ok) {
        // If registration is successful, redirect to login page
        navigate('/login');
      } else {
        // Display error message from server if any
        setError(data.message || 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('An error occurred during registration:', err);  // Log errors
      setError('Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.');
    }
  };

  return (
    <div className="register-page-container">
      <h2>Đăng Ký</h2>

      <form className="register-form" onSubmit={handleSubmit}>
        <div className="register-form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="register-form-group">
          <label htmlFor="password">Mật khẩu</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="register-form-group">
          <label htmlFor="username">Tên đăng nhập</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="register-form-group">
          <label htmlFor="fullName">Họ và Tên</label>
          <input
            type="text"
            id="fullname"
            name="fullname"
            value={formData.fullname}
            onChange={handleInputChange}
          />
        </div>
        <div className="register-form-group">
          <label htmlFor="gender">Giới tính</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
          >
            <option value="Male">Nam</option>
            <option value="Female">Nữ</option>
            <option value="Other">Khác</option>
          </select>
        </div>
        <div className="register-form-group">
          <label htmlFor="birthday">Ngày sinh</label>
          <input
            type="date"
            id="birthday"
            name="birthday"
            value={formData.birthday}
            onChange={handleInputChange}
          />
        </div>
        <div className="register-form-group">
          <label htmlFor="phone">Số điện thoại</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
        </div>
        <div className="register-form-group">
          <label htmlFor="desc">Mô tả</label>
          <input
            type="text"
            id="desc"
            name="desc"
            value={formData.desc}
            onChange={handleInputChange}
          />
        </div>

        {error && <div className="register-error-message">{error}</div>}

        <button className="register-submit-btn" type="submit">Đăng Ký</button>
      </form>

      <div className="register-additional-links">
        <p>
          Đã có tài khoản? <a href="/login">Đăng nhập</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
