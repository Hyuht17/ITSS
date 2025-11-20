import bcrypt from 'bcrypt';
import db from '../config/database.js';

class User {
  static async create(userData) {
    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user = db.createUser({
      email: userData.email,
      password: hashedPassword,
      name: userData.name || ''
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static findByEmail(email) {
    return db.findUserByEmail(email);
  }

  static findById(id) {
    const user = db.findUserById(id);
    if (!user) return null;
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async comparePassword(plainPassword, hashedPassword) {
    // Use timing-safe comparison
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updatePassword(userId, newPassword) {
    const user = db.findUserById(userId);
    if (!user) return null;

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    return true;
  }
}

export default User;
