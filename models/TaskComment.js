const mongoose = require('mongoose');

const taskCommentSchema = new mongoose.Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true,
        trim: true
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

module.exports = mongoose.model('TaskComment', taskCommentSchema);
