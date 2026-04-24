const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false  // Don't return password in queries by default
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: ['admin', 'leader', 'employee']
    },
    domain: {
        type: String,
        default: '',
        trim: true
    },
    profilePicture: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Don't include password when converting to JSON; use id instead of _id for API
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    user.id = user._id.toString();
    delete user._id;
    delete user.__v;
    delete user.password;
    return user;
};

module.exports = mongoose.model('User', userSchema);
