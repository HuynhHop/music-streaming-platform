import React, { useState } from 'react';
import './PasswordResetForm.css';

const PasswordResetForm = ({ onPasswordResetSuccess, onCancel }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordReset = async () => {
    const accessToken = localStorage.getItem('accessToken'); // Get accessToken from localStorage
    const userdata = JSON.parse(localStorage.getItem('userdata')); // Parse userdata from localStorage
    const userId = userdata?._id; // Extract `_id` from parsed userdata

    if (!userId) {
      console.error('User ID not found in localStorage!');
      alert('User ID is missing. Please try logging in again.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Mật khẩu mới không khớp!');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/resetPassword', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`, // Send accessToken in headers
        },
        body: JSON.stringify({
          userId,
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Đổi mật khẩu thành công!');
        onPasswordResetSuccess(); // Callback for success
      } else {
        alert(data.message || 'Đổi mật khẩu thất bại!');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      // alert('Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  return (
    <div className="profile-page__password-reset show">
      <div className="profile-page__password-reset-content">
        <h3>Đổi mật khẩu</h3>
        <input
          type="password"
          placeholder="Mật khẩu hiện tại"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button className="delete-button" onClick={handlePasswordReset}>
          Xác nhận
        </button>
        <button className="cancel-button" onClick={onCancel}>
          Hủy
        </button>
      </div>
    </div>
  );
};

export default PasswordResetForm;
