import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.model.js';
import Teacher from '../models/Teacher.model.js';
import AvailabilityDB from '../models/AvailabilityDB.model.js';
import dotenv from 'dotenv';

dotenv.config();

// Demo users data
const demoUsers = [
    { email: 'nguyen.a@example.com', name: 'Nguyen Van A', password: 'password123' },
    { email: 'tran.b@example.com', name: 'Tran Thi B', password: 'password123' },
    { email: 'le.c@example.com', name: 'Le Van C', password: 'password123' },
    { email: 'pham.d@example.com', name: 'Pham Thi D', password: 'password123' },
    { email: 'hoang.e@example.com', name: 'Hoang Van E', password: 'password123' },
    { email: 'vo.f@example.com', name: 'Vo Thi F', password: 'password123' },
    { email: 'dinh.g@example.com', name: 'Dinh Van G', password: 'password123' },
    { email: 'bui.h@example.com', name: 'Bui Thi H', password: 'password123' }
];

// Teacher profiles data
const teacherProfiles = [
    { workplace: 'ハノイ工科大学', jobTitle: '数学教師', yearsOfExperience: 5, location: 'ハノイ', specialties: ['解析学', '幾何学', '代数学'] },
    { workplace: 'ホーチミン市師範大学', jobTitle: '物理教師', yearsOfExperience: 3, location: 'ホーチミン市', specialties: ['力学', '電磁気学'] },
    { workplace: 'ダナン外国語大学', jobTitle: '英語教師', yearsOfExperience: 7, location: 'ダナン', specialties: ['英会話', 'TOEIC', 'ビジネス英語'] },
    { workplace: 'ハイフォン医科大学', jobTitle: '化学教師', yearsOfExperience: 4, location: 'ハイフォン', specialties: ['有機化学', '無機化学'] },
    { workplace: 'カントー大学', jobTitle: '生物教師', yearsOfExperience: 6, location: 'カントー', specialties: ['分子生物学', '遺伝学'] },
    { workplace: 'ニャチャン大学', jobTitle: '歴史教師', yearsOfExperience: 2, location: 'ニャチャン', specialties: ['ベトナム史', '世界史'] },
    { workplace: 'ハノイ工科大学', jobTitle: 'コンピューター教師', yearsOfExperience: 8, location: 'ハノイ', specialties: ['プログラミング', 'AI', 'データサイエンス'] },
    { workplace: 'ホーチミン市経済大学', jobTitle: '経済教師', yearsOfExperience: 5, location: 'ホーチミン市', specialties: ['ミクロ経済学', 'マクロ経済学'] }
];

// Availability data (様々なパターン)
const availabilityPatterns = [
    { timeSlots: ['morning', 'afternoon'], locations: ['ハノイ'] },
    { timeSlots: ['afternoon', 'evening'], locations: ['ホーチミン市'] },
    { timeSlots: ['morning'], locations: ['ダナン'] },
    { timeSlots: ['afternoon'], locations: ['ハイフォン'] },
    { timeSlots: ['morning', 'evening'], locations: ['カントー'] },
    { timeSlots: ['afternoon'], locations: ['ニャチャン'] },
    { timeSlots: ['morning', 'afternoon'], locations: ['ハノイ'] },
    { timeSlots: ['evening'], locations: ['ホーチミン市'] }
];

const seedDemoData = async () => {
    try {
        console.log('🌱 Starting demo data seeding...');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🗑️  Clearing existing demo data...');
        await AvailabilityDB.deleteMany({});
        await Teacher.deleteMany({});
        await User.deleteMany({ email: { $in: demoUsers.map(u => u.email) } });

        // Create users
        console.log('👥 Creating demo users...');
        const createdUsers = [];
        for (const userData of demoUsers) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = await User.create({
                email: userData.email,
                name: userData.name,
                password: hashedPassword,
                role: 'teacher'
            });
            createdUsers.push(user);
            console.log(`  ✓ Created user: ${user.name} (${user.email})`);
        }

        // Create teacher profiles
        console.log('👨‍🏫 Creating teacher profiles...');
        const createdTeachers = [];
        for (let i = 0; i < createdUsers.length; i++) {
            const user = createdUsers[i];
            const profileData = teacherProfiles[i];

            const teacher = await Teacher.create({
                userId: user._id,
                name: user.name,
                ...profileData,
                profilePhoto: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
            });
            createdTeachers.push(teacher);
            console.log(`  ✓ Created teacher profile: ${teacher.name} at ${teacher.workplace}`);
        }

        // Create availability data for next 7 days
        console.log('📅 Creating availability data...');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < createdUsers.length; i++) {
            const user = createdUsers[i];
            const pattern = availabilityPatterns[i];

            // Create 3-5 availability entries for different dates
            const daysToCreate = 3 + Math.floor(Math.random() * 3); // 3-5 days

            for (let dayOffset = 0; dayOffset < daysToCreate; dayOffset++) {
                const date = new Date(today);
                date.setDate(date.getDate() + dayOffset);

                for (const location of pattern.locations) {
                    const availability = await AvailabilityDB.create({
                        teacherId: user._id,
                        date: date,
                        timeSlots: pattern.timeSlots,
                        location: location,
                        status: 'available'
                    });

                    console.log(`  ✓ ${user.name}: ${date.toISOString().split('T')[0]} - ${pattern.timeSlots.join(', ')} at ${location}`);
                }
            }
        }

        console.log('\n✅ Demo data seeding completed successfully!');
        console.log(`\n📊 Summary:`);
        console.log(`   - ${createdUsers.length} users created`);
        console.log(`   - ${createdTeachers.length} teacher profiles created`);
        console.log(`   - Availability data for next week created`);
        console.log('\n🔑 Login credentials:');
        console.log('   Email: nguyen.a@example.com');
        console.log('   Password: password123');
        console.log('\n   (Use any of the demo emails above with password: password123)');

    } catch (error) {
        console.error('❌ Error seeding demo data:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Database connection closed');
        process.exit(0);
    }
};

seedDemoData();
