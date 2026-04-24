const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    from: {
        type: String,
        default: ''
    },
    targetRole: {
        type: String,
        default: null  // 'admin', 'leader', 'employee', or 'all'
    },
    targetUser: {
        type: String,
        default: null
    },
    type: {
        type: String,
        default: 'general'
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        default: null
    },
    deadlineDate: {
        type: Date,
        default: null
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            if (ret.taskId) ret.taskId = ret.taskId.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

module.exports = mongoose.model('Notification', notificationSchema);
