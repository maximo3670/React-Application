import React from 'react';
import { Link } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/home.css"


function Home() {
  const bannerImages = [
    "https://via.placeholder.com/1200x400/06647d/333333?text=Banner+1", 
    "https://via.placeholder.com/1200x400/06647d/333333?text=Banner+2", 
    "https://via.placeholder.com/1200x400/06647d/333333?text=Banner+3"
  ];

    // Carousel settings
    const settings = {
      dots: true, // Enable dots for navigation
      infinite: true, // Enable infinite scrolling
      speed: 500, // Transition speed in milliseconds
      slidesToShow: 1, // Show one slide at a time
      slidesToScroll: 1, // Scroll one slide at a time
      autoplay: true, // Enable auto-play for the carousel
      autoplaySpeed: 3000, // Time between slides in milliseconds
      arrows: true // Enable left and right arrows for navigation
    };

    return (
    <div>
      <div>
      {/* Slider for the banner images */}
      <Slider {...settings} className="banner-slider">
          {bannerImages.map((image, index) => (
            <div key={index}>
              <img src={image} alt={`Banner ${index + 1}`} style={{ width: '100%', height: 'auto' }} />
            </div>
          ))}
      </Slider>
      </div>
      <div id='home-container'>
          <h1>Welcome to Cliple</h1>
          <div>
            <p>Share your best gaming clips with your friends to compete for points</p>
            <p>You will vote on each others clips to determine which is the best!</p>
            <p>To get started create a free account today</p>
          </div>
          <div id='button-container'>
            <Link to="/register" className='buttons'>Sign up!</Link>
          </div>
      </div>
    </div>
    );
  }
  
  export default Home;