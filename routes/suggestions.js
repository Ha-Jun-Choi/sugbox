const express = require('express');
const router = express.Router();
const Suggestion = require('../models/Suggestion');
const mongoose = require('mongoose');

// 모든 건의사항 조회
router.get('/', async (req, res) => {
  try {
    const suggestions = await Suggestion.find().sort({ createdAt: -1 });
    res.json(suggestions);
  } catch (err) {
    console.error('건의사항 조회 실패:', err);
    res.status(500).json({ message: '건의사항을 불러오는데 실패했습니다.' });
  }
});

// 새로운 건의사항 생성
router.post('/', async (req, res) => {
  try {
    // MongoDB 연결 상태 확인
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB 연결이 끊어져 있습니다.');
      return res.status(503).json({ message: '데이터베이스 연결이 불안정합니다.' });
    }

    console.log('건의사항 생성 요청 받음:', {
      body: req.body,
      contentType: req.headers['content-type']
    });

    // 필수 필드 확인
    if (!req.body.title || !req.body.content || !req.body.author) {
      console.log('필수 필드 누락:', {
        title: req.body.title,
        content: req.body.content,
        author: req.body.author
      });
      return res.status(400).json({ message: '제목, 내용, 작성자는 필수 입력 항목입니다.' });
    }

    // 새 건의사항 객체 생성
    const suggestion = new Suggestion({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      status: 'pending'
    });

    console.log('생성할 건의사항 객체:', suggestion.toObject());

    // 저장 시도
    const newSuggestion = await suggestion.save();
    console.log('건의사항 생성 성공:', newSuggestion.toObject());
    
    res.status(201).json(newSuggestion);
  } catch (err) {
    console.error('건의사항 생성 실패:', {
      error: err.message,
      name: err.name,
      code: err.code,
      stack: err.stack,
      validationErrors: err.errors
    });

    // Mongoose 검증 에러 처리
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: '입력 데이터가 올바르지 않습니다.',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }

    // MongoDB 연결 에러 처리
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
      return res.status(503).json({ 
        message: '데이터베이스 연결이 불안정합니다.'
      });
    }

    res.status(500).json({ message: '건의사항 등록에 실패했습니다.' });
  }
});

// 건의사항 상태 업데이트
router.patch('/:id', async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);
    if (!suggestion) {
      return res.status(404).json({ message: '건의사항을 찾을 수 없습니다.' });
    }

    if (req.body.status) suggestion.status = req.body.status;
    if (req.body.response) suggestion.response = req.body.response;
    suggestion.updatedAt = Date.now();

    const updatedSuggestion = await suggestion.save();
    res.json(updatedSuggestion);
  } catch (err) {
    console.error('건의사항 업데이트 실패:', err);
    res.status(500).json({ message: '건의사항 수정에 실패했습니다.' });
  }
});

// 건의사항 삭제
router.delete('/:id', async (req, res) => {
  try {
    const suggestion = await Suggestion.findByIdAndDelete(req.params.id);
    if (!suggestion) {
      return res.status(404).json({ message: '건의사항을 찾을 수 없습니다.' });
    }
    res.json({ message: '건의사항이 삭제되었습니다.' });
  } catch (err) {
    console.error('건의사항 삭제 실패:', err);
    res.status(500).json({ message: '건의사항 삭제에 실패했습니다.' });
  }
});

module.exports = router; 
