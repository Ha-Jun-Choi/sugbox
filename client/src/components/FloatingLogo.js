import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';

const FloatingButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  right: theme.spacing(3),
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'white',
  boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
  zIndex: 9999, // 다른 요소들보다 앞에 표시되도록 z-index 추가
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
}));

function FloatingLogo() {
  const handleClick = () => {
    window.open('https://kisy.or.kr', '_blank');
  };

  return (
    <Box sx={{ zIndex: 9999 }}> {/* Box 컴포넌트에도 z-index 추가 */}
      <Tooltip title="KISY 홈페이지 방문하기" placement="left">
        <FloatingButton
          onClick={handleClick}
          aria-label="KISY 홈페이지"
        >
          <img
            src="/logo512.png"
            alt="KISY 로고"
            style={{
              width: '40px',
              height: '40px',
              objectFit: 'contain'
            }}
          />
        </FloatingButton>
      </Tooltip>
    </Box>
  );
}

export default FloatingLogo;
