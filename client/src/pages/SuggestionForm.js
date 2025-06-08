import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert
} from '@mui/material';

const SuggestionForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 필수 필드 검증
      if (!formData.title.trim() || !formData.content.trim() || !formData.author.trim()) {
        setError('제목, 내용, 작성자는 필수 입력 항목입니다.');
        setLoading(false);
        return;
      }

      console.log('Submitting suggestion:', formData);
      const response = await axios.post('/api/suggestions', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Server response:', response.data);
      
      navigate('/suggestions');
    } catch (err) {
      console.error('Error submitting suggestion:', err);
      
      if (err.response) {
        // 서버에서 전달한 에러 메시지 표시
        setError(err.response.data.message || '건의사항 등록에 실패했습니다.');
      } else if (err.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우
        setError('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      } else {
        // 요청 설정 중 에러가 발생한 경우
        setError('요청을 보내는 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          건의사항 작성
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="제목"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            margin="normal"
          />

          <TextField
            fullWidth
            label="작성자"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
            margin="normal"
          />

          <TextField
            fullWidth
            label="내용"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            multiline
            rows={6}
            margin="normal"
          />

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              등록하기
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/suggestions')}
              disabled={loading}
            >
              취소
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default SuggestionForm;
