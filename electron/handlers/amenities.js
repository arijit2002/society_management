const { ipcMain } = require('electron');
const { getDB } = require('../database/db');

function registerAmenityHandlers() {
  ipcMain.handle('amenities:getAll', () => {
    return getDB().prepare('SELECT * FROM amenities WHERE is_active = 1 ORDER BY name').all();
  });

  ipcMain.handle('amenities:getBookings', (_, filters = {}) => {
    const db = getDB();
    let query = `
      SELECT ab.*, a.name as amenity_name, u.name as resident_name, u.flat_no
      FROM amenity_bookings ab
      LEFT JOIN amenities a ON a.id = ab.amenity_id
      LEFT JOIN users u ON u.id = ab.resident_id
      WHERE 1=1
    `;
    const params = [];
    if (filters.resident_id)  { query += ' AND ab.resident_id = ?';   params.push(filters.resident_id); }
    if (filters.amenity_id)   { query += ' AND ab.amenity_id = ?';    params.push(filters.amenity_id); }
    if (filters.status)       { query += ' AND ab.status = ?';        params.push(filters.status); }
    if (filters.booking_date) { query += ' AND ab.booking_date = ?';  params.push(filters.booking_date); }
    query += ' ORDER BY ab.booking_date DESC, ab.start_time';
    return db.prepare(query).all(...params);
  });

  ipcMain.handle('amenities:addBooking', (_, data) => {
    const db = getDB();
    const conflict = db.prepare(`
      SELECT id FROM amenity_bookings
      WHERE amenity_id=? AND booking_date=? AND status NOT IN ('rejected','cancelled')
      AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?) OR (start_time >= ? AND end_time <= ?))`
    ).get(data.amenity_id, data.booking_date, data.end_time, data.start_time,
      data.end_time, data.start_time, data.start_time, data.end_time);
    if (conflict) return { success: false, message: 'Time slot is already booked' };
    const result = db.prepare(`
      INSERT INTO amenity_bookings (amenity_id, resident_id, booking_date, start_time, end_time, purpose, attendees)
      VALUES (?,?,?,?,?,?,?)`
    ).run(data.amenity_id, data.resident_id, data.booking_date, data.start_time, data.end_time,
      data.purpose, data.attendees || 1);
    return { success: true, id: result.lastInsertRowid };
  });

  ipcMain.handle('amenities:updateBooking', (_, { id, status, approved_by }) => {
    getDB().prepare('UPDATE amenity_bookings SET status=?, approved_by=? WHERE id=?')
      .run(status, approved_by || null, id);
    return { success: true };
  });

  ipcMain.handle('amenities:cancelBooking', (_, id) => {
    getDB().prepare("UPDATE amenity_bookings SET status='cancelled' WHERE id=?").run(id);
    return { success: true };
  });

  ipcMain.handle('amenities:add', (_, data) => {
    const result = getDB().prepare(`
      INSERT INTO amenities (name, description, capacity, location, open_time, close_time, booking_required)
      VALUES (?,?,?,?,?,?,?)`
    ).run(data.name, data.description, data.capacity, data.location, data.open_time, data.close_time, data.booking_required ? 1 : 0);
    return { success: true, id: result.lastInsertRowid };
  });
}

module.exports = { registerAmenityHandlers };
