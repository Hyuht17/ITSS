import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    timeSlots: {
        type: [String],
        required: true,
        enum: ['morning', 'afternoon', 'evening'],
        validate: {
            validator: function (v) {
                return v.length > 0 && v.length <= 2;
            },
            message: '時間帯は1〜2枠まで選択できます'
        }
    },
    location: {
        type: String,
        required: true,
        enum: ['ハノイ', 'ダナン', 'ニャチャン', 'カントー', 'ホーチミン市', 'ハイフォン']
    },
    status: {
        type: String,
        enum: ['available', 'matched', 'completed'],
        default: 'available'
    }
}, {
    timestamps: true
});

// インデックス
availabilitySchema.index({ teacherId: 1, date: 1 });
availabilitySchema.index({ status: 1 });
availabilitySchema.index({ location: 1 });

// レスポンス用フォーマット
availabilitySchema.methods.toJSON = function () {
    const obj = this.toObject();
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
};

const Availability = mongoose.model('Availability', availabilitySchema);

export default Availability;
