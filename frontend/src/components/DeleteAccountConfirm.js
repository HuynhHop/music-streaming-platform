import React from 'react';
import { useNavigate } from 'react-router-dom';

const DeleteAccountConfirm = ({ onDeleteSuccess, onCancel }) => {
  const navigate = useNavigate(); // React Router's navigation hook

  const modalStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  };

  const contentStyles = {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    width: '300px',
  };

  const buttonStyles = {
    padding: '10px 20px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    margin: '10px',
  };

  const deleteButtonStyles = {
    ...buttonStyles,
    backgroundColor: '#e74c3c',
    color: '#fff',
  };

  const cancelButtonStyles = {
    ...buttonStyles,
    backgroundColor: '#bdc3c7',
    color: '#fff',
  };

  const handleDelete = async () => {
    const userdata = JSON.parse(localStorage.getItem('userdata'));
    const userId = userdata?._id;
    const accessToken = localStorage.getItem('accessToken');

    if (!userId) {
      alert('Không tìm thấy ID người dùng! Vui lòng thử lại.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        alert('Xóa tài khoản thành công!');
        localStorage.clear(); // Clear localStorage
        navigate('/login'); // Navigate to the login page
        if (onDeleteSuccess) onDeleteSuccess(); // Notify parent if needed
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Xóa tài khoản thất bại!');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại sau!');
    }
  };

  return (
    <div style={modalStyles}>
      <div style={contentStyles}>
        <h3>Bạn có chắc chắn muốn xóa tài khoản?</h3>
        <button style={deleteButtonStyles} onClick={handleDelete}>
          Xóa
        </button>
        <button style={cancelButtonStyles} onClick={onCancel}>
          Hủy
        </button>
      </div>
    </div>
  );
};

export default DeleteAccountConfirm;
