// src/components/ImageSlider.js
import React, { useState, useEffect } from 'react';
import backIcon from '../public/images/back-icon.svg';
import nextIcon from '../public/images/next-icon.svg';
import ImageSlider1 from '../public/images/1.png';
import ImageSlider2 from '../public/images/2.png';
import ImageSlider3 from '../public/images/3.png';
import ImageSlider4 from '../public/images/4.jpg';
import './ImageSlider.css'; // Import CSS file

const ImageSlider = () => {
  const images = [ImageSlider1, ImageSlider2, ImageSlider3, ImageSlider4];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval); 
  }, [images.length]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="slider-container">
      <button onClick={prevImage} className="slider-button slider-button-left">
        <img 
          src={backIcon} 
          alt="Previous" 
          className="notification-icon" 
        />
      </button>
      <img src={images[currentImageIndex]} alt="Slider" className="slider-image" />
      <button onClick={nextImage} className="slider-button slider-button-right">
        <img 
          src={nextIcon} 
          alt="Next" 
          className="notification-icon" 
        />
      </button>
    </div>
  );
};

export default ImageSlider;
