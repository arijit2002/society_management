const { ipcMain } = require('electron');
const bcrypt = require('bcryptjs');
const { getDB } = require('../database/db');

function registerAuthHandlers() {
  ipcMain.handle('auth:login', (_, { email, password }) => {
    const db = getDB();
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').get(email);
    if (!user) return { success: false, message: 'Invalid email or password' };
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return { success: false, message: 'Invalid email or password' };
    const { password: _pw, ...safeUser } = user;
    return { success: true, user: safeUser };
  });

  ipcMain.handle('auth:getSocietyInfo', () => {
    const db = getDB();
    return db.prepare('SELECT * FROM society_info LIMIT 1').get();
  });

  ipcMain.handle('auth:updateSocietyInfo', (_, data) => {
    const db = getDB();
    const existing = db.prepare('SELECT id FROM society_info LIMIT 1').get();
    if (existing) {
      db.prepare(`UPDATE society_info SET name=?, address=?, city=?, state=?, pincode=?,
        total_flats=?, maintenance_amount=?, email=?, phone=? WHERE id=?`
      ).run(data.name, data.address, data.city, data.state, data.pincode,
        data.total_flats, data.maintenance_amount, data.email, data.phone, existing.id);
    }
    return { success: true };
  });

  ipcMain.handle('auth:changePassword', (_, { userId, currentPassword, newPassword }) => {
    const db = getDB();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) return { success: false, message: 'User not found' };
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return { success: false, message: 'Current password is incorrect' };
    }
    const hashed = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, userId);
    return { success: true };
  });
}

module.exports = { registerAuthHandlers };
