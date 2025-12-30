import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    matchingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MatchingRequest',
        required: [true, 'マッチングIDが必要です']
    },
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, '評価者IDが必要です']
    },
    revieweeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, '被評価者IDが必要です']
    },
    overallRating: {
        type: Number,
        required: [true, '全体評価が必要です'],
        min: [1, '評価は1以上である必要があります'],
        max: [5, '評価は5以下である必要があります']
    },
    ratings: {
        knowledge: {
            type: Number,
            required: [true, '知識評価が必要です'],
            min: [1, '評価は1以上である必要があります'],
            max: [5, '評価は5以下である必要があります']
        },
        communication: {
            type: Number,
            required: [true, '伝達力評価が必要です'],
            min: [1, '評価は1以上である必要があります'],
            max: [5, '評価は5以下である必要があります']
        },
        attitude: {
            type: Number,
            required: [true, '態度評価が必要です'],
            min: [1, '評価は1以上である必要があります'],
            max: [5, '評価は5以下である必要があります']
        }
    },
    comment: {
        type: String,
        maxlength: [300, 'コメントは300文字以内である必要があります'],
        trim: true
    },
    meetingPhoto: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Index for faster queries
feedbackSchema.index({ matchingId: 1 });
feedbackSchema.index({ reviewerId: 1 });
feedbackSchema.index({ revieweeId: 1 });

// Ensure one feedback per reviewer per matching
feedbackSchema.index({ matchingId: 1, reviewerId: 1 }, { unique: true });

export default mongoose.model('Feedback', feedbackSchema);
