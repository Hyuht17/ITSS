import multer from 'multer';



// メモリストレージ設定
const storage = multer.memoryStorage();

// ファイルフィルター（画像のみ許可）
const fileFilter = (req, file, cb) => {
    // 許可される画像タイプ
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
    }
};

// Multer設定
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    }
});

// エラーハンドリングミドルウェア
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'ファイルサイズが大きすぎます。5MB以下のファイルをアップロードしてください。',
                status: 'error'
            });
        }
        return res.status(400).json({
            message: `ファイルアップロードエラー: ${err.message}`,
            status: 'error'
        });
    }

    if (err) {
        return res.status(400).json({
            message: err.message || 'ファイルアップロードに失敗しました',
            status: 'error'
        });
    }

    next();
};

export default upload;
