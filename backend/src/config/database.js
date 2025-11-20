// In-memory database for demo purposes
// Replace this with real database (MySQL, PostgreSQL, MongoDB) in production

class InMemoryDB {
  constructor() {
    // Store users with hashed passwords
    this.users = [];
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
      id: Date.now().toString(),
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

// Add a demo user for testing
// Password: "password123" (will be hashed in the controller)
// This is just for demonstration - remove in production
export const initDemoData = async () => {
  const bcrypt = await import('bcrypt');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  db.createUser({
    email: 'demo@example.com',
    password: hashedPassword,
    name: 'Demo User'
  });
  
  console.log('Demo user created: demo@example.com / password123');
};

export default db;
