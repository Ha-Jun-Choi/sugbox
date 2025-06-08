const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const cloudinary = require('cloudinary').v2;
const Contest = require('../models/Contest');
const mongoose = require('mongoose');

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 특정 공모전의 응모 목록 조회
router.get('/contest/:contestId', async (req, res) => {
  try {
    console.log('Fetching submissions for contest:', req.params.contestId);
    const submissions = await Submission.find({ contestId: req.params.contestId })
      .sort({ createdAt: -1 });
    console.log('Submissions found:', submissions);
    res.json(submissions);
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.status(500).json({ message: err.message });
  }
});

// 응모하기
router.post('/', async (req, res) => {
  try {
    console.log('Received submission request:', req.body);
    const { contestId, name, grade, content, imageUrl } = req.body;

    // 필수 필드 검증
    if (!contestId || !name || !grade || !content) {
      console.log('Missing required fields:', { contestId, name, grade, content });
      return res.status(400).json({ message: '이름, 학년, 내용은 필수 항목입니다.' });
    }

    // contestId가 유효한 ObjectId인지 확인
    if (!mongoose.Types.ObjectId.isValid(contestId)) {
      console.log('Invalid contestId format:', contestId);
      return res.status(400).json({ message: '유효하지 않은 공모전 ID입니다.' });
    }

    // 공모전이 존재하는지 확인
    const contest = await Contest.findById(contestId);
    if (!contest) {
      console.log('Contest not found:', contestId);
      return res.status(404).json({ message: '해당 공모전을 찾을 수 없습니다.' });
    }

    // 현재 날짜가 공모전 기간 내인지 확인
    const now = new Date();
    if (now < contest.startDate || now > contest.endDate) {
      console.log('Contest is not active:', { now, startDate: contest.startDate, endDate: contest.endDate });
      return res.status(400).json({ message: '현재 진행 중인 공모전이 아닙니다.' });
    }

    const submission = new Submission({
      contestId: new mongoose.Types.ObjectId(contestId),
      name: name.trim(),
      grade: grade.trim(),
      content: content.trim(),
      imageUrl: imageUrl ? imageUrl.trim() : undefined
    });

    console.log('Creating new submission:', submission);
    const newSubmission = await submission.save();
    console.log('Submission created successfully:', newSubmission);
    res.status(201).json(newSubmission);
  } catch (err) {
    console.error('Error creating submission:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: '입력 데이터가 올바르지 않습니다.',
        error: err.message 
      });
    }
    res.status(500).json({ 
      message: '응모 처리 중 오류가 발생했습니다.',
      error: err.message 
    });
  }
});

// 응모 삭제 (관리자용)
router.delete('/:id', async (req, res) => {
  try {
    console.log('Deleting submission:', req.params.id);
    await Submission.findByIdAndDelete(req.params.id);
    console.log('Submission deleted successfully');
    res.json({ message: '응모가 삭제되었습니다.' });
  } catch (err) {
    console.error('Error deleting submission:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 