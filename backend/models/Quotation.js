const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  guestInfo: {
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
  // ===== NEW: Reference Images from Unsplash API =====
  referenceImages: [{
    unsplashId: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      match: /^https:\/\/images\.unsplash\.com\//
    },
    thumbUrl: {
      type: String,
      required: true,
      match: /^https:\/\/images\.unsplash\.com\//
    },
    description: {
      type: String,
      maxlength: 500,
      default: ''
    },
    photographer: {
      name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 100
      },
      username: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
      },
      profileLink: {
        type: String,
        required: true,
        match: /^https:\/\/unsplash\.com\/@/
      }
    },
    photoLink: {
      type: String,
      required: true,
      match: /^https:\/\/unsplash\.com\/photos\//
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // ===== End of new field =====
  dateRequested: {
    type: Date,
    default: Date.now
  },
  dateResponded: {
    type: Date
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt automatically
});

// ===== NEW: Validation hook for max 5 images =====
quotationSchema.pre('save', async function() {
  if (this.referenceImages && this.referenceImages.length > 5) {
    throw new Error('Maximum 5 reference images allowed per quotation');
  }
});

module.exports = mongoose.model('Quotation', quotationSchema);