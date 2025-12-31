import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

export function FloatingNav({ navItems = [], actions = [], extraCenter = null }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [open, setOpen] = useState(false);

  return (
    <div className={`floating-nav${open ? ' floating-nav--open' : ''}`}>
      <button className="floating-nav-toggle" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>
        <span className="toggle-bar" />
        <span className="toggle-bar" />
        <span className="toggle-bar" />
      </button>
      <div className="floating-nav-row">
        <div className="floating-nav-items floating-nav-left ">
          {navItems.map((item) => {
            const isActive = currentPath === item.link;
            return (
              <NavLink
                key={item.name}
                to={item.link}
                className={`${isActive ? 'border-2 border-gray-300' : ''} floating-nav-link${isActive ? ' floating-nav-link--active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <span className="floating-nav-icon">{item.icon}</span>
                <span className="floating-nav-label">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
        {extraCenter && (
          <div className="floating-nav-items">
            {extraCenter}
          </div>
        )}
        <div className="floating-nav-items floating-nav-right">
          {actions.map((item) => {
            const isActive = currentPath === item.link;
            
            // If item has onClick handler, render as button instead of NavLink
            if (item.onClick) {
              return (
                <button
                  key={item.name}
                  className={`floating-nav-link floating-nav-link--action`}
                  onClick={() => {
                    setOpen(false);
                    item.onClick();
                  }}
                >
                  <span className="floating-nav-icon">{item.icon}</span>
                  <span className="floating-nav-label">{item.name}</span>
                </button>
              );
            }
            
            return (
              <NavLink
                key={item.name}
                to={item.link}
                className={`floating-nav-link floating-nav-link--action${isActive ? ' floating-nav-link--active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <span className="floating-nav-icon">{item.icon}</span>
                <span className="floating-nav-label">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  )
}

export default FloatingNav
