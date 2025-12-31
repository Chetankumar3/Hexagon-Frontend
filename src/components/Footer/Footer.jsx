import React from 'react'

const Footer = () => {
  const year = new Date().getFullYear()
  return (
    <footer className="landing-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <img src="/ChatGPT Image May 28, 2025 at 01_07_26 AM-min.png" alt="Hexagon" />
            <span>Hexagon</span>
          </div>
          <p className="footer-copy">© {year} Hexagon. All rights reserved.</p>
          <div className="social-links-row">
            <a className="social-link" href="#" aria-label="GitHub"><span className="social-icon github-icon" /></a>
            <a className="social-link" href="#" aria-label="LinkedIn"><span className="social-icon linkedin-icon" /></a>
            <a className="social-link" href="#" aria-label="Twitter"><span className="social-icon twitter-icon" /></a>
            <a className="social-link" href="#" aria-label="Discord"><span className="social-icon discord-icon" /></a>
            <a className="social-link" href="#" aria-label="YouTube"><span className="social-icon youtube-icon" /></a>
          </div>
        </div>

        <div className="footer-group">
          <ul className="footer-links">
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/interview">Interview</a></li>
            <li><a href="/jobs">Jobs</a></li>
            <li><a href="/schedule">Schedule</a></li>
          </ul>
        </div>

        <div className="footer-group">
          <ul className="footer-links">
            <li><a href="#">GitHub</a></li>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">Twitter/X</a></li>
            <li><a href="#">LinkedIn</a></li>
          </ul>
        </div>

        <div className="footer-group">
          <ul className="footer-links">
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms & Conditions</a></li>
            <li><a href="/cookies">Cookie Policy</a></li>
          </ul>
        </div>

        <div className="footer-group">
          <ul className="footer-links">
            <li><a href="/signup">Signup</a></li>
            <li><a href="/login">Login</a></li>
            <li><a href="/forgot">Forgot Password</a></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

export default Footer
