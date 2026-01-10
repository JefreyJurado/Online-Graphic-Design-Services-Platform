const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// This function runs when someone registers.
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    
    //Check if email already exists
    //Searches the database for a user with the same email
    //Prevents duplicate accounts
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    //Create new user
    //Saves the user in MongoDB
    //Password is usually:hashed automatically using a pre('save') hook in the User model
    const user = await User.create({ name, email, password, phone, address });

    //Generate JWT token for the new user
    //Uses the helper function, Stores: user ID, user role (e.g., admin / user)
    const token = generateToken(user._id, user.role);
    
    //Send response to client
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

    //Error handling, Catches server/database errors, Prevents app crash
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

//login function (User Login)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body; //Get email & password
    
    //Validate input, revents empty login attempts
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    
    //Find user by email, If email not found → login fails
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    //Compare passwords, Uses bcrypt to compare hashed passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    //Generate JWT token upon successful login
    const token = generateToken(user._id, user.role);
    
    //Send response with token and user info
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};