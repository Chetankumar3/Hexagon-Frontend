import React from 'react';

const testimonials = [
  {
    name: "Rayhan Hossain Rahat",
    username: "@th_rahat_dev",
    avatar: "/avatars/rayhan.jpg",
    content: "Absolutely Awesome, Would really love to use some of these in my projects",
    verified: true
  },
  {
    name: "Paarth Agarwal",
    username: "@PaarthAgarwal7",
    avatar: "/avatars/paarth.jpg",
    content: "I just tried it out this is crazy awesome"
  },
  {
    name: "Micky",
    username: "@rasmickyy",
    avatar: "/avatars/micky.jpg",
    content: "Yoo.... This has to be the most beautiful component library I've ever seen!! ui.aceternity.com Shoutout to @mannupaaji for releasing this for free!",
    verified: true
  },
  {
    name: "iOS/MacOS Developer | Swift...",
    username: "@inLessmore",
    avatar: "/avatars/ios-dev.jpg",
    content: "I really like it.I will try to use it my next app"
  },
  {
    name: "Rajdeep Seth",
    username: "@rajdeepseth1",
    avatar: "/avatars/rajdeep.jpg",
    content: "Stumbled upon ui.aceternity.com today and my mind is blown 🤯\nThe seamless integration of framer-motion, tailwind CSS, and shadcn showcases a masterclass in UI design. 🚀 Kudos to @mannupaaji for creating such an innovative and inspirational resource for devs! #UI #nextjs"
  },
  {
    name: "Rumit Dhamecha • રુમિત ધામે...",
    username: "@potatopato",
    avatar: "/avatars/rumit.jpg",
    content: "I like the interaction and animation. Beautiful!"
  },
  {
    name: "Aamar",
    username: "@aamarkanji",
    avatar: "/avatars/aamar.jpg",
    content: "Man this is awesome",
    verified: true
  },
  {
    name: "Vinay",
    username: "@vinayisactive",
    avatar: "/avatars/vinay.jpg",
    content: "Upon my return from a short break every time, I consistently find innovative additions by you 🔥"
  },
  {
    name: "Rajesh David",
    username: "@rajeshdavidbabu",
    avatar: "/avatars/rajesh.jpg",
    content: "ui.aceternity.com\n\nSo well done. And its bloody free 🤪🤪\n\nPhenomenal work by @mannupaaji",
    verified: true
  },
  {
    name: "Cody De Arkland",
    username: "@CodydeArkland",
    avatar: "/avatars/cody.jpg",
    content: "This library is so dope. Stoked to see more components drop.",
    verified: true
  }
];

export default function Testimonials() {
  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        {/* Vertical Marquee Columns */}
        <div className="testimonials-marquee-wrapper">
          {/* Top gradient fade */}
          <div className="testimonials-fade-top"></div>
          
          {/* Bottom gradient fade */}
          <div className="testimonials-fade-bottom"></div>
          
          <div className="testimonials-grid">
            {/* Column 1 - moves up slowly */}
            <div className="testimonials-column testimonials-column-up">
              {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
                <Card key={`c1-${i}`} t={t} />
              ))}
            </div>

            {/* Column 2 - moves down medium speed */}
            <div className="testimonials-column testimonials-column-down">
              {[...testimonials.slice(3), ...testimonials, ...testimonials, ...testimonials].map((t, i) => (
                <Card key={`c2-${i}`} t={t} />
              ))}
            </div>

            {/* Column 3 - moves up fast */}
            <div className="testimonials-column testimonials-column-up-fast">
              {[...testimonials.slice(6), ...testimonials, ...testimonials, ...testimonials].map((t, i) => (
                <Card key={`c3-${i}`} t={t} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({ t }) {
  return (
    <div className="testimonial-card">
      <div className="testimonial-header">
        <div className="testimonial-avatar">
          <div className="testimonial-avatar-placeholder"></div>
        </div>
        
        <div className="testimonial-info">
          <div className="testimonial-name-row">
            <h3 className="testimonial-name">{t.name}</h3>
            {t.verified && (
              <svg className="testimonial-verified-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.52 3.59c.8-.5 1.9-.5 2.68 0l1.9 1.2c.4.2.9.4 1.4.4h2.2c1 0 1.8.8 1.8 1.8v2.2c0 .5.1 1 .4 1.4l1.2 1.9c.5.8.5 1.9 0 2.68l-1.2 1.9c-.2.4-.4.9-.4 1.4v2.2c0 1-.8 1.8-1.8 1.8h-2.2c-.5 0-1 .1-1.4.4l-1.9 1.2c-.8.5-1.9.5-2.68 0l-1.9-1.2c-.4-.2-.9-.4-1.4-.4H4.8c-1 0-1.8-.8-1.8-1.8v-2.2c0-.5-.1-1-.4-1.4l-1.2-1.9c-.5-.8-.5-1.9 0-2.68l1.2-1.9c.2-.4.4-.9.4-1.4V4.8c0-1 .8-1.8 1.8-1.8h2.2c.5 0 1-.1 1.4-.4l1.9-1.2zM16.7 9.3c.4.4.4 1 0 1.4l-5 5c-.4.4-1 .4-1.4 0l-2-2c-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0l1.3 1.3 4.3-4.3c.4-.4 1-.4 1.4 0z" />
              </svg>
            )}
          </div>
          <p className="testimonial-username">{t.username}</p>
        </div>
      </div>
      
      <p className="testimonial-content">{t.content}</p>
    </div>
  );
}
