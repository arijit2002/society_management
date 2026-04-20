const { ipcMain } = require('electron');
const { getDB } = require('../database/db');

function registerStatsHandlers() {
  ipcMain.handle('stats:dashboard', () => {
    const db = getDB();
    const now = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();

    const totalResidents  = db.prepare("SELECT COUNT(*) as c FROM users WHERE role='resident' AND is_active=1").get().c;
    const totalStaff      = db.prepare("SELECT COUNT(*) as c FROM users WHERE role IN ('security','maintenance') AND is_active=1").get().c;
    const openComplaints  = db.prepare("SELECT COUNT(*) as c FROM complaints WHERE status IN ('open','in_progress')").get().c;
    const pendingFees     = db.prepare("SELECT COUNT(*) as c FROM maintenance_fees WHERE status IN ('pending','overdue')").get().c;
    const collectedThisMonth = db.prepare("SELECT COALESCE(SUM(amount),0) as s FROM maintenance_fees WHERE status='paid' AND month=? AND year=?").get(month, year).s;
    const pendingTasksCount  = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE status IN ('pending','in_progress')").get().c;
    const visitorsToday   = db.prepare("SELECT COUNT(*) as c FROM visitors WHERE DATE(entry_time)=DATE('now')").get().c;
    const totalFlats      = db.prepare("SELECT COUNT(*) as c FROM flats").get().c;
    const occupiedFlats   = db.prepare("SELECT COUNT(*) as c FROM flats WHERE user_id IS NOT NULL").get().c;

    const monthlyCollection = db.prepare(`
      SELECT month, year, SUM(amount) as collected, COUNT(*) as count
      FROM maintenance_fees WHERE status='paid' AND year=?
      GROUP BY month ORDER BY month`).all(year);

    const complaintsByCategory = db.prepare(`
      SELECT category, COUNT(*) as count FROM complaints GROUP BY category ORDER BY count DESC`).all();

    const recentComplaints = db.prepare(`
      SELECT c.*, u.name as resident_name, u.flat_no FROM complaints c
      LEFT JOIN users u ON u.id = c.resident_id
      ORDER BY c.created_at DESC LIMIT 5`).all();

    const recentNotices = db.prepare(`
      SELECT * FROM notices ORDER BY created_at DESC LIMIT 3`).all();

    return {
      totalResidents, totalStaff, openComplaints, pendingFees,
      collectedThisMonth, pendingTasksCount, visitorsToday,
      totalFlats, occupiedFlats,
      monthlyCollection, complaintsByCategory,
      recentComplaints, recentNotices,
    };
  });

  ipcMain.handle('stats:residentDashboard', (_, residentId) => {
    const db = getDB();
    const now = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();

    const currentFee = db.prepare(`SELECT * FROM maintenance_fees WHERE resident_id=? AND month=? AND year=?`)
      .get(residentId, month, year);
    const myComplaints = db.prepare(`SELECT * FROM complaints WHERE resident_id=? ORDER BY created_at DESC LIMIT 5`)
      .all(residentId);
    const notices = db.prepare('SELECT * FROM notices ORDER BY created_at DESC LIMIT 5').all();
    const totalDue = db.prepare(`SELECT COALESCE(SUM(amount),0) as s FROM maintenance_fees WHERE resident_id=? AND status IN ('pending','overdue')`)
      .get(residentId).s;
    return { currentFee, myComplaints, notices, totalDue };
  });

  ipcMain.handle('stats:reports', (_, { year }) => {
    const db = getDB();
    const collection = db.prepare(`
      SELECT month, SUM(amount) as collected, COUNT(*) as paid_count
      FROM maintenance_fees WHERE status='paid' AND year=?
      GROUP BY month ORDER BY month`).all(year);
    const pending = db.prepare(`
      SELECT month, SUM(amount) as pending_amount, COUNT(*) as pending_count
      FROM maintenance_fees WHERE status IN ('pending','overdue') AND year=?
      GROUP BY month ORDER BY month`).all(year);
    const complaints = db.prepare(`
      SELECT strftime('%m',created_at) as month, status, COUNT(*) as count
      FROM complaints WHERE strftime('%Y',created_at)=?
      GROUP BY month, status`).all(String(year));
    return { collection, pending, complaints };
  });
}

module.exports = { registerStatsHandlers };
