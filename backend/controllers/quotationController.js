const Quotation = require('../models/Quotation');
const Service = require('../models/Service');
const emailService = require('../utils/emailService');

// Create new quotation request (Client or Guest)
exports.createQuotation = async (req, res) => {
  try {
    const { service, projectName, description, budget, deadline, additionalInfo, guestName, guestEmail, guestPhone } = req.body;
    
    // Validation
    if (!service || !projectName || !description || !budget || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Check if service exists
    const serviceExists = await Service.findById(service);
    if (!serviceExists) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    // Determine if this is a guest or logged-in user
    let clientId = null;
    let guestInfo = {};
    
    if (req.user) {
      // Logged-in user
      clientId = req.user.id;
    } else {
      // Guest user - validate guest info
      if (!guestName || !guestEmail) {
        return res.status(400).json({
          success: false,
          message: 'Guest users must provide name and email'
        });
      }
      guestInfo = {
        name: guestName,
        email: guestEmail,
        phone: guestPhone || ''
      };
    }
    
    // Create quotation
    const quotation = await Quotation.create({
      client: clientId, // Will be null for guests
      service,
      projectName,
      description,
      budget,
      deadline,
      additionalInfo: additionalInfo || '',
      guestInfo: clientId ? undefined : guestInfo // Only store guest info if not logged in
    });
    
    // Populate service info
    await quotation.populate('service', 'name category price');
    if (clientId) {
      await quotation.populate('client', 'name email phone');
    }
    
    res.status(201).json({
      success: true,
      message: 'Quotation request submitted successfully',
      quotation
    });
  } catch (error) {
    console.error('Create quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating quotation request'
    });
  }
};

// Get all quotations for logged-in client
exports.getMyQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find({ client: req.user.id })
      .populate('service', 'name category price')
      .sort({ dateRequested: -1 });
    
    res.status(200).json({
      success: true,
      count: quotations.length,
      quotations
    });
  } catch (error) {
    console.error('Get quotations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quotations'
    });
  }
};

// Get single quotation by ID
exports.getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('service', 'name category price duration')
      .populate('client', 'name email phone address');
    
    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }
    
    // Check if user is authorized (client owns it or user is admin)
    if (quotation.client && quotation.client._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this quotation'
      });
    }
    
    res.status(200).json({
      success: true,
      quotation
    });
  } catch (error) {
    console.error('Get quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quotation'
    });
  }
};

// Get all quotations (Admin only)
exports.getAllQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find()
      .populate('service', 'name category price')
      .populate('client', 'name email phone')
      .sort({ dateRequested: -1 });
    
    res.status(200).json({
      success: true,
      count: quotations.length,
      quotations
    });
  } catch (error) {
    console.error('Get all quotations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quotations'
    });
  }
};

// Update quotation status (Admin only, except clients can request revisions)
exports.updateQuotation = async (req, res) => {
  try {
    const { status, quotedPrice, adminNotes, revisionRequest, revisionFee, revisionCount } = req.body;
    
    const quotation = await Quotation.findById(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }
    
    // Allow clients to request revisions on their own quotes
    if (req.user.role === 'client') {
      // Check if this is their quote
      if (quotation.client && quotation.client.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this quotation'
        });
      }
      
      // Clients can ONLY request revisions
      if (status !== 'revision_requested' || !revisionRequest) {
        return res.status(403).json({
          success: false,
          message: 'Clients can only request revisions'
        });
      }
      
      // Update with revision request
      quotation.status = 'revision_requested';
      quotation.revisionRequest = revisionRequest;
    } else {
      // Admin can update everything
      if (status) quotation.status = status;
      if (quotedPrice) quotation.quotedPrice = quotedPrice;
      if (adminNotes) quotation.adminNotes = adminNotes;
      if (revisionFee) quotation.revisionFee = revisionFee;
      if (revisionCount) quotation.revisionCount = quotation.revisionCount + 1;
      if (revisionRequest !== undefined) quotation.revisionRequest = revisionRequest;
      
      if (status && status !== 'pending') {
        quotation.dateResponded = Date.now();
      }
    }
    
    await quotation.save();
    
    await quotation.populate('service', 'name category price');
    if (quotation.client) {
      await quotation.populate('client', 'name email phone');
    }
    
    // Send email notification
    try {
      await emailService.sendQuoteResponseEmail(quotation);
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
    }
    
    res.status(200).json({
      success: true,
      message: 'Quotation updated successfully',
      quotation
    });
  } catch (error) {
    console.error('Update quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating quotation'
    });
  }
};

// Delete quotation (Admin only)
exports.deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }
    
    await quotation.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Quotation deleted successfully'
    });
  } catch (error) {
    console.error('Delete quotation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting quotation'
    });
  }
};