const mongoose = require('mongoose');

// 기존 모델 삭제 (인덱스 제거를 위해)
mongoose.models = {};

const suggestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'rejected'],
    default: 'pending'
  },
  response: {
    type: String,
    default: ''
  },
  likes: {
    type: [String],
    default: []
  },
  dislikes: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  autoIndex: false // 자동 인덱스 생성 비활성화
});

// likes 필드의 인덱스 제거
suggestionSchema.index({ likes: 1 }, { unique: false });

module.exports = mongoose.model('Suggestion', suggestionSchema); 