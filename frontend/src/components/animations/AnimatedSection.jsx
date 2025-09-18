import React from 'react';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const AnimatedSection = ({ 
  children, 
  className = '', 
  animation = 'fadeInUp',
  delay = 0,
  duration = 600,
  threshold = 0.1
}) => {
  const [ref, isVisible] = useScrollAnimation(threshold);

  const animations = {
    fadeInUp: 'opacity-0 translate-y-8',
    fadeInDown: 'opacity-0 -translate-y-8',
    fadeInLeft: 'opacity-0 -translate-x-8',
    fadeInRight: 'opacity-0 translate-x-8',
    fadeIn: 'opacity-0',
    scaleIn: 'opacity-0 scale-95',
    slideInUp: 'opacity-0 translate-y-16',
    slideInDown: 'opacity-0 -translate-y-16',
  };

  const animationClasses = animations[animation] || animations.fadeInUp;
  const visibleClasses = 'opacity-100 translate-y-0 translate-x-0 scale-100';

  return (
    <div
      ref={ref}
      className={`transition-all duration-${duration} ease-out ${
        isVisible ? visibleClasses : animationClasses
      } ${className}`}
      style={{
        transitionDelay: isVisible ? `${delay}ms` : '0ms'
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
