import React, { CSSProperties } from 'react';

const badgeStyle: CSSProperties = {
  position: 'relative',
  display: 'inline-block',
  padding: '0.25rem 0.35rem',
  fontSize: '0.9rem',
};

const overlayTextStyle = (textLength: number): CSSProperties => ({
  display: 'none',
  justifyContent: 'center',
  position: 'absolute',
  width: `${textLength * 7.5}px`,
  height: '160%',
  left: '50%',
  top: '100%',
  transform: 'translate(-50%)',
  padding: '5px 10px',
  marginTop: '10px',
  borderRadius: '5px',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  color: 'white',
  fontSize: '0.8rem',
});

const hoverOverlayTextStyle: CSSProperties = {
  display: 'flex',
};

const arrowStyle: CSSProperties = {
  content: '',
  position: 'absolute',
  top: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '0',
  height: '0',
  borderBottom: '10px solid rgba(0, 0, 0, 0.6)',
  borderLeft: '10px solid transparent',
  borderRight: '10px solid transparent',
};

const linkStyle = {
  marginRight: '16px',
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'none',
  },
};

const Badge = ({
  label,
  overlayText,
  fontColor = 'white',
  backgroundColor = 'black',
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <a href="https://dogutech.io/pricing" target="_blank" style={linkStyle}>
      <span
        style={{
          ...badgeStyle,
          color: fontColor,
          backgroundColor: backgroundColor,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {label}
        {isHovered && <div style={arrowStyle}></div>}
        <div
          style={{
            ...overlayTextStyle(overlayText.length),
            ...(isHovered ? hoverOverlayTextStyle : {}),
          }}
        >
          {overlayText}
        </div>
      </span>
    </a>
  );
};

export default Badge;
