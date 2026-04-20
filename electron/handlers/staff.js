const { ipcMain } = require('electron');
const bcrypt = require('bcryptjs');
const { getDB } = require('../database/db');

function registerStaffHandlers() {
  ipcMain.handle('staff:getAll', () => {
    return getDB().prepare(`
      SELECT u.*, sd.department, sd.designation, sd.shift, sd.join_date, sd.emergency_contact, sd.address
      FROM users u
      LEFT JOIN staff_details sd ON sd.user_id = u.id
      WHERE u.role IN ('security','maintenance') AND u.is_active = 1
      ORDER BY u.role, u.name`).all();
  });

  ipcMain.handle('staff:add', (_, data) => {
    const db = getDB();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email);
    if (existing) return { success: false, message: 'Email already registered' };
    const password = bcrypt.hashSync(data.password || (data.role === 'security' ? 'guard123' : 'staff123'), 10);
    const user = db.prepare(`INSERT INTO users (name, email, phone, password, role) VALUES (?,?,?,?,?)`)
      .run(data.name, data.email, data.phone, password, data.role);
    db.prepare(`INSERT INTO staff_details (user_id, department, designation, shift, join_date, emergency_contact, address)
      VALUES (?,?,?,?,?,?,?)`)
      .run(user.lastInsertRowid, data.department, data.designation, data.shift || 'morning',
        data.join_date || null, data.emergency_contact || null, data.address || null);
    return { success: true, id: user.lastInsertRowid };
  });

  ipcMain.handle('staff:update', (_, { id, data }) => {
    const db = getDB();
    db.prepare('UPDATE users SET name=?, email=?, phone=? WHERE id=?')
      .run(data.name, data.email, data.phone, id);
    const sd = db.prepare('SELECT id FROM staff_details WHERE user_id=?').get(id);
    if (sd) {
      db.prepare(`UPDATE staff_details SET department=?, designation=?, shift=?, join_date=?, emergency_contact=?, address=? WHERE user_id=?`)
        .run(data.department, data.designation, data.shift, data.join_date, data.emergency_contact, data.address, id);
    } else {
      db.prepare(`INSERT INTO staff_details (user_id, department, designation, shift, join_date) VALUES (?,?,?,?,?)`)
        .run(id, data.department, data.designation, data.shift, data.join_date);
    }
    return { success: true };
  });

  ipcMain.handle('staff:delete', (_, id) => {
    getDB().prepare('UPDATE users SET is_active = 0 WHERE id = ?').run(id);
    return { success: true };
  });
}

module.exports = { registerStaffHandlers };
