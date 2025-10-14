import React, { useMemo } from 'react';
import useScrollAnimation from '../../hooks/useScrollAnimation';

const StaggeredAnimation = ({ 
  children, 
  className = '', 
  staggerDelay = 100,
  animation = 'fadeInUp',
  threshold = 0.1
}) => {
  const [ref, isVisible] = useScrollAnimation(threshold);
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768; // always visible on mobile
  }, []);

  const animations = {
    fadeInUp: 'opacity-0 translate-y-8',
    fadeInDown: 'opacity-0 -translate-y-8',
    fadeInLeft: 'opacity-0 -translate-x-8',
    fadeInRight: 'opacity-0 translate-x-8',
    scaleIn: 'opacity-0 scale-95',
  };

  const animationClass = animations[animation] || animations.fadeInUp;
  const visibleClass = 'opacity-100 translate-y-0 translate-x-0 scale-100';

  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          key={child?.key ?? index}
          className={`transition-all duration-600 ease-out ${
            (isVisible || isMobile) ? visibleClass : animationClass
          }`}
          style={{
            transitionDelay: isVisible ? `${index * staggerDelay}ms` : '0ms'
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default StaggeredAnimation;
