import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import axios from 'axios';

// Set default base URL for all axios requests
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function ContestDetailPage() {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [isCloudinaryLoaded, setIsCloudinaryLoaded] = useState(false);
  const [submission, setSubmission] = useState({
    name: '',
    grade: '',
    content: '',
    imageUrl: ''
  });
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  useEffect(() => {
    if (window.cloudinary) {
      setIsCloudinaryLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
    script.async = true;
    script.onload = () => {
      setIsCloudinaryLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const response = await axios.get(`/api/contests/${id}`);
        setContest(response.data);
        setLoading(false);
      } catch (err) {
        setError('공모전 정보를 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchContest();
  }, [id]);

  const handleImageUpload = () => {
    if (!isCloudinaryLoaded) {
      alert('이미지 업로드 기능을 로드하는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const cloudName = 'dtrzecb0l';
    const uploadPreset = 'lasttest';

    const myWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        sources: ['local', 'url', 'camera'],
        multiple: false,
        maxFiles: 1,
        styles: {
          palette: {
            window: "#FFFFFF",
            windowBorder: "#90A0B3",
            tabIcon: "#0078FF",
            menuIcons: "#5A616A",
            textDark: "#000000",
            textLight: "#FFFFFF",
            link: "#0078FF",
            action: "#FF620C",
            inactiveTabIcon: "#0E2F5A",
            error: "#F44235",
            inProgress: "#0078FF",
            complete: "#20B832",
            sourceBg: "#E4EBF1"
          }
        }
      },
      (error, result) => {
        if (error) {
          console.error('이미지 업로드 에러:', error);
          alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
          return;
        }
        
        if (result && result.event === "success") {
          const imageUrl = result.info.secure_url;
          console.log('업로드된 이미지 URL:', imageUrl);
          setUploadedImageUrl(imageUrl);
          setSubmission(prev => ({ ...prev, imageUrl }));
        }
      }
    );

    myWidget.open();
  };

  const handleSubmit = async () => {
    try {
      if (!submission.name || !submission.grade || !submission.content) {
        alert('이름, 학년, 내용은 필수 항목입니다.');
        return;
      }

      const submissionData = {
        ...submission,
        contestId: id
      };

      console.log('Submitting contest entry:', submissionData);
      console.log('Contest ID:', id);
      console.log('Submission data:', submission);

      try {
        const response = await axios.post('/api/submissions', submissionData);
        console.log('Server response:', response.data);

        if (response.status === 201) {
          alert('응모가 완료되었습니다.');
          setOpenDialog(false);
          setSubmission({
            name: '',
            grade: '',
            content: '',
            imageUrl: ''
          });
          setUploadedImageUrl('');
        }
      } catch (error) {
        console.error('응모 실패 상세:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        console.error('Error message:', error.message);
        
        if (error.response?.data?.message) {
          alert(error.response.data.message);
        } else {
          alert('응모에 실패했습니다. 다시 시도해주세요.');
        }
      }
    } catch (error) {
      console.error('예상치 못한 에러:', error);
      alert('예상치 못한 오류가 발생했습니다. 다시 시도해주세요.');
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
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, my: 4 }}>
        {contest.imageUrl && (
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <img
              src={contest.imageUrl}
              alt={contest.title}
              style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
            />
          </Box>
        )}

        <Typography variant="h4" component="h1" gutterBottom>
          {contest.title}
        </Typography>

        <Typography variant="body1" paragraph>
          {contest.description}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">
              시작일: {new Date(contest.startDate).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">
              종료일: {new Date(contest.endDate).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">
              상품: {contest.product}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => setOpenDialog(true)}
          >
            응모하기
          </Button>
        </Box>
      </Paper>

      {/* 응모하기 다이얼로그 */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
        disableEnforceFocus
        disableAutoFocus
      >
        <DialogTitle>공모전 응모</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="이름"
              value={submission.name}
              onChange={(e) => setSubmission({ ...submission, name: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>학년</InputLabel>
              <Select
                value={submission.grade}
                label="학년"
                onChange={(e) => setSubmission({ ...submission, grade: e.target.value })}
              >
                <MenuItem value="1학년">1학년</MenuItem>
                <MenuItem value="2학년">2학년</MenuItem>
                <MenuItem value="3학년">3학년</MenuItem>
                <MenuItem value="4학년">4학년</MenuItem>
                <MenuItem value="5학년">5학년</MenuItem>
                <MenuItem value="6학년">6학년</MenuItem>
                <MenuItem value="7학년">7학년</MenuItem>
                <MenuItem value="8학년">8학년</MenuItem>
                <MenuItem value="9학년">9학년</MenuItem>
                <MenuItem value="10학년">10학년</MenuItem>
                <MenuItem value="11학년">11학년</MenuItem>
                <MenuItem value="12학년">12학년</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="내용"
              value={submission.content}
              onChange={(e) => setSubmission({ ...submission, content: e.target.value })}
              margin="normal"
              multiline
              rows={4}
              required
            />
            
            {/* 이미지 업로드 섹션 */}
            <Box sx={{ mt: 2, mb: 2 }}>
              <Button
                variant="outlined"
                onClick={handleImageUpload}
                sx={{ mb: 2 }}
              >
                이미지 업로드
              </Button>
              {uploadedImageUrl && (
                <Box sx={{ mt: 2 }}>
                  <img
                    src={uploadedImageUrl}
                    alt="업로드된 이미지"
                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            제출
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ContestDetailPage; 