import mongoose from 'mongoose';

/**
 * MongoDB接続設定
 */

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) {
        console.log('✅ MongoDB既に接続済み');
        return;
    }

    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error('MONGODB_URI が .env ファイルに設定されていません');
        }

        const options = {
            // 推奨オプション
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        await mongoose.connect(mongoURI, options);

        isConnected = true;

        console.log('✅ MongoDB Atlas接続成功');
        console.log(`📊 データベース: ${mongoose.connection.db.databaseName}`);

    } catch (error) {
        console.error('❌ MongoDB接続エラー:', error.message);
        process.exit(1);
    }
};

// 接続イベントハンドラー
mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose接続確立');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose接続エラー:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ Mongoose接続切断');
    isConnected = false;
});

// グレースフルシャットダウン
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('👋 MongoDBとの接続を正常に切断しました');
    process.exit(0);
});

export default connectDB;
