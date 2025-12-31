import React, { useRef, useEffect, useState } from 'react';

export function Timeline({ data = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef([]);

  useEffect(() => {
    const observers = itemRefs.current.map((ref, index) => {
      if (!ref) return null;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveIndex(index);
            }
          });
        },
        {
          threshold: 0.6,
          rootMargin: '-20% 0px -20% 0px'
        }
      );
      
      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, [data]);

  return (
    <div className="relative">
      {/* Blue vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-indigo-400 to-indigo-300" />
      
      {/* Timeline items */}
      <div className="space-y-12">
        {data.map((item, index) => (
          <div
            key={index}
            ref={(el) => (itemRefs.current[index] = el)}
            className="relative pl-16 transition-all duration-500 ease-out"
            style={{
              opacity: activeIndex >= index ? 1 : 0.4,
              transform: activeIndex >= index ? 'translateX(0)' : 'translateX(-10px)'
            }}
          >
            {/* Dot on the line */}
            <div
              className={`absolute left-0 top-2 w-10 h-10 rounded-full border-4 border-white transition-all duration-500 ${
                activeIndex >= index
                  ? 'bg-indigo-500 shadow-lg shadow-indigo-500/50 scale-100'
                  : 'bg-zinc-300 scale-75'
              }`}
              style={{
                transform: `scale(${activeIndex >= index ? 1 : 0.75})`
              }}
            >
              {activeIndex >= index && (
                <div className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-75" />
              )}
            </div>
            
            {/* Content card */}
            <div
              className={`rounded-2xl border p-6 md:p-8 transition-all duration-500 ${
                activeIndex >= index
                  ? 'bg-white border-indigo-200 shadow-xl shadow-indigo-100/50'
                  : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <h4 className="text-xl font-semibold text-zinc-900 mb-4">
                {item.title}
              </h4>
              <div className="text-zinc-700 leading-relaxed">
                {item.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

