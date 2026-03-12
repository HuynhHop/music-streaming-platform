import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import PasswordResetForm from '../components/PasswordResetForm';
import DeleteAccountConfirm from '../components/DeleteAccountConfirm';

// Enum for gender
const EGender = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
};

const ProfilePage = () => {
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordResetVisible, setIsPasswordResetVisible] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(true);

  // State to manage followers and followings
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowings, setShowFollowings] = useState(false);

  // Load user data from localStorage
  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem('userdata'));
    if (storedUserData) {
      const formattedBirthday = new Date(storedUserData.birthday).toLocaleDateString('en-GB'); // Format birthday

      const filteredData = {
        fullName: storedUserData.fullname,
        email: storedUserData.email,
        phone: storedUserData.phone,
        gender: storedUserData.gender,
        birthday: formattedBirthday, // Display formatted birthday
        desc: storedUserData.desc,
      };

      setFormData(filteredData);
    }
  }, []);

  // Fetch followers based on user ID
  const fetchFollowers = async () => {
    const userId = JSON.parse(localStorage.getItem('userdata'))._id;
    try {
      const response = await fetch(`http://localhost:5000/api/follows/followers/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setFollowers(data.followers);
        setShowFollowers(true);
      } else {
        console.error("Error fetching followers:", data.message);
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };

  // Fetch followings based on user ID
  const fetchFollowings = async () => {
    const userId = JSON.parse(localStorage.getItem('userdata'))._id;
    try {
      const response = await fetch(`http://localhost:5000/api/follows/following/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setFollowings(data.following);
        setShowFollowings(true);
      } else {
        console.error("Error fetching followings:", data.message);
      }
    } catch (error) {
      console.error("Error fetching followings:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const cancelPasswordReset = () => {
    setIsPasswordResetVisible(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Profile updated:', formData);
  };

  const handleDeleteAccount = () => {
    setIsDeleteConfirmVisible(true);
  };

  const handlePasswordReset = (newPassword) => {
    setIsPasswordResetVisible(false);
    console.log('Password reset to:', newPassword);
  };

  const confirmDelete = () => {
    console.log('Account deleted');
    setIsDeleteConfirmVisible(false);
  };

  const cancelDelete = () => {
    setIsDeleteConfirmVisible(false);
  };

  const handleMouseLeave = () => {
    setIsMenuVisible(false);
  };

  const handleMouseEnter = () => {
    setIsMenuVisible(true);
  };

  return (
    <div
      className="profile-page"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <h2>Thông tin cá nhân</h2>
      <form onSubmit={handleSubmit}>
        {Object.keys(formData).map((key) => (
          <div className="profile-page__field" key={key}>
            <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
            {key === 'gender' ? (
              <select
                id={key}
                name={key}
                value={formData[key]}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Other">Khác</option>
              </select>
            ) : (
              <input
                type={key === 'birthday' ? 'date' : 'text'}
                id={key}
                name={key}
                value={key === 'birthday' ? formData[key].split('/').reverse().join('-') : formData[key]} // Revert formatted date to 'YYYY-MM-DD' when editing
                onChange={handleChange}
                disabled={!isEditing}
              />
            )}
          </div>
        ))}
        <div className="profile-page__field">
          <button type="submit" style={{ display: isEditing ? 'block' : 'none' }}>
            Cập nhật thông tin
          </button>
          {!isEditing && <button type="button" onClick={() => setIsEditing(true)}>Chỉnh sửa</button>}
        </div>

        <div className="profile-page__section">
          <button type="button" onClick={() => setIsPasswordResetVisible(true)}>
            Đổi mật khẩu
          </button>

          <button type="button" onClick={handleDeleteAccount}>
            Xóa tài khoản
          </button>
        </div>

        <div className="profile-page__section">
          <button type="button" onClick={fetchFollowers}>
            Xem Người Theo Dõi
          </button>
          <button type="button" onClick={fetchFollowings}>
            Xem Đang Theo Dõi
          </button>
        </div>

        {/* Followers Modal */}
        {showFollowers && (
          <div className="followers-list">
            <h3>Người Theo Dõi</h3>
            <ul>
              {followers.map((follower, index) => (
                <li key={index}>
                  {follower.fullname} - {follower.email}
                </li>
              ))}
            </ul>
            <button onClick={() => setShowFollowers(false)}>Đóng</button>
          </div>
        )}

        {/* Followings Modal */}
        {showFollowings && (
          <div className="followers-list">
            <h3>Đang Theo Dõi</h3>
            <ul>
              {followings.map((following, index) => (
                <li key={index}>
                  {following.fullname} - {following.email}
                </li>
              ))}
            </ul>
            <button onClick={() => setShowFollowings(false)}>Đóng</button>
          </div>
        )}

      </form>

      {/* Password Reset Form */}
      {isPasswordResetVisible && (
        <PasswordResetForm onPasswordReset={handlePasswordReset}
        onCancel={cancelPasswordReset}
         />
      )}

      {/* Delete Account Confirmation */}
      {isDeleteConfirmVisible && (
        <DeleteAccountConfirm
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
};

export default ProfilePage;
