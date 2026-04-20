const { ipcMain } = require('electron');
const { getDB } = require('../database/db');

function registerVisitorHandlers() {
  ipcMain.handle('visitors:getAll', (_, filters = {}) => {
    const db = getDB();
    let query = `
      SELECT v.*,
        u.name as host_name, u.flat_no as host_flat_no,
        g.name as guard_name
      FROM visitors v
      LEFT JOIN users u ON u.id = v.host_resident_id
      LEFT JOIN users g ON g.id = v.guard_id
      WHERE 1=1
    `;
    const params = [];
    if (filters.status)  { query += ' AND v.status = ?'; params.push(filters.status); }
    if (filters.date)    { query += ' AND DATE(v.entry_time) = ?'; params.push(filters.date); }
    if (filters.guard_id){ query += ' AND v.guard_id = ?'; params.push(filters.guard_id); }
    query += ' ORDER BY v.entry_time DESC';
    if (filters.limit) { query += ' LIMIT ?'; params.push(filters.limit); }
    return db.prepare(query).all(...params);
  });

  ipcMain.handle('visitors:add', (_, data) => {
    const result = getDB().prepare(`
      INSERT INTO visitors (visitor_name, visitor_phone, purpose, vehicle_no, host_flat, host_resident_id, guard_id, notes)
      VALUES (?,?,?,?,?,?,?,?)`
    ).run(data.visitor_name, data.visitor_phone, data.purpose, data.vehicle_no || null,
      data.host_flat, data.host_resident_id || null, data.guard_id, data.notes || null);
    return { success: true, id: result.lastInsertRowid };
  });

  ipcMain.handle('visitors:checkout', (_, id) => {
    getDB().prepare(`UPDATE visitors SET exit_time=DATETIME('now'), status='exited' WHERE id=?`).run(id);
    return { success: true };
  });

  ipcMain.handle('visitors:getTodayCount', (_, guardId) => {
    const db = getDB();
    const total   = db.prepare(`SELECT COUNT(*) as count FROM visitors WHERE DATE(entry_time)=DATE('now') AND guard_id=?`).get(guardId);
    const inside  = db.prepare(`SELECT COUNT(*) as count FROM visitors WHERE status='inside' AND guard_id=?`).get(guardId);
    const exited  = db.prepare(`SELECT COUNT(*) as count FROM visitors WHERE status='exited' AND DATE(entry_time)=DATE('now') AND guard_id=?`).get(guardId);
    return { total: total.count, inside: inside.count, exited: exited.count };
  });
}

module.exports = { registerVisitorHandlers };
