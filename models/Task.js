const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        default: null
    },
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    assignedTo: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'in-progress', 'completed']
    },
    priority: {
        type: String,
        default: 'medium',
        enum: ['low', 'medium', 'high']
    },
    dueDate: {
        type: Date,
        default: null
    },
    completedDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            if (ret.projectId) ret.projectId = ret.projectId.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

module.exports = mongoose.model('Task', taskSchema);
