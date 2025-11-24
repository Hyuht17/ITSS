import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 設定の検証
const validateCloudinaryConfig = () => {
    const { cloud_name, api_key, api_secret } = cloudinary.config();

    if (!cloud_name || !api_key || !api_secret) {
        console.warn('⚠️  Cloudinary configuration is incomplete. Please check your .env file.');
        return false;
    }

    console.log('✅ Cloudinary configuration loaded successfully');
    return true;
};

// サーバー起動時に設定を検証
validateCloudinaryConfig();

export default cloudinary;
