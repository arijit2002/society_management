const { ipcMain } = require('electron');
const { getDB } = require('../database/db');

function registerComplaintHandlers() {
  ipcMain.handle('complaints:getAll', (_, filters = {}) => {
    const db = getDB();
    let query = `
      SELECT c.*,
        u.name as resident_name, u.flat_no, u.block,
        a.name as assigned_name
      FROM complaints c
      LEFT JOIN users u ON u.id = c.resident_id
      LEFT JOIN users a ON a.id = c.assigned_to
      WHERE 1=1
    `;
    const params = [];
    if (filters.resident_id) { query += ' AND c.resident_id = ?'; params.push(filters.resident_id); }
    if (filters.status)      { query += ' AND c.status = ?';      params.push(filters.status); }
    if (filters.category)    { query += ' AND c.category = ?';    params.push(filters.category); }
    query += " ORDER BY CASE c.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END, c.created_at DESC";
    return db.prepare(query).all(...params);
  });

  ipcMain.handle('complaints:add', (_, data) => {
    const result = getDB().prepare(`
      INSERT INTO complaints (resident_id, title, description, category, priority)
      VALUES (?,?,?,?,?)`
    ).run(data.resident_id, data.title, data.description, data.category, data.priority || 'medium');
    return { success: true, id: result.lastInsertRowid };
  });

  ipcMain.handle('complaints:update', (_, { id, data }) => {
    const db = getDB();
    if (data.status === 'resolved') {
      db.prepare(`UPDATE complaints SET status=?, priority=?, assigned_to=?, resolution_notes=?,
        updated_at=DATETIME('now'), resolved_at=DATETIME('now') WHERE id=?`)
        .run(data.status, data.priority, data.assigned_to || null, data.resolution_notes || null, id);
    } else {
      db.prepare(`UPDATE complaints SET status=?, priority=?, assigned_to=?, resolution_notes=?,
        updated_at=DATETIME('now') WHERE id=?`)
        .run(data.status, data.priority, data.assigned_to || null, data.resolution_notes || null, id);
    }
    return { success: true };
  });

  ipcMain.handle('complaints:delete', (_, id) => {
    getDB().prepare('DELETE FROM complaints WHERE id = ?').run(id);
    return { success: true };
  });
}

module.exports = { registerComplaintHandlers };
