const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
    enum: ['pending', 'reviewing', 'quoted', 'accepted', 'rejected', 'completed'],
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
  dateRequested: {
    type: Date,
    default: Date.now
  },
  dateResponded: {
    type: Date
  }
});

module.exports = mongoose.model('Quotation', quotationSchema);