// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const fileUpload = require('express-fileupload');
require('dotenv').config();

const suggestionsRouter = require('./routes/suggestions');
const noticesRouter = require('./routes/notices');
const contestsRouter = require('./routes/contests');
const submissionsRouter = require('./routes/submissions');

const app = express();

/* ===== Cloudinary (임시로 그대로 유지) ===== */
cloudinary.config({
  cloud_name: 'dtrzecb0l',
  api_key: '427118938288478',
  api_secret: 'rFeZ3fk-0ekeLdEcQeZa5SiPU60'
});

/* ===== Multer 설정 ===== */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

/* ===== 공통 미들웨어 ===== */
app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}));
app.use('/uploads', express.static('uploads'));

/* ===== MongoDB Atlas 연결 (환경변수 사용) ===== */
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI 환경변수가 없습니다. Render → Environment에 추가하세요.');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

mongoose.connection.on('error', err => {
  console.error('MongoDB 연결 에러:', err);
});

/* ===== API 라우트 (반드시 정적 서빙보다 먼저) ===== */
app.use('/api/suggestions', suggestionsRouter);
app.use('/api/notices', noticesRouter);
app.use('/api/contests', contestsRouter);
app.use('/api/submissions', submissionsRouter);

/* ===== React 정적 파일 서빙 ===== */
app.use(express.static(path.join(__dirname, 'client', 'build')));

/* SPA 라우팅: /api 제외 모든 경로를 React로 */
app.get('*', (req, res, next) => {
  // 정적 파일이 있으면 express.static이 처리하며, 나머지는 index.html 반환
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

/* ===== 404 & 에러 핸들러 (맨 끝) ===== */
app.use((req, res) => {
  res.status(404).json({ message: '요청하신 경로를 찾을 수 없습니다.' });
});

app.use((err, req, res, next) => {
  console.error('서버 에러 발생:', err);
  res.status(500).json({ message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
});

/* ===== 서버 시작 ===== */
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});

