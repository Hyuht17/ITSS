import { uploadToCloudinary } from '../utils/upload.util.js';

/**
 * Upload meeting photo to Cloudinary
 * POST /api/upload/meeting-photo
 */
export const uploadMeetingPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'ファイルが選択されていません'
            });
        }

        // Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(
            req.file.buffer,
            'meeting-photos',
            `meeting_${req.user.userId}_${Date.now()}`
        );

        res.json({
            success: true,
            message: 'Meeting photo uploaded successfully',
            data: {
                url: uploadResult.secure_url,
                publicId: uploadResult.public_id
            }
        });
    } catch (error) {
        console.error('Upload meeting photo error:', error);
        res.status(500).json({
            success: false,
            message: error.message || '画像のアップロードに失敗しました'
        });
    }
};
