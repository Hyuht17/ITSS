import User from '../models/User.model.js';
import Teacher from '../models/Teacher.model.js';

/**
 * デモデータを作成
 * 初回起動時またはデータベースが空の場合に実行
 */
export const seedDatabase = async () => {
    try {
        // 既存のユーザー数を確認
        const userCount = await User.countDocuments();

        if (userCount === 0) {
            console.log('🌱 デモデータを作成しています...');

            // デモユーザー1: 山田太郎（日本語教師）
            const user1 = await User.create({
                email: 'demo@example.com',
                password: 'password123',
                name: '山田太郎',
                role: 'teacher'
            });

            await Teacher.create({
                userId: user1._id,
                name: '山田太郎',
                jobTitle: '日本語教師',
                gender: '男性',
                location: '東京都',
                workplace: 'ABC日本語学校',
                yearsOfExperience: 5,
                nationality: '日本',
                profilePhoto: '',
                specialties: ['初級日本語', 'ビジネス日本語', 'JLPT対策'],
                teachingStyle: '学生中心のインタラクティブな授業を心がけています。実践的な会話練習を重視し、楽しく学べる環境を提供します。',
                shareThemes: ['日本文化', '日本のビジネスマナー', '敬語の使い方'],
                learnThemes: ['オンライン教育の最新技術', '異文化コミュニケーション'],
                certifications: ['日本語教育能力検定試験合格', 'TOEIC 900点'],
                hobbies: ['読書', '旅行', '料理'],
                socialLinks: {
                    twitter: 'https://twitter.com/yamada_sensei',
                    facebook: 'https://facebook.com/yamada.taro',
                    linkedin: 'https://linkedin.com/in/yamada-taro'
                }
            });

            // デモユーザー2: 佐藤花子（英語教師）
            const user2 = await User.create({
                email: 'sato@example.com',
                password: 'password123',
                name: '佐藤花子',
                role: 'teacher'
            });

            await Teacher.create({
                userId: user2._id,
                name: '佐藤花子',
                jobTitle: '英語教師',
                gender: '女性',
                location: '大阪府',
                workplace: 'XYZ英会話スクール',
                yearsOfExperience: 8,
                nationality: '日本',
                profilePhoto: '',
                specialties: ['英会話', 'TOEIC', 'ビジネス英語'],
                teachingStyle: '実践的なコミュニケーション能力の向上を目指し、リアルなシチュエーションでの練習を重視しています。',
                shareThemes: ['効果的な英語学習法', '海外生活の経験', 'プレゼンテーション技術'],
                learnThemes: ['最新の言語教育理論', 'デジタルツールの活用法'],
                certifications: ['英検1級', 'TESOL認定', 'TOEIC 990点'],
                hobbies: ['映画鑑賞', 'ヨガ', 'カフェ巡り'],
                socialLinks: {
                    twitter: 'https://twitter.com/sato_hanako',
                    facebook: '',
                    linkedin: 'https://linkedin.com/in/sato-hanako'
                }
            });

            console.log('✅ デモデータ作成完了:');
            console.log('   - ユーザー1: demo@example.com / password123 (山田太郎 - 日本語教師)');
            console.log('   - ユーザー2: sato@example.com / password123 (佐藤花子 - 英語教師)');
            console.log('   - 教師プロフィール: 2件作成');
        } else {
            console.log('📊 既存ユーザーが見つかりました');

            // Check and create missing teacher profiles
            const users = await User.find();
            let createdCount = 0;

            for (const user of users) {
                const existingTeacher = await Teacher.findOne({ userId: user._id });
                if (!existingTeacher) {
                    await Teacher.create({
                        userId: user._id,
                        name: user.name,
                        jobTitle: user.email.includes('demo') ? '日本語教師' : '英語教師',
                        gender: '男性',
                        location: '東京都',
                        workplace: 'ABC学校',
                        yearsOfExperience: 5,
                        nationality: '日本',
                        profilePhoto: '',
                        specialties: ['初級', '中級'],
                        teachingStyle: '楽しく学べる環境を提供します',
                        shareThemes: [],
                        learnThemes: [],
                        certifications: [],
                        hobbies: [],
                        socialLinks: { twitter: '', facebook: '', linkedin: '' }
                    });
                    createdCount++;
                    console.log(`  ✅ Teacher profile created for: ${user.email}`);
                }
            }

            if (createdCount > 0) {
                console.log(`  ✅ ${createdCount}件の教師プロフィールを作成しました`);
            } else {
                console.log('  ℹ️  全てのユーザーが既に教師プロフィールを持っています');
            }
        }

    } catch (error) {
        console.error('❌ デモデータ作成エラー:', error);
        throw error;
    }
};

export default seedDatabase;
