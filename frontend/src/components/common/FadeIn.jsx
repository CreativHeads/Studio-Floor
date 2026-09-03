import React, { useEffect, useRef, useState } from 'react';

export default function FadeIn({ children, delay = 0, className = "" }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Stop observing once it's visible so it doesn't animate out and in repeatedly
          if (domRef.current) observer.unobserve(domRef.current);
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px" // Triggers slightly before coming fully into view
    });
    
    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);
    
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    }
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-[1200ms] ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
