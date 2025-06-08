import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import FloatingLogo from './components/FloatingLogo';
import Home from './pages/Home';
import SuggestionForm from './pages/SuggestionForm';
import SuggestionList from './pages/SuggestionList';
import AdminPage from './pages/AdminPage';
import Guidelines from './pages/Guidelines';
import NoticeList from './pages/NoticeList';
import ContestPage from './pages/ContestPage';
import ContestDetailPage from './pages/ContestDetailPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#7C4DFF',  // 보라색 계열
      light: '#B47CFF',
      dark: '#5C3DC2',
    },
    secondary: {
      main: '#FF4081',  // 핑크색 계열
      light: '#FF79B0',
      dark: '#C60055',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',      // 진한 검정색으로 변경
      secondary: '#4A4A4A',    // 진한 회색으로 변경
    },
  },
  typography: {
    fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
      color: '#1A1A1A',        // 그라데이션 대신 진한 검정색 사용
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.3px',
      color: '#1A1A1A',
    },
    body1: {
      color: '#1A1A1A',
    },
    body2: {
      color: '#4A4A4A',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
          borderRadius: '12px',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 5px 15px rgba(124, 77, 255, 0.2)',
          },
        },
        containedPrimary: {
          background: '#7C4DFF',  // 그라데이션 대신 단색 사용
          color: '#FFFFFF',      // 버튼 텍스트는 흰색으로
          '&:hover': {
            background: '#5C3DC2',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',  // 카드 배경색을 확실한 흰색으로
          color: '#1A1A1A',           // 카드 내 텍스트는 진한 검정색으로
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease',
          border: '1px solid rgba(124, 77, 255, 0.1)',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 25px rgba(124, 77, 255, 0.15)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
          color: '#FFFFFF',      // 칩 텍스트는 흰색으로
          backgroundColor: '#7C4DFF',  // 칩 배경은 보라색으로
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#1A1A1A',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          minHeight: '20px',  // 헤더 높이 극단적으로 축소
          '& .MuiTypography-h6': {
            fontSize: '1.25rem',
            fontWeight: 600,
            letterSpacing: '-0.5px',
            lineHeight: '32px',  // 텍스트 라인 높이 조정
          },
          '& .MuiTypography-subtitle1': {
            fontSize: '0.875rem',
            fontWeight: 600,
            lineHeight: '32px',  // 텍스트 라인 높이 조정
          },
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          color: '#1A1A1A',
          minHeight: '32px !important',  // 툴바 높이도 극단적으로 축소
          padding: '0 16px',
          '& .MuiTypography-root': {
            color: '#1A1A1A',
          },
          '& .MuiIconButton-root': {
            color: '#1A1A1A',
            fontSize: '1.25rem',
            padding: '4px',        // 아이콘 버튼 패딩 최소화
            width: '24px',         // 아이콘 버튼 너비 축소
            height: '24px',        // 아이콘 버튼 높이 축소
            marginTop: '4px',      // 상단 여백 추가
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <FloatingLogo />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/suggestions" element={<SuggestionList />} />
          <Route path="/suggestions/new" element={<SuggestionForm />} />
          <Route path="/guidelines" element={<Guidelines />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/notices" element={<NoticeList />} />
          <Route path="/contests" element={<ContestPage />} />
          <Route path="/contests/:id" element={<ContestDetailPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
