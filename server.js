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

/* ===== 업로드 디렉터리(로컬 vs Render) ===== */
const UPLOAD_DIR = process.env.RENDER ? '/tmp/uploads' : path.join(__dirname, 'uploads');

/* ===== Cloudinary (임시로 그대로 유지) ===== */
cloudinary.config({
  cloud_name: 'dtrzecb0l',
  api_key: '427118938288478',
  api_secret: 'rFeZ3fk-0ekeLdEcQeZa5SiPU60'
});

/* ===== Multer 설정 (Render는 /tmp 사용) ===== */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
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
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    // ✅ Cloudinary 위젯 & API 허용을 위한 CSP 추가
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://widget.cloudinary.com", "'unsafe-inline'"],
        connectSrc: ["'self'", "https://api.cloudinary.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        frameSrc: ["'self'", "https://widget.cloudinary.com"],
        workerSrc: ["'self'", "blob:"]
      }
    }
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  createParentPath: true,
  useTempFiles: true,      // ✅ temp 파일 사용
  tempFileDir: '/tmp',     // ✅ Render 호환
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}));

/* 로컬 개발 시 정적 업로드 경로 서빙 (Render에서는 주로 Cloudinary URL 사용) */
app.use('/uploads', express.static(UPLOAD_DIR));

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

/* ===== API 라우트 (정적 서빙보다 먼저) ===== */
app.use('/api/suggestions', suggestionsRouter);
app.use('/api/notices', noticesRouter);
app.use('/api/contests', contestsRouter);
app.use('/api/submissions', submissionsRouter);

/* ===== React 정적 파일 서빙 ===== */
app.use(express.static(path.join(__dirname, 'client', 'build')));

/* SPA 라우팅: /api 제외 모든 경로를 React로 */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

/* ===== 404 & 에러 핸들러 ===== */
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
