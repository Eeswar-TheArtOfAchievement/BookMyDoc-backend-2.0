const Admin = require('../models/adminModel'); // Adjust the path to your Admin model

/**
 * Get all admins
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({ role: 'admin' }); // Retrieve all admins from the database
        return res.status(200).json(admins); // Send back the list of admins
    } catch (error) {
        console.error('Error retrieving admins:', error);
        return res.status(500).json({ message: 'Internal server error' }); // Handle any errors
    }
};
exports.admin = async (req, res) => {
    try {
        const adminId = req.admin.id; // Get the user ID from the token
        const admin1 = await Admin.findById(adminId).select('-encPassword'); // Exclude password from response
        if (!admin1) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        
        // Return all user details
        res.json({
            id: admin1._id, // Include the user ID
            email: admin1.email,
            fullName: admin1.fullName,
            gender: admin1.gender,
            dateOfBirth: admin1.dateOfBirth,
            location : admin1.location,
            phone :admin1.phone,
            profileImage: admin1.profileImage,
            
            // Add more fields as necessary
        });
        
    } catch (err) {
        console.error(err); // Log the entire error for debugging
        res.status(500).json({ message: err.message });
    }
};
/**
 * Create a new admin
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
exports.createAdmin = async (req, res) => {
    const { email, password , fullName , role } = req.body;

    try {
        // Validate input (this can be expanded as needed)
        if (!fullName || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
        const admin = new Admin({ email, password , fullName , role, otp, otpExpires, isVerified: false });
        await admin.save();
        await sendEmail(email, 'Your OTP Code', `Your OTP code is ${otp}. It is valid for 10 minutes.`);
        res.status(201).json('Admin registered. Please check your email for the OTP.');
    } catch (error) {
        console.error('Error creating admin:', error);
        return res.status(500).json({ message: 'Internal server error' }); // Handle any errors
    }
};

exports.logout = (req, res) => { 
    res.json({ message: 'Admin logged out' });
};

exports.updateAdmin = async (req, res) => {
    try {
      const { adminId } = req.params; // Extract userId from URL parameters the fields from req.body
      const { fullName, phone, gender,  location, dateOfBirth } = req.body;
      // Build the updatedDetails object using only the fields provided in the request
      const updatedDetails = {};
      if (fullName) updatedDetails.fullName = fullName;
      if (phone) updatedDetails.phone = phone;  
      if (gender) updatedDetails.gender = gender;
      if (location) updatedDetails.location = location;
      if (dateOfBirth) updatedDetails.dateOfBirth = dateOfBirth;
  
      // Use $set to update the specified fields in the MongoDB document
      const updatedAdmin = await Admin.findByIdAndUpdate(
        adminId,
        { $set: updatedDetails },
        { new: true, runValidators: true }
      );
  
      // Send success response with the updated user document
      res.status(200).json({
        message: 'admin details updated successfully',
        user: updatedAdmin,
      });
    } catch (error) {
      // Handle any errors that occur during the update process
      res.status(500).json({
        message: 'Error updating admin details',
        error: error.message,
      });
    }
  };