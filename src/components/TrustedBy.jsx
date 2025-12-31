import React from 'react';

export default function TrustedBy() {
  const logos = [
    "Google",
    "Microsoft",
    "Cisco",
    "Zomato",
    "Strapi",
    "Neon",
  ];

  const track = [...logos, ...logos];

  return (
    <section className="trusted-by-section">
      <div className="trusted-by-container">
        {/* Edge transparency similar to testimonials */}
        <div className="trusted-by-content">
          <div className="trusted-by-fade-left"></div>
          <div className="trusted-by-fade-right"></div>
          
          {/* Single horizontal marquee row */}
          <div className="marquee-mask">
            <div className="marquee-track marquee-animate-left">
              {track.map((label, idx) => (
                <Logo key={`r1-${label}-${idx}`} label={label} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Logo({ label }) {
  return (
    <div className="trusted-by-logo">
      <span className="trusted-by-logo-text">
        {label}
      </span>
      <span className="sr-only">{label}</span>
    </div>
  );
}

