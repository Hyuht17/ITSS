import cloudinary from '../config/cloudinary.config.js';

/**
 * Cloudinaryにファイルをアップロードするユーティリティ
 */

/**
 * 画像をCloudinaryにアップロード
 * @param {Buffer|string} file - アップロードするファイル（BufferまたはBase64）
 * @param {string} folder - Cloudinaryのフォルダ名
 * @param {string} publicId - ファイルのpublic ID（オプション）
 * @returns {Promise<object>} アップロード結果
 */
export const uploadToCloudinary = async (file, folder = 'teacher-avatars', publicId = null) => {
    try {
        const options = {
            folder: folder,
            resource_type: 'auto',
            transformation: [
                { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
            ]
        };

        if (publicId) {
            options.public_id = publicId;
            options.overwrite = true;
        }

        // fileがBufferの場合
        if (Buffer.isBuffer(file)) {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    options,
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(file);
            });
        }

        // fileがBase64文字列の場合
        if (typeof file === 'string') {
            return await cloudinary.uploader.upload(file, options);
        }

        throw new Error('Invalid file format. Expected Buffer or Base64 string.');
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

/**
 * Cloudinaryから画像を削除
 * @param {string} publicId - 削除する画像のpublic ID
 * @returns {Promise<object>} 削除結果
 */
export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw error;
    }
};

/**
 * 画像URLからpublic IDを抽出
 * @param {string} imageUrl - Cloudinary画像URL
 * @returns {string|null} public ID
 */
export const extractPublicId = (imageUrl) => {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
        return null;
    }

    try {
        // URLから public_id を抽出
        // 例: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/filename.jpg
        const parts = imageUrl.split('/');
        const uploadIndex = parts.indexOf('upload');

        if (uploadIndex === -1) return null;

        // upload以降の部分を取得（versionを除く）
        const afterUpload = parts.slice(uploadIndex + 1);

        // vで始まる数字（version）をスキップ
        const withoutVersion = afterUpload[0].startsWith('v') && !isNaN(afterUpload[0].substring(1))
            ? afterUpload.slice(1)
            : afterUpload;

        // ファイル名から拡張子を除去
        const publicIdWithExt = withoutVersion.join('/');
        const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));

        return publicId;
    } catch (error) {
        console.error('Error extracting public ID:', error);
        return null;
    }
};
