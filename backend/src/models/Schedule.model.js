import mongoose from 'mongoose';

/**
 * Schedule Model
 * スケジュール・予定のデータモデル
 */
const scheduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'スケジュールのタイトルが必要です'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    startTime: {
        type: Date,
        required: [true, '開始時間が必要です']
    },
    endTime: {
        type: Date,
        required: [true, '終了時間が必要です'],
        validate: {
            validator: function (value) {
                return value > this.startTime;
            },
            message: '終了時間は開始時間より後である必要があります'
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    matchingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Matching',
        required: false
    },
    location: {
        name: {
            type: String,
            trim: true
        },
        address: {
            type: String,
            trim: true
        },
        lat: {
            type: Number
        },
        lng: {
            type: Number
        }
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
scheduleSchema.index({ startTime: 1, endTime: 1 });
scheduleSchema.index({ createdBy: 1 });
scheduleSchema.index({ participants: 1 });
scheduleSchema.index({ status: 1 });

// Virtual for duration in minutes
scheduleSchema.virtual('duration').get(function () {
    return Math.round((this.endTime - this.startTime) / (1000 * 60));
});

export default mongoose.model('Schedule', scheduleSchema);

