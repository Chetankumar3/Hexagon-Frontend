"use client";
import React, { useEffect, useRef, useState } from "react";

export function Spotlight({ className = "" }) {
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({ x: rect.width / 2, y: rect.height / 2 });
      }
    };

    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePosition({ x, y });
      }
    };

    const container = containerRef.current;
    if (container) {
      // Initialize with center position
      updatePosition();
      container.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("resize", updatePosition);
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("resize", updatePosition);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
    >
      <div
        className="absolute inset-0 transition-all duration-500 ease-out"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 0, 0, 0.08), transparent 40%)`,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

