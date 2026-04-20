const { ipcMain } = require('electron');
const { getDB } = require('../database/db');

function registerNoticeHandlers() {
  ipcMain.handle('notices:getAll', () => {
    return getDB().prepare(`
      SELECT n.*, u.name as author_name
      FROM notices n LEFT JOIN users u ON u.id = n.created_by
      ORDER BY CASE n.priority WHEN 'urgent' THEN 1 WHEN 'important' THEN 2 ELSE 3 END, n.created_at DESC
    `).all();
  });

  ipcMain.handle('notices:add', (_, data) => {
    const result = getDB().prepare(`
      INSERT INTO notices (title, content, category, priority, target_audience, created_by, expires_at)
      VALUES (?,?,?,?,?,?,?)`
    ).run(data.title, data.content, data.category || 'general', data.priority || 'normal',
      data.target_audience || 'all', data.created_by, data.expires_at || null);
    return { success: true, id: result.lastInsertRowid };
  });

  ipcMain.handle('notices:update', (_, { id, data }) => {
    getDB().prepare(`UPDATE notices SET title=?, content=?, category=?, priority=?, expires_at=? WHERE id=?`)
      .run(data.title, data.content, data.category, data.priority, data.expires_at || null, id);
    return { success: true };
  });

  ipcMain.handle('notices:delete', (_, id) => {
    getDB().prepare('DELETE FROM notices WHERE id = ?').run(id);
    return { success: true };
  });
}

module.exports = { registerNoticeHandlers };
