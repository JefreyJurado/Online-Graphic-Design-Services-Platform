const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // ← CHANGED: Now optional for guest users
  },
  guestInfo: {     // ← NEW: Store guest contact info
    name: String,
    email: String,
    phone: String
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  budget: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  additionalInfo: {
    type: String,
    default: ''
  },
    status: {
    type: String,
    enum: ['pending', 'reviewing', 'quoted', 'accepted', 'in_progress', 'revision_requested', 'completed', 'rejected'],
    default: 'pending'
  },
  quotedPrice: {
    type: Number,
    default: 0
  },
  adminNotes: {
    type: String,
    default: ''
  },
  revisionRequest: {
    type: String,
    default: ''
  },
  revisionFee: {
    type: Number,
    default: 0
  },
  revisionCount: {
    type: Number,
    default: 0
  },
  dateRequested: {
    type: Date,
    default: Date.now
  },
  dateResponded: {
    type: Date
  }
});

module.exports = mongoose.model('Quotation', quotationSchema);