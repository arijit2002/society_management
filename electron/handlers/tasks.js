const { ipcMain } = require('electron');
const { getDB } = require('../database/db');

function registerTaskHandlers() {
  ipcMain.handle('tasks:getAll', (_, filters = {}) => {
    const db = getDB();
    let query = `
      SELECT t.*,
        a.name as assigned_name,
        c.name as created_by_name
      FROM tasks t
      LEFT JOIN users a ON a.id = t.assigned_to
      LEFT JOIN users c ON c.id = t.created_by
      WHERE 1=1
    `;
    const params = [];
    if (filters.assigned_to) { query += ' AND t.assigned_to = ?'; params.push(filters.assigned_to); }
    if (filters.status)      { query += ' AND t.status = ?';      params.push(filters.status); }
    if (filters.category)    { query += ' AND t.category = ?';    params.push(filters.category); }
    query += " ORDER BY CASE t.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END, t.created_at DESC";
    return db.prepare(query).all(...params);
  });

  ipcMain.handle('tasks:add', (_, data) => {
    const result = getDB().prepare(`
      INSERT INTO tasks (title, description, category, location, priority, assigned_to, created_by, complaint_id, due_date)
      VALUES (?,?,?,?,?,?,?,?,?)`
    ).run(data.title, data.description, data.category || 'general', data.location,
      data.priority || 'medium', data.assigned_to || null, data.created_by,
      data.complaint_id || null, data.due_date || null);
    return { success: true, id: result.lastInsertRowid };
  });

  ipcMain.handle('tasks:update', (_, { id, data }) => {
    const db = getDB();
    if (data.status === 'completed') {
      db.prepare(`UPDATE tasks SET title=?, description=?, category=?, location=?, priority=?,
        status=?, assigned_to=?, due_date=?, completion_notes=?,
        updated_at=DATETIME('now'), completed_at=DATETIME('now') WHERE id=?`)
        .run(data.title, data.description, data.category, data.location, data.priority,
          data.status, data.assigned_to || null, data.due_date || null,
          data.completion_notes || null, id);
    } else {
      db.prepare(`UPDATE tasks SET title=?, description=?, category=?, location=?, priority=?,
        status=?, assigned_to=?, due_date=?, completion_notes=?,
        updated_at=DATETIME('now') WHERE id=?`)
        .run(data.title, data.description, data.category, data.location, data.priority,
          data.status, data.assigned_to || null, data.due_date || null,
          data.completion_notes || null, id);
    }
    return { success: true };
  });

  ipcMain.handle('tasks:updateStatus', (_, { id, status, completion_notes }) => {
    const db = getDB();
    if (status === 'completed') {
      db.prepare(`UPDATE tasks SET status=?, completion_notes=?, updated_at=DATETIME('now'), completed_at=DATETIME('now') WHERE id=?`)
        .run(status, completion_notes || null, id);
    } else {
      db.prepare(`UPDATE tasks SET status=?, updated_at=DATETIME('now') WHERE id=?`).run(status, id);
    }
    return { success: true };
  });

  ipcMain.handle('tasks:delete', (_, id) => {
    getDB().prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return { success: true };
  });

  ipcMain.handle('tasks:getStaffList', () => {
    return getDB().prepare(`
      SELECT u.id, u.name, u.role, sd.designation, sd.department
      FROM users u LEFT JOIN staff_details sd ON sd.user_id = u.id
      WHERE u.role IN ('maintenance', 'security') AND u.is_active = 1
      ORDER BY u.role, u.name`).all();
  });
}

module.exports = { registerTaskHandlers };
