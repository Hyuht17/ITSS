import mongoose from 'mongoose';

/**
 * Schedule Template Model
 * スケジュールテンプレートのデータモデル
 */
const scheduleTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'テンプレート名が必要です'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    defaultDuration: {
        type: Number, // Duration in minutes
        required: [true, 'デフォルトの時間が必要です'],
        min: [15, '最小時間は15分です'],
        default: 60
    },
    icon: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['meeting', 'lesson', 'discussion', 'other'],
        default: 'meeting'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for ordering
scheduleTemplateSchema.index({ order: 1, isActive: 1 });

export default mongoose.model('ScheduleTemplate', scheduleTemplateSchema);

