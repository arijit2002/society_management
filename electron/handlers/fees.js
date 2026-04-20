const { ipcMain } = require('electron');
const { getDB } = require('../database/db');

function registerFeeHandlers() {
  ipcMain.handle('fees:getAll', (_, filters = {}) => {
    const db = getDB();
    let query = `
      SELECT mf.*, u.name as resident_name, u.flat_no, u.block
      FROM maintenance_fees mf
      LEFT JOIN users u ON u.id = mf.resident_id
      WHERE 1=1
    `;
    const params = [];
    if (filters.month) { query += ' AND mf.month = ?'; params.push(filters.month); }
    if (filters.year)  { query += ' AND mf.year = ?';  params.push(filters.year); }
    if (filters.status){ query += ' AND mf.status = ?'; params.push(filters.status); }
    if (filters.resident_id){ query += ' AND mf.resident_id = ?'; params.push(filters.resident_id); }
    query += ' ORDER BY mf.year DESC, mf.month DESC, u.block, u.flat_no';
    return db.prepare(query).all(...params);
  });

  ipcMain.handle('fees:add', (_, data) => {
    const db = getDB();
    const exists = db.prepare(
      'SELECT id FROM maintenance_fees WHERE resident_id=? AND month=? AND year=?'
    ).get(data.resident_id, data.month, data.year);
    if (exists) return { success: false, message: 'Fee record already exists for this month' };
    const result = db.prepare(`
      INSERT INTO maintenance_fees (flat_id, resident_id, amount, month, year, due_date, status, notes)
      VALUES (?,?,?,?,?,?,?,?)`
    ).run(data.flat_id, data.resident_id, data.amount, data.month, data.year, data.due_date, 'pending', data.notes);
    return { success: true, id: result.lastInsertRowid };
  });

  ipcMain.handle('fees:bulkGenerate', (_, { month, year, amount }) => {
    const db = getDB();
    const residents = db.prepare(`
      SELECT u.id as resident_id, f.id as flat_id
      FROM users u LEFT JOIN flats f ON f.user_id = u.id
      WHERE u.role = 'resident' AND u.is_active = 1`).all();
    const dueDate = `${year}-${String(month).padStart(2,'0')}-05`;
    const insert = db.prepare(`
      INSERT OR IGNORE INTO maintenance_fees (flat_id, resident_id, amount, month, year, due_date, status)
      VALUES (?,?,?,?,?,?,'pending')`);
    let created = 0;
    const insertMany = db.transaction(() => {
      residents.forEach(r => {
        const exists = db.prepare('SELECT id FROM maintenance_fees WHERE resident_id=? AND month=? AND year=?')
          .get(r.resident_id, month, year);
        if (!exists) {
          insert.run(r.flat_id, r.resident_id, amount, month, year, dueDate);
          created++;
        }
      });
    });
    insertMany();
    return { success: true, created };
  });

  ipcMain.handle('fees:markPaid', (_, { id, payment_method, notes }) => {
    const db = getDB();
    const receiptNo = 'RCP' + Date.now();
    db.prepare(`UPDATE maintenance_fees SET status='paid', paid_date=DATE('now'),
      payment_method=?, receipt_no=?, notes=? WHERE id=?`)
      .run(payment_method || 'cash', receiptNo, notes, id);
    return { success: true, receipt_no: receiptNo };
  });

  ipcMain.handle('fees:markOverdue', () => {
    const db = getDB();
    db.prepare(`UPDATE maintenance_fees SET status='overdue'
      WHERE status='pending' AND due_date < DATE('now')`).run();
    return { success: true };
  });

  ipcMain.handle('fees:waive', (_, { id, notes }) => {
    const db = getDB();
    db.prepare(`UPDATE maintenance_fees SET status='waived', notes=? WHERE id=?`).run(notes, id);
    return { success: true };
  });

  ipcMain.handle('fees:delete', (_, id) => {
    const db = getDB();
    db.prepare('DELETE FROM maintenance_fees WHERE id = ?').run(id);
    return { success: true };
  });
}

module.exports = { registerFeeHandlers };
