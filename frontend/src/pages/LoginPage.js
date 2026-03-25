// src/pages/LoginPage.js
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { AuthContext } from '../context/AuthContext';
const ETypeRole = require("../enums/ETypeRole");

const LoginPage = () => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const { authState, login } = useContext(AuthContext);  // Lấy authState từ context
  const [role, setRole] = useState(null); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');


  useEffect(() => {
    if (authState.isAuthenticated) {
      const redirectPath = authState.role === ETypeRole.ADMIN ? '/admin-dashboard' : '/user-dashboard';
      navigate(redirectPath); 
    }
  }, [authState, navigate]);

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole); // 1 = admin, 2 = user
    setError(''); // Xóa lỗi khi thay đổi vai trò
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const tempRole = parseInt(role);
        if (
          (data.userData.role === ETypeRole.ADMIN && tempRole === ETypeRole.ADMIN) ||
          (data.userData.role === ETypeRole.USER && tempRole === ETypeRole.USER)
        ) {
          login(data.userData, data.userData.role, data.accessToken); // Lưu trạng thái đăng nhập vào context
          navigate(
            tempRole === ETypeRole.ADMIN ? '/admin-dashboard' : '/user-dashboard'
          );
        } else {
          setError('Vai trò không phù hợp với tài khoản này');
        }
      } else {
        setError(data.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } catch (error) {
      setError('Đã xảy ra lỗi khi kết nối đến máy chủ');
    }
  };

  return (
    <div className="login-container">
      <h2>Đăng Nhập</h2>

      {/* Chọn vai trò */}
      <div className="role-selector">
        <button
          className={role === ETypeRole.USER ? 'active' : ''}
          onClick={() => handleRoleChange(2)} // User role = 2
        >
          User
        </button>
        <button
          className={role === ETypeRole.ADMIN ? 'active' : ''}
          onClick={() => handleRoleChange(1)} // Admin role = 1
        >
          Admin
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Tên đăng nhập</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Mật khẩu</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit">Đăng Nhập</button>
        <a href="/forgot-password">Quên mật khẩu?</a>
      </form>

      {/* Liên kết đăng ký và quên mật khẩu */}
      <div className="additional-links">
        Chưa có tài khoản?
        <a href="/register">Đăng ký</a>
      </div>
    </div>
  );
};

export default LoginPage;
