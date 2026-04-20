const { ipcMain } = require('electron');
const bcrypt = require('bcryptjs');
const { getDB } = require('../database/db');

function registerResidentHandlers() {
  ipcMain.handle('residents:getAll', () => {
    const db = getDB();
    return db.prepare(`
      SELECT u.*, f.id as flat_id, f.floor, f.area_sqft, f.ownership_type
      FROM users u
      LEFT JOIN flats f ON f.user_id = u.id
      WHERE u.role = 'resident'
      ORDER BY u.block, u.flat_no
    `).all();
  });

  ipcMain.handle('residents:getById', (_, id) => {
    const db = getDB();
    const user = db.prepare(`
      SELECT u.*, f.id as flat_id, f.floor, f.area_sqft, f.ownership_type
      FROM users u LEFT JOIN flats f ON f.user_id = u.id
      WHERE u.id = ?`).get(id);
    return user;
  });

  ipcMain.handle('residents:add', (_, data) => {
    const db = getDB();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email);
    if (existing) return { success: false, message: 'Email already registered' };
    const password = bcrypt.hashSync(data.password || 'resident123', 10);
    const user = db.prepare(`INSERT INTO users (name, email, phone, password, role, flat_no, block)
      VALUES (?,?,?,?,?,?,?)`).run(data.name, data.email, data.phone, password, 'resident', data.flat_no, data.block);
    if (data.flat_no) {
      const flatExists = db.prepare('SELECT id FROM flats WHERE flat_no = ? AND block = ?').get(data.flat_no, data.block);
      if (flatExists) {
        db.prepare('UPDATE flats SET user_id = ?, ownership_type = ? WHERE id = ?')
          .run(user.lastInsertRowid, data.ownership_type || 'owner', flatExists.id);
      } else {
        db.prepare(`INSERT INTO flats (flat_no, block, floor, area_sqft, ownership_type, user_id)
          VALUES (?,?,?,?,?,?)`).run(data.flat_no, data.block, data.floor || 1, data.area_sqft || 0, data.ownership_type || 'owner', user.lastInsertRowid);
      }
    }
    return { success: true, id: user.lastInsertRowid };
  });

  ipcMain.handle('residents:update', (_, { id, data }) => {
    const db = getDB();
    db.prepare(`UPDATE users SET name=?, email=?, phone=?, flat_no=?, block=?, is_active=? WHERE id=?`)
      .run(data.name, data.email, data.phone, data.flat_no, data.block, data.is_active ?? 1, id);
    if (data.flat_no) {
      const flat = db.prepare('SELECT id FROM flats WHERE flat_no = ? AND block = ?').get(data.flat_no, data.block);
      if (flat) {
        db.prepare('UPDATE flats SET user_id=?, ownership_type=?, floor=?, area_sqft=? WHERE id=?')
          .run(id, data.ownership_type || 'owner', data.floor || 1, data.area_sqft || 0, flat.id);
      }
    }
    return { success: true };
  });

  ipcMain.handle('residents:delete', (_, id) => {
    const db = getDB();
    db.prepare('UPDATE flats SET user_id = NULL WHERE user_id = ?').run(id);
    db.prepare('UPDATE users SET is_active = 0 WHERE id = ?').run(id);
    return { success: true };
  });

  ipcMain.handle('flats:getAll', () => {
    const db = getDB();
    return db.prepare(`
      SELECT f.*, u.name as resident_name, u.phone as resident_phone
      FROM flats f LEFT JOIN users u ON u.id = f.user_id
      ORDER BY f.block, f.flat_no
    `).all();
  });

  ipcMain.handle('flats:getVacant', () => {
    const db = getDB();
    return db.prepare('SELECT * FROM flats WHERE user_id IS NULL ORDER BY block, flat_no').all();
  });
}

module.exports = { registerResidentHandlers };
