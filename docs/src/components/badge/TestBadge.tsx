import React from 'react';

function OverlayButton() {
  const styles = {
    container: {
      position: 'relative',
      width: '200px',
      height: '50px',
      backgroundColor: '#3498db',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      marginBottom: '30px', // Overlay Text와의 간격 조절을 위해 추가
    },
    overlayText: {
      position: 'absolute',
      top: '100%', // 버튼 위에 위치하도록 설정
      left: '50%',
      transform: 'translateX(-50%)', // 가운데 정렬을 위한 설정
      display: 'none',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '5px',
    },
    buttonHovered: {
      display: 'block',
    },
  };

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      //@ts-ignore
      style={styles.container}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      Button //@ts-ignore
      <div
        //@ts-ignore
        style={{
          ...styles.overlayText,
          ...(isHovered ? styles.buttonHovered : {}),
        }}
      >
        Overlay Text
      </div>
    </div>
  );
}

export default OverlayButton;
