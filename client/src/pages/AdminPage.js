import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  CircularProgress,
  CardMedia,
  Tabs,
  Tab
} from '@mui/material';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Cloudinary 스크립트 로드
const loadCloudinaryScript = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.body.appendChild(script);
  });
};

function AdminPage() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('pending');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // 공지사항 상태 추가
  const [notices, setNotices] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(true); // 공지사항 로딩 상태
  const [noticeError, setNoticeError] = useState('');
  const [selectedNotice, setSelectedNotice] = useState(null); // 수정할 공지사항 상태
  const [editNoticeTitle, setEditNoticeTitle] = useState(''); // 수정 모달 제목 상태
  const [editNoticeContent, setEditNoticeContent] = useState(''); // 수정 모달 내용 상태

  const [tabValue, setTabValue] = useState(0);
  const [contests, setContests] = useState([]);
  const [openNoticeDialog, setOpenNoticeDialog] = useState(false);
  const [openContestDialog, setOpenContestDialog] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', content: '' });
  const [newContest, setNewContest] = useState({ title: '', description: '', startDate: '', endDate: '', product: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  const [selectedContest, setSelectedContest] = useState(null);
  const [editContest, setEditContest] = useState({ title: '', description: '', startDate: '', endDate: '', product: '', imageUrl: '' });

  const [submissions, setSubmissions] = useState([]);
  const [selectedContestSubmissions, setSelectedContestSubmissions] = useState([]);
  const [selectedContestForSubmissions, setSelectedContestForSubmissions] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSuggestions();
      fetchNotices();
      fetchContests();
      loadCloudinaryScript().catch(console.error);
    }
  }, [isAuthenticated]);

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

  // 공지사항 불러오는 함수 추가
  const fetchNotices = async () => {
    try {
      const response = await axios.get('/api/notices');
      setNotices(response.data);
      setLoadingNotices(false);
    } catch (err) {
      setNoticeError('공지사항을 불러오는데 실패했습니다.');
      setLoadingNotices(false);
    }
  };

  const fetchContests = async () => {
    const res = await axios.get('/api/contests');
    setContests(res.data);
  };

  const handleLogin = () => {
    // 실제로는 서버에서 인증을 처리해야 합니다
    // 아래에서 비밀번호 변경
    if (password === 'gram#admin0520') {
      setIsAuthenticated(true);
    } else {
      setError('비밀번호가 틀렸습니다.');
    }
  };

  const handleDelete = async (suggestionId) => {
    try {
      await axios.delete(`/api/suggestions/${suggestionId}`);
      fetchSuggestions();
    } catch (err) {
      setError('삭제에 실패했습니다.');
    }
  };

  const handleResponseSubmit = async () => {
    try {
      await axios.patch(`/api/suggestions/${selectedSuggestion._id}`, {
        response,
        status
      });
      setSelectedSuggestion(null);
      setResponse('');
      fetchSuggestions();
    } catch (err) {
      setError('답변 등록에 실패했습니다.');
    }
  };

  const handleNoticeSubmit = async () => {
    if (!isAuthenticated) return;

    try {
      await axios.post('/api/notices', {
        title: newNotice.title,
        content: newNotice.content
      });
      
      setNewNotice({ title: '', content: '' });
      setOpenNoticeDialog(false);
      alert('공지사항이 등록되었습니다.');
      fetchNotices();
    } catch (error) {
      console.error('공지사항 등록 실패:', error);
      alert('공지사항 등록에 실패했습니다.');
    }
  };

  // 공지사항 수정 모달 열기
  const handleEditNotice = (notice) => {
    setSelectedNotice(notice);
    setEditNoticeTitle(notice.title);
    setEditNoticeContent(notice.content);
  };

  // 공지사항 수정 저장
  const handleSaveEditedNotice = async () => {
    if (!selectedNotice) return;
    try {
      await axios.put(`/api/notices/${selectedNotice._id}`, {
        title: editNoticeTitle,
        content: editNoticeContent
      });
      alert('공지사항이 수정되었습니다.');
      setSelectedNotice(null); // 모달 닫기
      fetchNotices(); // 수정 후 공지사항 목록 새로고침
    } catch (error) {
      console.error('공지사항 수정 실패:', error);
      alert('공지사항 수정에 실패했습니다.');
    }
  };

  // 공지사항 삭제
  const handleDeleteNotice = async (noticeId) => {
    if (window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      try {
        await axios.delete(`/api/notices/${noticeId}`);
        alert('공지사항이 삭제되었습니다.');
        fetchNotices(); // 삭제 후 공지사항 목록 새로고침
      } catch (error) {
        console.error('공지사항 삭제 실패:', error);
        alert('공지사항 삭제에 실패했습니다.');
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) {
      formData.append('image', image);
    }
    try {
      await axios.post('/api/notices', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setTitle('');
      setContent('');
      setImage(null);
      setImagePreview('');
      alert('공지사항이 등록되었습니다.');
    } catch (err) {
      alert('공지사항 등록에 실패했습니다.');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenNoticeDialog = () => {
    setOpenNoticeDialog(true);
  };

  const handleCloseNoticeDialog = () => {
    setOpenNoticeDialog(false);
    setNewNotice({ title: '', content: '' });
  };

  const handleOpenContestDialog = () => {
    setOpenContestDialog(true);
  };

  const handleCloseContestDialog = () => {
    setOpenContestDialog(false);
    setNewContest({ title: '', description: '', startDate: '', endDate: '', product: '' });
  };

  const handleImageUpload = () => {
    const cloudName = 'dtrzecb0l';  // 수정된 cloud name
    const uploadPreset = 'lasttest';  // 새로운 upload preset

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
        if (!error && result && result.event === "success") {
          const imageUrl = result.info.secure_url;
          setUploadedImageUrl(imageUrl);
          setNewContest(prev => ({ ...prev, imageUrl }));
          console.log('업로드된 이미지 URL:', imageUrl);
        }
      }
    );

    myWidget.open();
  };

  const handleContestSubmit = async () => {
    try {
      if (!newContest.title || !newContest.description || !newContest.startDate || !newContest.endDate || !newContest.product) {
        alert('모든 필수 항목을 입력해주세요.');
        return;
      }

      const contestData = {
        ...newContest,
        imageUrl: uploadedImageUrl
      };

      await axios.post('/api/contests', contestData);
      setOpenContestDialog(false);
      setNewContest({ title: '', description: '', startDate: '', endDate: '', product: '' });
      setUploadedImageUrl('');
      fetchContests();
      alert('공모전이 등록되었습니다.');
    } catch (error) {
      console.error('공모전 등록 실패:', error);
      alert('공모전 등록에 실패했습니다.');
    }
  };

  const handleDeleteContest = async (contestId) => {
    if (window.confirm('정말로 이 공모전을 삭제하시겠습니까?')) {
      try {
        await axios.delete(`/api/contests/${contestId}`);
        alert('공모전이 삭제되었습니다.');
        fetchContests();
      } catch (error) {
        console.error('공모전 삭제 실패:', error);
        alert('공모전 삭제에 실패했습니다.');
      }
    }
  };

  // 공모전 수정 모달 열기
  const handleEditContest = (contest) => {
    setSelectedContest(contest);
    setEditContest({
      title: contest.title,
      description: contest.description,
      startDate: contest.startDate.split('T')[0],
      endDate: contest.endDate.split('T')[0],
      product: contest.product,
      imageUrl: contest.imageUrl || ''
    });
  };

  // 공모전 수정 저장
  const handleSaveEditedContest = async () => {
    if (!selectedContest) return;
    try {
      await axios.put(`/api/contests/${selectedContest._id}`, editContest);
      alert('공모전이 수정되었습니다.');
      setSelectedContest(null);
      fetchContests();
    } catch (error) {
      console.error('공모전 수정 실패:', error);
      alert('공모전 수정에 실패했습니다.');
    }
  };

  const fetchSubmissions = async (contestId) => {
    try {
      const response = await axios.get(`/api/submissions/contest/${contestId}`);
      setSelectedContestSubmissions(response.data);
    } catch (err) {
      console.error('응모 목록을 불러오는데 실패했습니다:', err);
    }
  };

  const handleContestSelect = (contest) => {
    setSelectedContestForSubmissions(contest);
    fetchSubmissions(contest._id);
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, my: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            관리자 로그인
          </Typography>
          <TextField
            fullWidth
            type="password"
            label="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={handleLogin}>
            로그인
          </Button>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          관리자 페이지
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="건의사항" />
          <Tab label="공지사항" />
          <Tab label="공모전" />
          <Tab label="응모 목록" />
        </Tabs>

        <Box sx={{ mt: 2 }}>
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                건의사항 목록
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress />
                </Box>
              ) : suggestions.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                  아직 등록된 건의사항이 없습니다.
                </Typography>
              ) : (
                suggestions.map((suggestion) => (
                  <Card key={suggestion._id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" component="h2">
                          {suggestion.title}
                        </Typography>
                        <Chip
                          label={getStatusLabel(suggestion.status)}
                          color={getStatusColor(suggestion.status)}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        작성자: {suggestion.author}
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {suggestion.content}
                      </Typography>
                      {suggestion.response && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            답변
                          </Typography>
                          <Typography variant="body2">
                            {suggestion.response}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setSelectedSuggestion(suggestion);
                            setResponse(suggestion.response || '');
                            setStatus(suggestion.status);
                          }}
                        >
                          답변하기
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDelete(suggestion._id)}
                        >
                          삭제
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          )}
          {tabValue === 1 && (
            <Box>
              <Button variant="contained" color="primary" onClick={handleOpenNoticeDialog}>
                공지사항 추가
              </Button>
              <Box sx={{ mt: 2 }}>
                {notices.length === 0 ? (
                  <Typography variant="body1" color="text.secondary">
                    아직 등록된 공지사항이 없습니다.
                  </Typography>
                ) : (
                  notices.map((notice) => (
                    <Paper key={notice._id} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="h6">{notice.title}</Typography>
                      <Typography variant="body1">{notice.content}</Typography>
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEditNotice(notice)}
                        >
                          수정
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteNotice(notice._id)}
                        >
                          삭제
                        </Button>
                      </Box>
                    </Paper>
                  ))
                )}
              </Box>
            </Box>
          )}
          {tabValue === 2 && (
            <Box>
              <Button variant="contained" color="primary" onClick={handleOpenContestDialog}>
                공모전 추가
              </Button>
              <Box sx={{ mt: 2 }}>
                {contests.length === 0 ? (
                  <Typography variant="body1" color="text.secondary">
                    아직 등록된 공모전이 없습니다.
                  </Typography>
                ) : (
                  contests.map((contest) => (
                    <Paper key={contest._id} sx={{ p: 2, mb: 2 }}>
                      {contest.imageUrl && (
                        <Box sx={{ mb: 2 }}>
                          <img 
                            src={contest.imageUrl} 
                            alt={contest.title} 
                            style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                          />
                        </Box>
                      )}
                      <Typography variant="h6">{contest.title}</Typography>
                      <Typography variant="body1">{contest.description}</Typography>
                      <Typography variant="subtitle1">
                        시작일: {new Date(contest.startDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="subtitle1">
                        종료일: {new Date(contest.endDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="subtitle1">
                        상품: {contest.product}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={() => handleEditContest(contest)}
                        >
                          수정
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small" 
                          onClick={() => handleDeleteContest(contest._id)}
                        >
                          삭제
                        </Button>
                      </Box>
                    </Paper>
                  ))
                )}
              </Box>
            </Box>
          )}
          {tabValue === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                공모전 응모 목록
              </Typography>
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>공모전 선택</InputLabel>
                  <Select
                    value={selectedContestForSubmissions?._id || ''}
                    label="공모전 선택"
                    onChange={(e) => {
                      const contest = contests.find(c => c._id === e.target.value);
                      handleContestSelect(contest);
                    }}
                  >
                    {contests.map((contest) => (
                      <MenuItem key={contest._id} value={contest._id}>
                        {contest.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {selectedContestForSubmissions && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {selectedContestForSubmissions.title} 응모 목록
                  </Typography>
                  {selectedContestSubmissions.length === 0 ? (
                    <Typography>아직 응모가 없습니다.</Typography>
                  ) : (
                    selectedContestSubmissions.map((submission) => (
                      <Card key={submission._id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography variant="h6">
                            {submission.name} ({submission.grade})
                          </Typography>
                          <Typography variant="body1" sx={{ mt: 1 }}>
                            {submission.content}
                          </Typography>
                          {submission.imageUrl && (
                            <Box sx={{ mt: 2 }}>
                              <img
                                src={submission.imageUrl}
                                alt="응모 이미지"
                                style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                              />
                            </Box>
                          )}
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            응모일시: {new Date(submission.createdAt).toLocaleString()}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Box>
              )}
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* 답변 모달 */}
        <Dialog open={!!selectedSuggestion} onClose={() => setSelectedSuggestion(null)}>
          <DialogTitle>답변 작성</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="답변 내용"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              sx={{ mt: 2 }}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>상태</InputLabel>
              <Select
                value={status}
                label="상태"
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="pending">검토중</MenuItem>
                <MenuItem value="in-progress">처리중</MenuItem>
                <MenuItem value="completed">완료</MenuItem>
                <MenuItem value="rejected">반려</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedSuggestion(null)}>취소</Button>
            <Button onClick={handleResponseSubmit}>저장</Button>
          </DialogActions>
        </Dialog>

        {/* 공지사항 수정 모달 */}
        <Dialog open={!!selectedNotice} onClose={() => setSelectedNotice(null)}>
          <DialogTitle>공지사항 수정</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="제목"
              type="text"
              fullWidth
              variant="standard"
              value={editNoticeTitle}
              onChange={(e) => setEditNoticeTitle(e.target.value)}
            />
            <TextField
              margin="dense"
              label="내용"
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="standard"
              value={editNoticeContent}
              onChange={(e) => setEditNoticeContent(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedNotice(null)}>취소</Button>
            <Button onClick={handleSaveEditedNotice}>저장</Button>
          </DialogActions>
        </Dialog>

        {/* 공지사항 추가 모달 */}
        <Dialog open={openNoticeDialog} onClose={handleCloseNoticeDialog}>
          <DialogTitle>공지사항 추가</DialogTitle>
          <DialogContent>
            <TextField
              label="제목"
              value={newNotice.title}
              onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="내용"
              value={newNotice.content}
              onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
              fullWidth
              margin="normal"
              multiline
              rows={4}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseNoticeDialog}>취소</Button>
            <Button onClick={handleNoticeSubmit} color="primary">추가</Button>
          </DialogActions>
        </Dialog>

        {/* 공모전 추가 모달 */}
        <Dialog open={openContestDialog} onClose={handleCloseContestDialog} maxWidth="md" fullWidth>
          <DialogTitle>새 공모전 등록</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="제목"
                value={newContest.title}
                onChange={(e) => setNewContest({ ...newContest, title: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="설명"
                value={newContest.description}
                onChange={(e) => setNewContest({ ...newContest, description: e.target.value })}
                margin="normal"
                multiline
                rows={4}
              />
              <TextField
                fullWidth
                label="시작일"
                type="date"
                value={newContest.startDate}
                onChange={(e) => setNewContest({ ...newContest, startDate: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="종료일"
                type="date"
                value={newContest.endDate}
                onChange={(e) => setNewContest({ ...newContest, endDate: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="상품"
                value={newContest.product}
                onChange={(e) => setNewContest({ ...newContest, product: e.target.value })}
                margin="normal"
              />
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleImageUpload}
                  sx={{ mr: 2 }}
                >
                  이미지 업로드
                </Button>
                {uploadedImageUrl && (
                  <Box sx={{ mt: 2 }}>
                    <img 
                      src={uploadedImageUrl} 
                      alt="Uploaded" 
                      style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseContestDialog}>취소</Button>
            <Button onClick={handleContestSubmit} variant="contained" color="primary">
              등록
            </Button>
          </DialogActions>
        </Dialog>

        {/* 공모전 수정 모달 */}
        <Dialog open={!!selectedContest} onClose={() => setSelectedContest(null)} maxWidth="md" fullWidth>
          <DialogTitle>공모전 수정</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="제목"
                value={editContest.title}
                onChange={(e) => setEditContest({ ...editContest, title: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="설명"
                value={editContest.description}
                onChange={(e) => setEditContest({ ...editContest, description: e.target.value })}
                margin="normal"
                multiline
                rows={4}
                required
              />
              <TextField
                fullWidth
                label="시작일"
                type="date"
                value={editContest.startDate}
                onChange={(e) => setEditContest({ ...editContest, startDate: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                fullWidth
                label="종료일"
                type="date"
                value={editContest.endDate}
                onChange={(e) => setEditContest({ ...editContest, endDate: e.target.value })}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                fullWidth
                label="상품"
                value={editContest.product}
                onChange={(e) => setEditContest({ ...editContest, product: e.target.value })}
                margin="normal"
                required
              />
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleImageUpload}
                  sx={{ mr: 2 }}
                >
                  이미지 업로드
                </Button>
                {editContest.imageUrl && (
                  <Box sx={{ mt: 2 }}>
                    <img 
                      src={editContest.imageUrl} 
                      alt="Uploaded" 
                      style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedContest(null)}>취소</Button>
            <Button onClick={handleSaveEditedContest} variant="contained" color="primary">
              저장
            </Button>
          </DialogActions>
        </Dialog>

      </Paper>
    </Container>
  );

}

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

export default AdminPage;
