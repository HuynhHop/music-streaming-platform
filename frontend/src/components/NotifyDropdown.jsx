import React, { Component } from 'react';
import notificationIcon from '../public/images/notification-icon.svg';
import NotifyItem from './NotifyItem';  // Import NotifyItem
import './NotifyDropdown.css';

class NotifyDropdown extends Component {
  render() {
    const { notifications, handleClick } = this.props;

    const sortedNotifications = notifications.sort((a, b) => new Date(b.createAt) - new Date(a.createAt));

    return (
      <div className="notification">
        <button className="notification-btn">
          <img 
            src={notificationIcon} 
            alt="Thông báo" 
            className="notification-icon" 
          />
          {notifications.filter(notification => !notification.isRead).length > 0 && (
            <span className="notification-count">
              {notifications.filter(notification => !notification.isRead).length}
            </span>
          )}
        </button>
        {notifications.length > 0 && (
          <div className="notification-dropdown-menu"> 
            {sortedNotifications.map((notification, index) => (
              <div 
                key={index} 
                className="link dropdown-menu-item"
                onClick={() => handleClick(notification)} 
              >
                <NotifyItem 
                  content={notification.content}
                  createAt={notification.createAt}
                  isRead={notification.isRead}
                />
              </div>
            ))}
          </div>
        )}
        {notifications.length === 0 && (
          <div className="notification-dropdown-menu">
            <p className="link dropdown-menu-item">Không có thông báo</p>
          </div>
        )}
      </div>
    );
  }
}

export default NotifyDropdown;
