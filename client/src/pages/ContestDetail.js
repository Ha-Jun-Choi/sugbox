import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Paper, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const ContestDetail = () => {
  const { id } = useParams();
  const [contest, setContest] = useState(null);

  useEffect(() => {
    const fetchContest = async () => {
      const res = await axios.get(`/api/contests/${id}`);
      setContest(res.data);
    };
    fetchContest();
  }, [id]);

  if (!contest) return <div>Loading...</div>;

  return (
    <Container>
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {contest.title}
        </Typography>
        <Typography variant="body1" paragraph>
          {contest.description}
        </Typography>
        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle1">
            시작일: {new Date(contest.startDate).toLocaleDateString()}
          </Typography>
          <Typography variant="subtitle1">
            종료일: {new Date(contest.endDate).toLocaleDateString()}
          </Typography>
          <Typography variant="subtitle1">
            상품: {contest.product}
          </Typography>
        </Box>
        <Button component={Link} to="/contests" variant="contained" color="primary">
          목록으로 돌아가기
        </Button>
      </Paper>
    </Container>
  );
};

export default ContestDetail; 