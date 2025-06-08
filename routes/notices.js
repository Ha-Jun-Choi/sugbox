const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const cloudinary = require('cloudinary').v2;

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 공지사항 목록 조회
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 새로운 공지사항 수를 반환하는 엔드포인트
router.get('/new-count', async (req, res) => {
  try {
    // 최근 24시간 이내의 공지사항 수를 계산
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const count = await Notice.countDocuments({
      createdAt: { $gte: oneDayAgo }
    });

    res.json({ count });
  } catch (error) {
    console.error('새로운 공지사항 수를 가져오는데 실패했습니다:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 공지사항 작성
router.post('/', async (req, res) => {
  try {
    console.log('Received notice data:', req.body);

    const notice = new Notice({
      title: req.body.title,
      content: req.body.content
    });

    const newNotice = await notice.save();
    console.log('Notice saved successfully:', newNotice);
    res.status(201).json(newNotice);
  } catch (err) {
    console.error('Notice creation error:', err);
    res.status(400).json({ message: err.message });
  }
});

// 공지사항 삭제
router.delete('/:id', async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: '공지사항이 삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 공지사항 수정 (PUT 또는 PATCH 사용 가능, 여기서는 PUT 사용)
router.put('/:id', async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (notice == null) {
      return res.status(404).json({ message: '공지사항을 찾을 수 없습니다.' });
    }

    if (req.body.title != null) {
      notice.title = req.body.title;
    }
    if (req.body.content != null) {
      notice.content = req.body.content;
    }
    if (req.files && req.files.image) {
      const result = await cloudinary.uploader.upload(req.files.image.tempFilePath);
      notice.imageUrl = result.secure_url;
    }

    const updatedNotice = await notice.save();
    res.json(updatedNotice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;