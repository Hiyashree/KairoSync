const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    domain: {
        type: String,
        default: ''
    },
    leader: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'completed', 'on-hold']
    }
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

module.exports = mongoose.model('Project', projectSchema);
