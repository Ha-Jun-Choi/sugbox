import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { Add } from '@mui/icons-material';

const SuggestionList = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get('/api/suggestions');
      setSuggestions(response.data);
      setLoading(false);
    } catch (err) {
      setError('건의사항을 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'in-progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return '검토중';
      case 'in-progress':
        return '처리중';
      case 'completed':
        return '완료';
      case 'rejected':
        return '반려';
      default:
        return status;
    }
  };

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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          건의사항 목록
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/suggestions/new')}
        >
          새 건의사항
        </Button>
      </Box>

      {suggestions.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          아직 등록된 건의사항이 없습니다.
        </Typography>
      ) : (
        suggestions.map((suggestion) => (
          <Card key={suggestion._id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h6" component="h2">
                  {suggestion.title}
                </Typography>
                <Chip
                  label={getStatusLabel(suggestion.status)}
                  color={getStatusColor(suggestion.status)}
                  size="small"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {suggestion.content.length > 100
                  ? `${suggestion.content.substring(0, 100)}...`
                  : suggestion.content}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  작성자: {suggestion.author}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(suggestion.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
};

export default SuggestionList;
