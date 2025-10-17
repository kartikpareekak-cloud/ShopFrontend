import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Company Info */}
        <div className="footer-section">
          <h3 className="footer-heading">🚗 Mahalaxmi Automobile</h3>
          <p className="footer-description">
            Your trusted source for quality automotive parts. We provide genuine parts for all major brands with warranty and expert support.
          </p>
          <div className="footer-social">
            <a href="#" className="social-icon" aria-label="Facebook">
              <i className="fab fa-facebook-f">📘</i>
            </a>
            <a href="#" className="social-icon" aria-label="Twitter">
              <i className="fab fa-twitter">🐦</i>
            </a>
            <a href="#" className="social-icon" aria-label="Instagram">
              <i className="fab fa-instagram">📷</i>
            </a>
            <a href="#" className="social-icon" aria-label="LinkedIn">
              <i className="fab fa-linkedin-in">💼</i>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3 className="footer-heading">Quick Links</h3>
          <ul className="footer-links">
            <li><a href="/">Home</a></li>
            <li><a href="/products">Products</a></li>
            <li><a href="/cart">Cart</a></li>
            <li><a href="/orders">My Orders</a></li>
            <li><a href="/admin">Admin Panel</a></li>
          </ul>
        </div>

        {/* Categories */}
        <div className="footer-section">
          <h3 className="footer-heading">Categories</h3>
          <ul className="footer-links">
            <li><a href="/products?category=Engine">Engine Parts</a></li>
            <li><a href="/products?category=Brakes">Brakes</a></li>
            <li><a href="/products?category=Electrical">Electrical</a></li>
            <li><a href="/products?category=Accessories">Accessories</a></li>
            <li><a href="/products?category=Body Parts">Body Parts</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h3 className="footer-heading">Contact Us</h3>
          <ul className="footer-contact">
            <li>
              <span className="contact-icon">📍</span>
              <span>123 Auto Street, Mumbai, MH 400001</span>
            </li>
            <li>
              <span className="contact-icon">📞</span>
              <span>+91 98765 43210</span>
            </li>
            <li>
              <span className="contact-icon">✉️</span>
              <span>support@mahalaxmi.com</span>
            </li>
            <li>
              <span className="contact-icon">🕐</span>
              <span>Mon - Sat: 9:00 AM - 7:00 PM</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {currentYear} Mahalaxmi Automobile. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <span>•</span>
            <a href="#">Terms of Service</a>
            <span>•</span>
            <a href="#">Return Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
