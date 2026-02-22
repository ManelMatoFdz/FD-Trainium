import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import * as jdenticon from 'jdenticon';

export default function Avatar({ seed, url, size = 48, alt = 'avatar', className, rounded = true }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!url && ref.current && seed) {
      jdenticon.update(ref.current, seed);
    }
  }, [url, seed, size]);

  const style = {
    borderRadius: rounded ? '50%' : '8px',
    objectFit: 'cover',
    display: 'block',
    background: '#2a2d31'
  };


  if (url) {
    return (
      <img
        src={url}
        alt={alt}
        width={size}
        height={size}
        className={className}
        style={style}
        onError={(e) => { e.currentTarget.style.opacity = '0.35'; }}
      />
    );
  }

  return (
      <svg
          ref={ref}
          data-jdenticon-value={seed}
          width={size}
          height={size}
          className={className}
          style={style}
          focusable="false"
          aria-label={alt}
      >
        <title>{alt}</title>
      </svg>
  );
}

Avatar.propTypes = {
  seed: PropTypes.string,
  url: PropTypes.string,
  size: PropTypes.number,
  alt: PropTypes.string,
  className: PropTypes.string,
  rounded: PropTypes.bool,
};