import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, List, ListItem, ListItemText, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const ContestList = () => {
  const [contests, setContests] = useState([]);

  useEffect(() => {
    const fetchContests = async () => {
      const res = await axios.get('/api/contests');
      setContests(res.data);
    };
    fetchContests();
  }, []);

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        공모전 목록
      </Typography>
      <List>
        {contests.map((contest) => (
          <ListItem key={contest._id} divider>
            <ListItemText
              primary={contest.title}
              secondary={`시작일: ${new Date(contest.startDate).toLocaleDateString()} ~ 종료일: ${new Date(contest.endDate).toLocaleDateString()}`}
            />
            <Typography variant="subtitle1">
              상품: {contest.product}
            </Typography>
            <Button component={Link} to={`/contests/${contest._id}`} variant="contained" color="primary">
              상세보기
            </Button>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default ContestList; 