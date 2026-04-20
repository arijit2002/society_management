const bcrypt = require('bcryptjs');

function seedData(db) {
  const alreadySeeded = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (alreadySeeded.count > 0) return;

  const hash = (pw) => bcrypt.hashSync(pw, 10);

  // Society info
  db.prepare(`INSERT INTO society_info (name, address, city, state, pincode, total_flats, maintenance_amount)
    VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    'Green Valley Apartments', '12 Park Street', 'Mumbai', 'Maharashtra', '400001', 20, 2500
  );

  // Users
  const users = [
    { name: 'Admin User',      email: 'admin@society.com',    phone: '9000000001', password: hash('admin123'),    role: 'admin',       flat_no: null,  block: null },
    { name: 'John Sharma',     email: 'john@society.com',     phone: '9000000002', password: hash('resident123'), role: 'resident',    flat_no: 'A101', block: 'A' },
    { name: 'Priya Verma',     email: 'priya@society.com',    phone: '9000000003', password: hash('resident123'), role: 'resident',    flat_no: 'A102', block: 'A' },
    { name: 'Rahul Kumar',     email: 'rahul@society.com',    phone: '9000000004', password: hash('resident123'), role: 'resident',    flat_no: 'B201', block: 'B' },
    { name: 'Neha Gupta',      email: 'neha@society.com',     phone: '9000000005', password: hash('resident123'), role: 'resident',    flat_no: 'B202', block: 'B' },
    { name: 'Guard Raju',      email: 'guard1@society.com',   phone: '9000000006', password: hash('guard123'),    role: 'security',    flat_no: null,  block: null },
    { name: 'Guard Suresh',    email: 'guard2@society.com',   phone: '9000000007', password: hash('guard123'),    role: 'security',    flat_no: null,  block: null },
    { name: 'Mohan Technician',email: 'tech1@society.com',    phone: '9000000008', password: hash('staff123'),    role: 'maintenance', flat_no: null,  block: null },
    { name: 'Ramesh Plumber',  email: 'tech2@society.com',    phone: '9000000009', password: hash('staff123'),    role: 'maintenance', flat_no: null,  block: null },
  ];

  const insertUser = db.prepare(
    `INSERT INTO users (name, email, phone, password, role, flat_no, block) VALUES (?,?,?,?,?,?,?)`
  );
  users.forEach(u => insertUser.run(u.name, u.email, u.phone, u.password, u.role, u.flat_no, u.block));

  // Flats
  const flats = [
    { flat_no: 'A101', block: 'A', floor: 1, area_sqft: 850,  ownership_type: 'owner',  user_id: 2 },
    { flat_no: 'A102', block: 'A', floor: 1, area_sqft: 850,  ownership_type: 'rented', user_id: 3 },
    { flat_no: 'A201', block: 'A', floor: 2, area_sqft: 1050, ownership_type: 'owner',  user_id: null },
    { flat_no: 'A202', block: 'A', floor: 2, area_sqft: 1050, ownership_type: 'owner',  user_id: null },
    { flat_no: 'B201', block: 'B', floor: 2, area_sqft: 950,  ownership_type: 'owner',  user_id: 4 },
    { flat_no: 'B202', block: 'B', floor: 2, area_sqft: 950,  ownership_type: 'rented', user_id: 5 },
    { flat_no: 'B301', block: 'B', floor: 3, area_sqft: 1200, ownership_type: 'owner',  user_id: null },
    { flat_no: 'C101', block: 'C', floor: 1, area_sqft: 750,  ownership_type: 'owner',  user_id: null },
  ];

  const insertFlat = db.prepare(
    `INSERT INTO flats (flat_no, block, floor, area_sqft, ownership_type, user_id) VALUES (?,?,?,?,?,?)`
  );
  flats.forEach(f => insertFlat.run(f.flat_no, f.block, f.floor, f.area_sqft, f.ownership_type, f.user_id));

  // Fees for current month and last 2 months
  const now = new Date();
  const months = [
    { month: now.getMonth() === 0 ? 12 : now.getMonth(),     year: now.getMonth() === 0 ? now.getFullYear()-1 : now.getFullYear() },
    { month: now.getMonth() + 1 === 0 ? 12 : (now.getMonth() === 0 ? 1 : now.getMonth()), year: now.getFullYear() },
    { month: now.getMonth() + 1, year: now.getFullYear() },
  ];

  const residentFlats = [
    { resident_id: 2, flat_id: 1 },
    { resident_id: 3, flat_id: 2 },
    { resident_id: 4, flat_id: 5 },
    { resident_id: 5, flat_id: 6 },
  ];

  const insertFee = db.prepare(
    `INSERT INTO maintenance_fees (flat_id, resident_id, amount, month, year, due_date, status, paid_date, payment_method, receipt_no)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  );

  residentFlats.forEach(({ resident_id, flat_id }) => {
    months.forEach((m, idx) => {
      const status = idx === 0 ? 'paid' : idx === 1 ? 'paid' : 'pending';
      const dueDate = `${m.year}-${String(m.month).padStart(2,'0')}-05`;
      const paidDate = status === 'paid' ? `${m.year}-${String(m.month).padStart(2,'0')}-03` : null;
      const receipt = status === 'paid' ? `RCP${Date.now()}${flat_id}${idx}` : null;
      const method = status === 'paid' ? 'cash' : null;
      insertFee.run(flat_id, resident_id, 2500, m.month, m.year, dueDate, status, paidDate, method, receipt);
    });
  });

  // Sample notices
  const insertNotice = db.prepare(
    `INSERT INTO notices (title, content, category, priority, created_by) VALUES (?,?,?,?,?)`
  );
  insertNotice.run('Society AGM Meeting', 'Annual General Meeting on 30th April at 6 PM in the Community Hall. All residents are requested to attend.', 'meeting', 'important', 1);
  insertNotice.run('Water Supply Interruption', 'Water supply will be interrupted on 22nd April from 9 AM to 1 PM due to pipeline maintenance.', 'maintenance', 'urgent', 1);
  insertNotice.run('Parking Rules Reminder', 'All residents are reminded to park only in their designated parking spots. Violators will be fined.', 'general', 'normal', 1);
  insertNotice.run('New Security Protocol', 'New visitor entry protocol is effective from 1st May. All visitors must show valid ID at the gate.', 'security', 'important', 1);

  // Sample complaints
  const insertComplaint = db.prepare(
    `INSERT INTO complaints (resident_id, title, description, category, status, priority) VALUES (?,?,?,?,?,?)`
  );
  insertComplaint.run(2, 'Water leakage in kitchen', 'There is a persistent water leakage from the pipe under the kitchen sink. It has been ongoing for 3 days.', 'plumbing', 'open', 'high');
  insertComplaint.run(3, 'Elevator not working', 'The elevator in Block A has not been functioning since yesterday. Elderly residents are facing difficulty.', 'electrical', 'in_progress', 'urgent');
  insertComplaint.run(4, 'Noisy neighbors', 'Flat B203 makes loud noise late at night which is disturbing our sleep.', 'noise', 'open', 'medium');
  insertComplaint.run(5, 'Street light broken', 'The street light near Gate 2 has been broken for a week creating safety issues at night.', 'electrical', 'resolved', 'medium');

  // Sample visitors
  const insertVisitor = db.prepare(
    `INSERT INTO visitors (visitor_name, visitor_phone, purpose, vehicle_no, host_flat, host_resident_id, guard_id, entry_time, exit_time, status)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  );
  insertVisitor.run('Delivery Boy', '9111111111', 'Package Delivery', null, 'A101', 2, 6, new Date(Date.now()-3600000).toISOString(), new Date(Date.now()-3300000).toISOString(), 'exited');
  insertVisitor.run('Dr. Anjali Shah', '9222222222', 'Doctor Visit', 'MH01AB1234', 'A102', 3, 6, new Date(Date.now()-7200000).toISOString(), null, 'inside');
  insertVisitor.run('Ramesh (Plumber)', '9333333333', 'Repair Work', null, 'B201', 4, 7, new Date(Date.now()-1800000).toISOString(), null, 'inside');

  // Amenities
  const insertAmenity = db.prepare(
    `INSERT INTO amenities (name, description, capacity, location, open_time, close_time, booking_required) VALUES (?,?,?,?,?,?,?)`
  );
  insertAmenity.run('Community Hall', 'Fully equipped hall for events and gatherings with audio system', 200, 'Ground Floor, Block A', '08:00', '22:00', 1);
  insertAmenity.run('Swimming Pool', 'Olympic-size swimming pool with changing rooms', 50, 'Basement Level', '06:00', '20:00', 1);
  insertAmenity.run('Gym', 'State-of-the-art fitness center with modern equipment', 30, 'Block B, Ground Floor', '05:30', '22:30', 0);
  insertAmenity.run('Children Play Area', 'Safe outdoor play area for children', 40, 'Central Garden', '07:00', '19:00', 0);
  insertAmenity.run('Badminton Court', 'Indoor badminton court with proper lighting', 10, 'Block C, Ground Floor', '06:00', '22:00', 1);

  // Maintenance tasks
  const insertTask = db.prepare(
    `INSERT INTO tasks (title, description, category, location, priority, status, assigned_to, created_by, complaint_id, due_date)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  );
  insertTask.run('Fix elevator Block A', 'Elevator in Block A is malfunctioning. Check motor and control panel.', 'electrical', 'Block A Lobby', 'urgent', 'in_progress', 8, 1, 2, new Date(Date.now()+86400000).toISOString().split('T')[0]);
  insertTask.run('Fix water leakage A101', 'Water leakage under kitchen sink in flat A101.', 'plumbing', 'Flat A101', 'high', 'pending', 9, 1, 1, new Date(Date.now()+172800000).toISOString().split('T')[0]);
  insertTask.run('Replace street light Gate 2', 'Street light near Gate 2 needs bulb replacement.', 'electrical', 'Gate 2', 'medium', 'completed', 8, 1, 4, new Date(Date.now()-86400000).toISOString().split('T')[0]);
  insertTask.run('Monthly generator check', 'Routine monthly check and maintenance of diesel generator.', 'general', 'Generator Room', 'low', 'pending', 8, 1, null, new Date(Date.now()+604800000).toISOString().split('T')[0]);

  // Staff details
  const insertStaff = db.prepare(
    `INSERT INTO staff_details (user_id, department, designation, shift, join_date) VALUES (?,?,?,?,?)`
  );
  insertStaff.run(6, 'Security', 'Security Guard', 'morning', '2022-03-15');
  insertStaff.run(7, 'Security', 'Security Guard', 'evening', '2023-01-10');
  insertStaff.run(8, 'Maintenance', 'Electrician', 'morning', '2021-06-20');
  insertStaff.run(9, 'Maintenance', 'Plumber', 'morning', '2022-08-05');
}

module.exports = { seedData };
