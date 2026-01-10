const Service = require('../models/Service');

// Get all active services
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ dateCreated: -1 });
    
    res.status(200).json({
      success: true,
      count: services.length,
      services
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching services'
    });
  }
};

// Get single service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.status(200).json({
      success: true,
      service
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service'
    });
  }
};

// Create new service (Admin only)
exports.createService = async (req, res) => {
  try {
    const { name, description, category, price, duration, features, image } = req.body;
    
    // Validation
    if (!name || !description || !category || !price || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    const service = await Service.create({
      name,
      description,
      category,
      price,
      duration,
      features: features || [],
      image: image || '',
      createdBy: req.user.id // From auth middleware
    });
    
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating service'
    });
  }
};

// Update service (Admin only)
exports.updateService = async (req, res) => {
  try {
    const { name, description, category, price, duration, features, image, isActive } = req.body;
    
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    // Update fields
    if (name) service.name = name;
    if (description) service.description = description;
    if (category) service.category = category;
    if (price) service.price = price;
    if (duration) service.duration = duration;
    if (features) service.features = features;
    if (image) service.image = image;
    if (typeof isActive !== 'undefined') service.isActive = isActive;
    
    await service.save();
    
    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating service'
    });
  }
};

// Delete service (Admin only)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    await service.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting service'
    });
  }
};