import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink } from 'react-router-dom';

function Navbar() {
  const [anchorElNav, setAnchorElNav] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  // 네비게이션 링크 목록
  const pages = [
    { name: '건의사항 목록', path: '/suggestions' },
    { name: '건의하기', path: '/suggestions/new' },
    { name: '공지사항', path: '/notices' },
    { name: '공모전', path: '/contests' },
    { name: '주의사항', path: '/guidelines' },
    { name: '관리자', path: '/admin' }
  ];

  return (
    <AppBar position="static">
      <Container>
        <Toolbar disableGutters>
          {/* 데스크탑 로고 (왼쪽) */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
              alignItems: 'center',
            }}
          >
            <img
              src="/logo512.png"
              alt="마음의 소리함 로고"
              style={{
                height: '64px',
                marginRight: '10px'
              }}
            />
            마음의 소리함
          </Typography>

          {/* 모바일 로고 (왼쪽) */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
              alignItems: 'center',
            }}
          >
            <img
              src="/logo512.png"
              alt="마음의 소리함 로고"
              style={{
                height: '64px',
                marginRight: '8px'
              }}
            />
            마음의 소리함
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {/* 데스크탑 메뉴 버튼 (오른쪽) */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: '#333', display: 'block' }}
                component={RouterLink}
                to={page.path}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          {/* 모바일 메뉴 아이콘 (오른쪽) */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page.name} onClick={handleCloseNavMenu} component={RouterLink} to={page.path}>
                  <Typography textAlign="center">
                    {page.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
