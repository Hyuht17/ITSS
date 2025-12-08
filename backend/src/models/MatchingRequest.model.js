import mongoose from 'mongoose';

const matchingRequestSchema = new mongoose.Schema({
    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    message: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// 同じペアでの重複申請（pending状態）を防ぐ
matchingRequestSchema.index(
    { requesterId: 1, receiverId: 1 },
    { unique: true, partialFilterExpression: { status: 'pending' } }
);

const MatchingRequest = mongoose.model('MatchingRequest', matchingRequestSchema);

export default MatchingRequest;
