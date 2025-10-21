import React, { useState, useEffect, useMemo } from 'react';
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
  Tabs,
  Tab,
  Snackbar
} from '@mui/material';
import axios from 'axios';

// ----------------------
// Helpers
// ----------------------
const getStatusColor = (status) => {
  switch (status) {
    case 'in-progress':
      return 'primary';
    case 'completed':
      return 'success';
    case 'rejected':
      return 'error';
    case 'pending':
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
      return status || '검토중';
  }
};

// Cloudinary widget lazy loader (idempotent)
const loadCloudinaryScript = () => {
  return new Promise((resolve, reject) => {
    if (window.cloudinary) return resolve();
    const existing = document.querySelector('script[data-cloudinary=widget]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
    script.async = true;
    script.dataset.cloudinary = 'widget';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Cloudinary 위젯을 불러오지 못했습니다.'));
    document.body.appendChild(script);
  });
};

function AdminPage() {
  // ----------------------
  // Common state
  // ----------------------
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ open: false, message: '' });

  // auth (⚠️ 서버 인증으로 바꾸는 게 정석)
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // tabs
  const [tabValue, setTabValue] = useState(0);

  // Suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('pending');

  // Notices
  const [notices, setNotices] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [editNoticeTitle, setEditNoticeTitle] = useState('');
  const [editNoticeContent, setEditNoticeContent] = useState('');
  const [openNoticeDialog, setOpenNoticeDialog] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', content: '' });

  // Contests
  const [contests, setContests] = useState([]);
  const [loadingContests, setLoadingContests] = useState(true);
  const [openContestDialog, setOpenContestDialog] = useState(false);
  const [newContest, setNewContest] = useState({ title: '', description: '', startDate: '', endDate: '', product: '', imageUrl: '' });
  const [selectedContest, setSelectedContest] = useState(null); // for edit modal
  const [editContest, setEditContest] = useState({ title: '', description: '', startDate: '', endDate: '', product: '', imageUrl: '' });

  // Submissions
  const [selectedContestForSubmissions, setSelectedContestForSubmissions] = useState(null);
  const [selectedContestSubmissions, setSelectedContestSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Cloudinary config (env 로 옮기는 게 정석이지만, 위젯은 공개키라 클라 보관 가능)
  const cloudinaryCfg = useMemo(() => ({
    cloudName: 'dtrzecb0l',
    uploadPreset: 'lasttest'
  }), []);

  useEffect(() => {
    if (isAuthenticated) {
      // 병렬로 가져오기
      Promise.all([fetchSuggestions(), fetchNotices(), fetchContests()])
        .finally(() => setLoading(false));
      // Cloudinary 미리 로드 (필요 시)
      loadCloudinaryScript().catch((e) => console.error(e));
    }
  }, [isAuthenticated]);

  // ----------------------
  // API calls
  // ----------------------
  const fetchSuggestions = async () => {
    try {
      const { data } = await axios.get('/api/suggestions');
      setSuggestions(data || []);
    } catch (err) {
      setError('건의사항을 불러오는데 실패했습니다.');
    }
  };

  const fetchNotices = async () => {
    setLoadingNotices(true);
    try {
      const { data } = await axios.get('/api/notices');
      setNotices(data || []);
    } catch (err) {
      setError('공지사항을 불러오는데 실패했습니다.');
    } finally {
      setLoadingNotices(false);
    }
  };

  const fetchContests = async () => {
    setLoadingContests(true);
    try {
      const { data } = await axios.get('/api/contests');
      setContests(data || []);
    } catch (err) {
      setError('공모전을 불러오는데 실패했습니다.');
    } finally {
      setLoadingContests(false);
    }
  };

  const fetchSubmissions = async (contestId) => {
    setLoadingSubmissions(true);
    try {
      const { data } = await axios.get(`/api/submissions/contest/${contestId}`);
      setSelectedContestSubmissions(data || []);
    } catch (err) {
      setError('응모 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // ----------------------
  // Auth
  // ----------------------
  const handleLogin = () => {
    // ⚠️ 임시. 서버 인증으로 교체 권장
    if (password === 'gram#admin0520') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('비밀번호가 틀렸습니다.');
    }
  };

  // ----------------------
  // Suggestions handlers
  // ----------------------
  const handleDeleteSuggestion = async (suggestionId) => {
    try {
      await axios.delete(`/api/suggestions/${suggestionId}`);
      await fetchSuggestions();
      setToast({ open: true, message: '삭제되었습니다.' });
    } catch (err) {
      setError('삭제에 실패했습니다.');
    }
  };

  const handleResponseSubmit = async () => {
    if (!selectedSuggestion) return;
    try {
      await axios.patch(`/api/suggestions/${selectedSuggestion._id}`, { response, status });
      setSelectedSuggestion(null);
      setResponse('');
      await fetchSuggestions();
      setToast({ open: true, message: '답변이 저장되었습니다.' });
    } catch (err) {
      setError('답변 등록에 실패했습니다.');
    }
  };

  // ----------------------
  // Notices handlers
  // ----------------------
  const handleNoticeSubmit = async () => {
    try {
      await axios.post('/api/notices', { title: newNotice.title.trim(), content: newNotice.content.trim() });
      setNewNotice({ title: '', content: '' });
      setOpenNoticeDialog(false);
      await fetchNotices();
      setToast({ open: true, message: '공지사항이 등록되었습니다.' });
    } catch (error) {
      setError('공지사항 등록에 실패했습니다.');
    }
  };

  const handleEditNotice = (notice) => {
    setSelectedNotice(notice);
    setEditNoticeTitle(notice.title || '');
    setEditNoticeContent(notice.content || '');
  };

  const handleSaveEditedNotice = async () => {
    if (!selectedNotice) return;
    try {
      await axios.put(`/api/notices/${selectedNotice._id}`, { title: editNoticeTitle.trim(), content: editNoticeContent.trim() });
      setSelectedNotice(null);
      await fetchNotices();
      setToast({ open: true, message: '공지사항이 수정되었습니다.' });
    } catch (error) {
      setError('공지사항 수정에 실패했습니다.');
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/api/notices/${noticeId}`);
      await fetchNotices();
      setToast({ open: true, message: '공지사항이 삭제되었습니다.' });
    } catch (error) {
      setError('공지사항 삭제에 실패했습니다.');
    }
  };

  // ----------------------
  // Cloudinary (both create & edit)
  // ----------------------
  const openUploadWidget = async (onSuccess) => {
    try {
      await loadCloudinaryScript();
      if (!window.cloudinary) throw new Error('Cloudinary 위젯 로드 실패');
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: cloudinaryCfg.cloudName,
          uploadPreset: cloudinaryCfg.uploadPreset,
          sources: ['local', 'url', 'camera'],
          multiple: false,
          maxFiles: 1
        },
        (error, result) => {
          if (!error && result && result.event === 'success') {
            const imageUrl = result.info.secure_url;
            onSuccess(imageUrl);
            setToast({ open: true, message: '이미지가 업로드되었습니다.' });
          }
        }
      );
      widget.open();
    } catch (e) {
      console.error(e);
      setError('이미지 업로드 위젯 실행에 실패했습니다.');
    }
  };

  // ----------------------
  // Contests handlers
  // ----------------------
  const handleOpenContestDialog = () => setOpenContestDialog(true);
  const handleCloseContestDialog = () => {
    setOpenContestDialog(false);
    setNewContest({ title: '', description: '', startDate: '', endDate: '', product: '', imageUrl: '' });
  };

  const handleContestSubmit = async () => {
    const { title, description, startDate, endDate, product } = newContest;
    if (!title || !description || !startDate || !endDate || !product) {
      setError('모든 필수 항목을 입력해주세요.');
      return;
    }
    try {
      await axios.post('/api/contests', newContest);
      handleCloseContestDialog();
      await fetchContests();
      setToast({ open: true, message: '공모전이 등록되었습니다.' });
    } catch (error) {
      setError('공모전 등록에 실패했습니다.');
    }
  };

  const handleDeleteContest = async (contestId) => {
    if (!window.confirm('정말로 이 공모전을 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/api/contests/${contestId}`);
      await fetchContests();
      setToast({ open: true, message: '공모전이 삭제되었습니다.' });
    } catch (error) {
      setError('공모전 삭제에 실패했습니다.');
    }
  };

  const handleEditContestOpen = (contest) => {
    setSelectedContest(contest);
    setEditContest({
      title: contest.title || '',
      description: contest.description || '',
      startDate: (contest.startDate || '').split('T')[0],
      endDate: (contest.endDate || '').split('T')[0],
      product: contest.product || '',
      imageUrl: contest.imageUrl || ''
    });
  };

  const handleSaveEditedContest = async () => {
    if (!selectedContest) return;
    const payload = { ...editContest };
    if (!payload.title || !payload.description || !payload.startDate || !payload.endDate || !payload.product) {
      setError('필수 값을 모두 입력해주세요.');
      return;
    }
    try {
      await axios.put(`/api/contests/${selectedContest._id}`, payload);
      setSelectedContest(null);
      await fetchContests();
      setToast({ open: true, message: '공모전이 수정되었습니다.' });
    } catch (error) {
      setError('공모전 수정에 실패했습니다.');
    }
  };

  const handleContestSelect = (contest) => {
    setSelectedContestForSubmissions(contest);
    if (contest?._id) fetchSubmissions(contest._id);
  };

  // ----------------------
  // Render
  // ----------------------
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
          <Button variant="contained" onClick={handleLogin}>로그인</Button>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>관리자 페이지</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3 }}>
          <Tab label="건의사항" />
          <Tab label="공지사항" />
          <Tab label="공모전" />
          <Tab label="응모 목록" />
        </Tabs>

        {/* 건의사항 */}
        {tabValue === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>건의사항 목록</Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
            ) : suggestions.length === 0 ? (
              <Typography variant="body1" color="text.secondary">아직 등록된 건의사항이 없습니다.</Typography>
            ) : (
              suggestions.map((s) => (
                <Card key={s._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" component="h2">{s.title}</Typography>
                      <Chip label={getStatusLabel(s.status)} color={getStatusColor(s.status)} size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>작성자: {s.author}</Typography>
                    <Typography variant="body1" paragraph>{s.content}</Typography>
                    {s.response && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>답변</Typography>
                        <Typography variant="body2">{s.response}</Typography>
                      </Box>
                    )}
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => { setSelectedSuggestion(s); setResponse(s.response || ''); setStatus(s.status || 'pending'); }}
                      >답변하기</Button>
                      <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteSuggestion(s._id)}>삭제</Button>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        )}

        {/* 공지사항 */}
        {tabValue === 1 && (
          <Box>
            <Button variant="contained" color="primary" onClick={() => setOpenNoticeDialog(true)}>공지사항 추가</Button>
            <Box sx={{ mt: 2 }}>
              {loadingNotices ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
              ) : notices.length === 0 ? (
                <Typography variant="body1" color="text.secondary">아직 등록된 공지사항이 없습니다.</Typography>
              ) : (
                notices.map((n) => (
                  <Paper key={n._id} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6">{n.title}</Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{n.content}</Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button variant="outlined" size="small" onClick={() => handleEditNotice(n)}>수정</Button>
                      <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteNotice(n._id)}>삭제</Button>
                    </Box>
                  </Paper>
                ))
              )}
            </Box>
          </Box>
        )}

        {/* 공모전 */}
        {tabValue === 2 && (
          <Box>
            <Button variant="contained" color="primary" onClick={handleOpenContestDialog}>공모전 추가</Button>
            <Box sx={{ mt: 2 }}>
              {loadingContests ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
              ) : contests.length === 0 ? (
                <Typography variant="body1" color="text.secondary">아직 등록된 공모전이 없습니다.</Typography>
              ) : (
                contests.map((c) => (
                  <Paper key={c._id} sx={{ p: 2, mb: 2 }}>
                    {c.imageUrl && (
                      <Box sx={{ mb: 2 }}>
                        <img src={c.imageUrl} alt={c.title} style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }} />
                      </Box>
                    )}
                    <Typography variant="h6">{c.title}</Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{c.description}</Typography>
                    <Typography variant="subtitle1">시작일: {new Date(c.startDate).toLocaleDateString()}</Typography>
                    <Typography variant="subtitle1">종료일: {new Date(c.endDate).toLocaleDateString()}</Typography>
                    <Typography variant="subtitle1">상품: {c.product}</Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button variant="outlined" size="small" onClick={() => handleEditContestOpen(c)}>수정</Button>
                      <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteContest(c._id)}>삭제</Button>
                    </Box>
                  </Paper>
                ))
              )}
            </Box>
          </Box>
        )}

        {/* 응모 목록 */}
        {tabValue === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>공모전 응모 목록</Typography>
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel>공모전 선택</InputLabel>
                <Select
                  value={selectedContestForSubmissions?._id || ''}
                  label="공모전 선택"
                  onChange={(e) => {
                    const contest = contests.find((c) => c._id === e.target.value);
                    handleContestSelect(contest || null);
                  }}
                >
                  {contests.map((c) => (
                    <MenuItem key={c._id} value={c._id}>{c.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {selectedContestForSubmissions && (
              <Box>
                <Typography variant="h6" gutterBottom>{selectedContestForSubmissions.title} 응모 목록</Typography>
                {loadingSubmissions ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
                ) : selectedContestSubmissions.length === 0 ? (
                  <Typography>아직 응모가 없습니다.</Typography>
                ) : (
                  selectedContestSubmissions.map((sub) => (
                    <Card key={sub._id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="h6">{sub.name} ({sub.grade})</Typography>
                        <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-line' }}>{sub.content}</Typography>
                        {sub.imageUrl && (
                          <Box sx={{ mt: 2 }}>
                            <img src={sub.imageUrl} alt="응모 이미지" style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }} />
                          </Box>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          응모일시: {new Date(sub.createdAt).toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Box>
            )}
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* 답변 모달 */}
        <Dialog open={!!selectedSuggestion} onClose={() => setSelectedSuggestion(null)}>
          <DialogTitle>답변 작성</DialogTitle>
          <DialogContent>
            <TextField fullWidth multiline rows={4} label="답변 내용" value={response} onChange={(e) => setResponse(e.target.value)} sx={{ mt: 2 }} />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>상태</InputLabel>
              <Select value={status} label="상태" onChange={(e) => setStatus(e.target.value)}>
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
            <TextField autoFocus margin="dense" label="제목" type="text" fullWidth variant="standard" value={editNoticeTitle} onChange={(e) => setEditNoticeTitle(e.target.value)} />
            <TextField margin="dense" label="내용" type="text" fullWidth multiline rows={4} variant="standard" value={editNoticeContent} onChange={(e) => setEditNoticeContent(e.target.value)} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedNotice(null)}>취소</Button>
            <Button onClick={handleSaveEditedNotice}>저장</Button>
          </DialogActions>
        </Dialog>

        {/* 공지사항 추가 모달 */}
        <Dialog open={openNoticeDialog} onClose={() => setOpenNoticeDialog(false)}>
          <DialogTitle>공지사항 추가</DialogTitle>
          <DialogContent>
            <TextField label="제목" value={newNotice.title} onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })} fullWidth margin="normal" required />
            <TextField label="내용" value={newNotice.content} onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })} fullWidth margin="normal" multiline rows={4} required />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenNoticeDialog(false)}>취소</Button>
            <Button onClick={handleNoticeSubmit} color="primary">추가</Button>
          </DialogActions>
        </Dialog>

        {/* 공모전 추가 모달 */}
        <Dialog open={openContestDialog} onClose={handleCloseContestDialog} maxWidth="md" fullWidth>
          <DialogTitle>새 공모전 등록</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField fullWidth label="제목" value={newContest.title} onChange={(e) => setNewContest({ ...newContest, title: e.target.value })} margin="normal" />
              <TextField fullWidth label="설명" value={newContest.description} onChange={(e) => setNewContest({ ...newContest, description: e.target.value })} margin="normal" multiline rows={4} />
              <TextField fullWidth label="시작일" type="date" value={newContest.startDate} onChange={(e) => setNewContest({ ...newContest, startDate: e.target.value })} margin="normal" InputLabelProps={{ shrink: true }} />
              <TextField fullWidth label="종료일" type="date" value={newContest.endDate} onChange={(e) => setNewContest({ ...newContest, endDate: e.target.value })} margin="normal" InputLabelProps={{ shrink: true }} />
              <TextField fullWidth label="상품" value={newContest.product} onChange={(e) => setNewContest({ ...newContest, product: e.target.value })} margin="normal" />
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button variant="contained" onClick={() => openUploadWidget((url) => setNewContest((prev) => ({ ...prev, imageUrl: url })))}>이미지 업로드</Button>
                {newContest.imageUrl && (
                  <img src={newContest.imageUrl} alt="Uploaded" style={{ maxWidth: 200, maxHeight: 200, objectFit: 'contain' }} />
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseContestDialog}>취소</Button>
            <Button onClick={handleContestSubmit} variant="contained" color="primary">등록</Button>
          </DialogActions>
        </Dialog>

        {/* 공모전 수정 모달 */}
        <Dialog open={!!selectedContest} onClose={() => setSelectedContest(null)} maxWidth="md" fullWidth>
          <DialogTitle>공모전 수정</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField fullWidth label="제목" value={editContest.title} onChange={(e) => setEditContest({ ...editContest, title: e.target.value })} margin="normal" required />
              <TextField fullWidth label="설명" value={editContest.description} onChange={(e) => setEditContest({ ...editContest, description: e.target.value })} margin="normal" multiline rows={4} required />
              <TextField fullWidth label="시작일" type="date" value={editContest.startDate} onChange={(e) => setEditContest({ ...editContest, startDate: e.target.value })} margin="normal" InputLabelProps={{ shrink: true }} required />
              <TextField fullWidth label="종료일" type="date" value={editContest.endDate} onChange={(e) => setEditContest({ ...editContest, endDate: e.target.value })} margin="normal" InputLabelProps={{ shrink: true }} required />
              <TextField fullWidth label="상품" value={editContest.product} onChange={(e) => setEditContest({ ...editContest, product: e.target.value })} margin="normal" required />
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button variant="contained" onClick={() => openUploadWidget((url) => setEditContest((prev) => ({ ...prev, imageUrl: url })))}>이미지 업로드</Button>
                {editContest.imageUrl && (
                  <img src={editContest.imageUrl} alt="Uploaded" style={{ maxWidth: 200, maxHeight: 200, objectFit: 'contain' }} />
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedContest(null)}>취소</Button>
            <Button onClick={handleSaveEditedContest} variant="contained" color="primary">저장</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={toast.open}
          autoHideDuration={2400}
          onClose={() => setToast({ open: false, message: '' })}
          message={toast.message}
        />
      </Paper>
    </Container>
  );
}

export default AdminPage;
