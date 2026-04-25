const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalMovies = await Movie.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    const completedBookings = await Booking.find({ paymentStatus: 'completed' });
    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalBookings = await Booking.countDocuments();

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('user', 'name email')
      .populate({
        path: 'showtime',
        populate: {
          path: 'movie',
          select: 'title'
        }
      });

    res.json({
      stats: {
        totalRevenue: `Rs ${totalRevenue.toLocaleString()}`,
        totalBookings: totalBookings.toLocaleString(),
        activeMovies: totalMovies.toString(),
        totalUsers: totalUsers.toLocaleString()
      },
      recentBookings: recentBookings.map(b => ({
        id: `#B-${b._id.toString().slice(-4).toUpperCase()}`,
        user: b.user?.name || 'Guest',
        movie: b.showtime?.movie?.title || 'Unknown Movie',
        seats: b.seats.map(s => `${s.row}${s.number}`).join(', '),
        amount: `Rs ${b.totalAmount}`,
        status: b.paymentStatus === 'completed' ? 'Confirmed' : b.paymentStatus === 'pending' ? 'Pending' : 'Cancelled',
        date: b.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status } = req.body;
    
    if (id === req.user.id && (role === 'user' || status === 'inactive')) {
       return res.status(400).json({ message: 'You cannot demote or deactivate yourself' });
    }

    const user = await User.findByIdAndUpdate(
      id, 
      { name, email, role, status }, 
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ message: error.message || 'Error updating user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id === req.user.id) {
       return res.status(400).json({ message: 'You cannot delete yourself' });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      status: 'active'
    });

    await newUser.save();
    const userResponse = newUser.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Create User Error:', error);
    res.status(500).json({ message: error.message || 'Error creating user' });
  }
};
