"use client";
import React from "react";
import { WobbleCard } from "./wobble-card";

export function WobbleCardDemo() {
  return (
    <div className="w-full">
      <WobbleCard containerClassName="w-full max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
          Enhance Your Learning Experience
        </h2>
        <p className="text-white/80 text-base md:text-lg mb-6">
          Join thousands of students who are already transforming their careers with our comprehensive courses.
        </p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white"></div>
            <span className="text-white/90 text-sm">Interactive Learning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white"></div>
            <span className="text-white/90 text-sm">Expert Instructors</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white"></div>
            <span className="text-white/90 text-sm">Lifetime Access</span>
          </div>
        </div>
      </WobbleCard>
    </div>
  );
}

