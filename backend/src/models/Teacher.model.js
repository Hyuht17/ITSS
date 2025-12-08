import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    jobTitle: {
        type: String,
        trim: true,
        default: ''
    },
    gender: {
        type: String,
        enum: ['男性', '女性', 'その他', ''],
        default: ''
    },
    location: {
        type: String,
        trim: true,
        default: ''
    },
    workplace: {
        type: String,
        trim: true,
        default: ''
    },
    yearsOfExperience: {
        type: Number,
        min: 0,
        default: 0
    },
    nationality: {
        type: String,
        trim: true,
        default: ''
    },
    profilePhoto: {
        type: String,
        default: ''
    },
    specialties: {
        type: [String],
        default: []
    },
    teachingStyle: {
        type: String,
        default: ''
    },
    shareThemes: {
        type: [String],
        default: []
    },
    learnThemes: {
        type: [String],
        default: []
    },
    certifications: {
        type: [String],
        default: []
    },
    hobbies: {
        type: [String],
        default: []
    },
    socialLinks: {
        twitter: {
            type: String,
            default: ''
        },
        facebook: {
            type: String,
            default: ''
        },
        linkedin: {
            type: String,
            default: ''
        }
    }
}, {
    timestamps: true
});

// インデックス
// teacherSchema.index({ userId: 1 }); // Removed duplicate index
teacherSchema.index({ location: 1 });
teacherSchema.index({ specialties: 1 });

// プロフィール写真URLを取得（プレースホルダー対応）
teacherSchema.methods.getProfilePhotoUrl = function () {
    if (!this.profilePhoto || this.profilePhoto.trim() === '') {
        const encodedName = encodeURIComponent(this.name);
        return `https://ui-avatars.com/api/?name=${encodedName}&size=200&background=2563eb&color=fff`;
    }
    return this.profilePhoto;
};

// レスポンス用フォーマット
teacherSchema.methods.toJSON = function () {
    const obj = this.toObject();
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    obj.profilePhoto = this.getProfilePhotoUrl();
    return obj;
};

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;
