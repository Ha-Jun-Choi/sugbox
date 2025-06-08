import React from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function Home() {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          KISY 마음의 소리함
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
          여러분의 소중한 의견을 들려주세요
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, my: 4 }}>
          <Typography variant="body1" paragraph>
            마음의 소리함은 학생들의 의견을 듣고 학교 발전을 위한 건의사항을 수렴하는 공간입니다.<br></br>
            여러분의 소중한 의견이 학교를 더 나은 곳으로 만드는 데 큰 도움이 됩니다.
          </Typography>
          
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/suggestions/new"
              sx={{ mr: 2 }}
            >
              건의하기
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={RouterLink}
              to="/suggestions"
            >
              건의사항 보기
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Home; 