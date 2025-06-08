import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  CardMedia
} from '@mui/material';
import axios from 'axios';

function NoticeList() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        // 변경 전: const response = await axios.get('/api/notices');
        const response = await axios.get('/api/notices'); // 서버 주소 명시
        setNotices(response.data);
        setLoading(false);
      } catch (err) {
        setError('공지사항을 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          공지사항 목록
        </Typography>

        {notices.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            아직 등록된 공지사항이 없습니다.
          </Typography>
        ) : (
          <Box sx={{ mt: 2 }}>
            {notices.map((notice) => (
              <Card key={notice._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {notice.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    작성자: {notice.author} | 날짜: {new Date(notice.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {notice.content}
                  </Typography>
                  {notice.imageUrl && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={notice.imageUrl}
                      alt={notice.title}
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default NoticeList;