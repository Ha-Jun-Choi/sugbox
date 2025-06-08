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

// Cloudinary 설정
cloudinary.config({
  cloud_name: 'dtrzecb0l',
  api_key: '427118938288478',
  api_secret: 'rFeZ3fk-0ekeLdEcQeZa5SiPU60'
});

// Multer 설정
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
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB 제한
  }
});

// Middleware
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
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB 제한
  }
}));
app.use('/uploads', express.static('uploads'));

// MongoDB 연결
mongoose.connect('mongodb://127.0.0.1:27017/mind-voice-box', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB 연결 성공');
})
.catch((err) => {
  console.error('MongoDB 연결 실패:', err);
  process.exit(1);
});

// MongoDB 연결 이벤트 핸들러
mongoose.connection.on('error', err => {
  console.error('MongoDB 연결 에러:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB 연결이 끊어졌습니다. 재연결을 시도합니다...');
  mongoose.connect('mongodb://127.0.0.1:27017/mind-voice-box', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
  });
});

// API 라우트
app.use('/api/suggestions', suggestionsRouter);
app.use('/api/notices', noticesRouter);
app.use('/api/contests', contestsRouter);
app.use('/api/submissions', submissionsRouter);

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error('서버 에러 발생:', err);
  res.status(500).json({ message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
});

// 404 에러 핸들링
app.use((req, res) => {
  res.status(404).json({ message: '요청하신 경로를 찾을 수 없습니다.' });
});

// React 앱 서빙
app.use(express.static(path.join(__dirname, 'client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// 포트 설정
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
