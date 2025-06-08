const express = require('express');
const router = express.Router();
const Contest = require('../models/Contest');

// 공모전 목록 조회
router.get('/', async (req, res) => {
  try {
    console.log('Fetching contests...');
    const contests = await Contest.find().sort({ createdAt: -1 });
    console.log('Contests found:', contests);
    res.json(contests);
  } catch (err) {
    console.error('Error fetching contests:', err);
    res.status(500).json({ 
      message: '공모전 목록을 불러오는데 실패했습니다.',
      error: err.message 
    });
  }
});

// 새로운 공모전 수를 반환하는 엔드포인트
router.get('/new-count', async (req, res) => {
  try {
    console.log('Fetching new contest count...');
    
    // 최근 24시간 이내의 공모전 수를 계산
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    console.log('Searching for contests after:', oneDayAgo);

    // 먼저 전체 공모전 수를 확인
    const totalCount = await Contest.countDocuments();
    console.log('Total contests:', totalCount);

    // 24시간 이내의 공모전 수 확인
    const count = await Contest.countDocuments({
      createdAt: { $gte: oneDayAgo }
    });
    
    console.log('New contests in last 24 hours:', count);

    // 최근 공모전 정보도 함께 반환
    const recentContests = await Contest.find()
      .sort({ createdAt: -1 })
      .limit(1)
      .select('title createdAt');

    res.json({ 
      count,
      totalCount,
      oneDayAgo,
      recentContest: recentContests[0] || null
    });
  } catch (error) {
    console.error('새로운 공모전 수를 가져오는데 실패했습니다:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error.message 
    });
  }
});

// 공모전 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ message: '공모전을 찾을 수 없습니다.' });
    res.json(contest);
  } catch (err) {
    console.error('Error fetching contest:', err);
    res.status(500).json({ 
      message: '공모전을 불러오는데 실패했습니다.',
      error: err.message 
    });
  }
});

// 공모전 생성
router.post('/', async (req, res) => {
  try {
    console.log('Received contest data:', req.body);

    const { title, description, startDate, endDate, product, imageUrl } = req.body;
    
    if (!title || !description || !startDate || !endDate || !product) {
      return res.status(400).json({ 
        message: '모든 필수 필드를 입력해주세요.',
        missing: {
          title: !title,
          description: !description,
          startDate: !startDate,
          endDate: !endDate,
          product: !product
        }
      });
    }

    const contest = new Contest({
      title,
      description,
      startDate,
      endDate,
      product,
      imageUrl: imageUrl || ''
    });

    const savedContest = await contest.save();
    console.log('Saved contest:', savedContest);
    res.status(201).json(savedContest);
  } catch (error) {
    console.error('Contest creation error:', error);
    res.status(500).json({ 
      message: '공모전 생성에 실패했습니다.',
      error: error.message 
    });
  }
});

// 공모전 수정
router.patch('/:id', async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ message: '공모전을 찾을 수 없습니다.' });
    
    if (req.body.title) contest.title = req.body.title;
    if (req.body.description) contest.description = req.body.description;
    if (req.body.startDate) contest.startDate = req.body.startDate;
    if (req.body.endDate) contest.endDate = req.body.endDate;
    if (req.body.product) contest.product = req.body.product;
    if (req.body.imageUrl) contest.imageUrl = req.body.imageUrl;
    
    const updatedContest = await contest.save();
    res.json(updatedContest);
  } catch (err) {
    console.error('Error updating contest:', err);
    res.status(400).json({ 
      message: '공모전 수정에 실패했습니다.',
      error: err.message 
    });
  }
});

// 공모전 삭제
router.delete('/:id', async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ message: '공모전을 찾을 수 없습니다.' });
    
    await contest.deleteOne();
    res.json({ message: '공모전이 삭제되었습니다.' });
  } catch (err) {
    console.error('Error deleting contest:', err);
    res.status(500).json({ 
      message: '공모전 삭제에 실패했습니다.',
      error: err.message 
    });
  }
});

module.exports = router; 