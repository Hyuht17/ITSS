// In-memory database for demo purposes
// Replace this with real database (MySQL, PostgreSQL, MongoDB) in production

class InMemoryDB {
  constructor() {
    // Store users with hashed passwords
    this.users = [];
    // Store teachers
    this.teachers = [];
    // Store refresh tokens
    this.refreshTokens = new Map();
    // Store login attempts for rate limiting
    this.loginAttempts = new Map();
    // Store account locks
    this.accountLocks = new Map();
  }

  // User operations
  findUserByEmail(email) {
    return this.users.find(user => user.email === email);
  }

  findUserById(id) {
    return this.users.find(user => user.id === id);
  }

  createUser(userData) {
    const user = {
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      ...userData,
      createdAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  // Refresh token operations
  saveRefreshToken(userId, token) {
    if (!this.refreshTokens.has(userId)) {
      this.refreshTokens.set(userId, []);
    }
    this.refreshTokens.get(userId).push(token);
  }

  findRefreshToken(userId, token) {
    const tokens = this.refreshTokens.get(userId);
    return tokens ? tokens.includes(token) : false;
  }

  removeRefreshToken(userId, token) {
    const tokens = this.refreshTokens.get(userId);
    if (tokens) {
      const index = tokens.indexOf(token);
      if (index > -1) {
        tokens.splice(index, 1);
      }
    }
  }

  removeAllRefreshTokens(userId) {
    this.refreshTokens.delete(userId);
  }

  // Login attempts tracking
  getLoginAttempts(identifier) {
    const attempts = this.loginAttempts.get(identifier);
    if (!attempts) return 0;

    // Clean up old attempts (older than 15 minutes)
    const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
    const recentAttempts = attempts.filter(time => time > fifteenMinutesAgo);
    this.loginAttempts.set(identifier, recentAttempts);

    return recentAttempts.length;
  }

  recordLoginAttempt(identifier) {
    if (!this.loginAttempts.has(identifier)) {
      this.loginAttempts.set(identifier, []);
    }
    this.loginAttempts.get(identifier).push(Date.now());
  }

  resetLoginAttempts(identifier) {
    this.loginAttempts.delete(identifier);
  }

  // Teacher operations
  findTeacherById(id) {
    return this.teachers.find(teacher => teacher.id === id);
  }

  getAllTeachers() {
    return this.teachers;
  }

  createTeacher(teacherData) {
    const teacher = {
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      ...teacherData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.teachers.push(teacher);
    return teacher;
  }

  updateTeacher(id, teacherData) {
    const index = this.teachers.findIndex(teacher => teacher.id === id);
    if (index === -1) return null;

    this.teachers[index] = {
      ...this.teachers[index],
      ...teacherData,
      updatedAt: new Date()
    };
    return this.teachers[index];
  }

  // Account lock operations
  lockAccount(identifier, minutes = 15) {
    const unlockTime = Date.now() + minutes * 60 * 1000;
    this.accountLocks.set(identifier, unlockTime);
  }

  isAccountLocked(identifier) {
    const unlockTime = this.accountLocks.get(identifier);
    if (!unlockTime) return false;

    if (Date.now() < unlockTime) {
      return true;
    }

    // Lock expired, remove it
    this.accountLocks.delete(identifier);
    return false;
  }

  getAccountLockTime(identifier) {
    return this.accountLocks.get(identifier);
  }
}

// Create singleton instance
const db = new InMemoryDB();

// デモデータの初期化
// 本番環境では削除してください
// 注意: このシステムでは User = Teacher （すべてのユーザーは教師です）
export const initDemoData = async () => {
  const bcrypt = await import('bcrypt');
  const hashedPassword = await bcrypt.hash('password123', 10);

  // デモユーザー1: 山田太郎（日本語教師）
  const demoUser1 = db.createUser({
    email: 'demo@example.com',
    password: hashedPassword,
    name: '山田太郎'
  });

  // 山田太郎の教師プロフィール
  db.createTeacher({
    userId: demoUser1.id,
    name: '山田太郎',
    jobTitle: '日本語教師',
    gender: '男性',
    location: '東京都',
    workplace: 'ABC日本語学校',
    yearsOfExperience: 5,
    nationality: '日本',
    profilePhoto: '', // プレースホルダー画像を使用
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
  const demoUser2 = db.createUser({
    email: 'sato@example.com',
    password: hashedPassword,
    name: '佐藤花子'
  });

  // 佐藤花子の教師プロフィール
  db.createTeacher({
    userId: demoUser2.id,
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

  console.log('デモデータ作成完了:');
  console.log('- ユーザー1: demo@example.com / password123 (山田太郎 - 日本語教師)');
  console.log('- ユーザー2: sato@example.com / password123 (佐藤花子 - 英語教師)');
  console.log('- 教師プロフィール: 2件作成（各ユーザーに対応）');
};

export default db;
