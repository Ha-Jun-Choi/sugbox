import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, CardContent, Typography, Button, Box, Chip } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

const SuggestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSuggestion();
  }, [id]);

  const fetchSuggestion = async () => {
    try {
      const response = await axios.get(`/api/suggestions/${id}`);
      setSuggestion(response.data);
      setLoading(false);
    } catch (err) {
      setError('건의사항을 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  if (loading) return <Typography>로딩 중...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!suggestion) return <Typography>건의사항을 찾을 수 없습니다.</Typography>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card elevation={3}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {suggestion.title}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                작성자: {suggestion.author}
              </Typography>
            </Box>
            <Chip
              label={suggestion.status === 'completed' ? '처리완료' : '처리중'}
              color={suggestion.status === 'completed' ? 'success' : 'primary'}
            />
          </Box>

          <Typography variant="body1" paragraph sx={{ mb: 4 }}>
            {suggestion.content}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              작성일: {new Date(suggestion.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/suggestions')}
        >
          목록으로 돌아가기
        </Button>
      </Box>
    </Container>
  );
};

export default SuggestionDetail; 