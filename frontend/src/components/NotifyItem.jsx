import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './NotifyItem.css';

class NotifyItem extends Component {
  render() {
    const { content, createAt, isRead } = this.props;

    return (
      <div className={`notify-item ${isRead ? 'read' : 'unread'}`}>
        <p className="notify-content">{content}</p>
        <span className="notify-time">{new Date(createAt).toLocaleString()}</span>
        {!isRead && <span className="unread-indicator">•</span>} 
      </div>
    );
  }
}

NotifyItem.propTypes = {
  content: PropTypes.string.isRequired,
  createAt: PropTypes.string.isRequired,
  isRead: PropTypes.bool.isRequired,
};

export default NotifyItem;
