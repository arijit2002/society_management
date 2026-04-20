function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS society_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT 'My Society',
      address TEXT,
      city TEXT,
      state TEXT,
      pincode TEXT,
      registration_no TEXT,
      total_flats INTEGER DEFAULT 0,
      maintenance_amount REAL DEFAULT 2000,
      email TEXT,
      phone TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','resident','security','maintenance')),
      flat_no TEXT,
      block TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS flats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      flat_no TEXT NOT NULL,
      block TEXT NOT NULL DEFAULT 'A',
      floor INTEGER DEFAULT 1,
      area_sqft REAL DEFAULT 0,
      ownership_type TEXT DEFAULT 'owner' CHECK(ownership_type IN ('owner','rented')),
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS maintenance_fees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      flat_id INTEGER REFERENCES flats(id),
      resident_id INTEGER REFERENCES users(id),
      amount REAL NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      due_date DATE,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','paid','overdue','waived')),
      paid_date DATE,
      payment_method TEXT,
      receipt_no TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resident_id INTEGER REFERENCES users(id),
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'general',
      status TEXT DEFAULT 'open' CHECK(status IN ('open','in_progress','resolved','closed')),
      priority TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high','urgent')),
      assigned_to INTEGER REFERENCES users(id),
      resolution_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      priority TEXT DEFAULT 'normal' CHECK(priority IN ('normal','important','urgent')),
      target_audience TEXT DEFAULT 'all',
      created_by INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS visitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_name TEXT NOT NULL,
      visitor_phone TEXT,
      purpose TEXT,
      vehicle_no TEXT,
      host_flat TEXT,
      host_resident_id INTEGER REFERENCES users(id),
      guard_id INTEGER REFERENCES users(id),
      entry_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      exit_time DATETIME,
      status TEXT DEFAULT 'inside' CHECK(status IN ('inside','exited')),
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS amenities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      capacity INTEGER DEFAULT 0,
      location TEXT,
      open_time TEXT DEFAULT '06:00',
      close_time TEXT DEFAULT '22:00',
      booking_required INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS amenity_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amenity_id INTEGER REFERENCES amenities(id),
      resident_id INTEGER REFERENCES users(id),
      booking_date DATE NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      purpose TEXT,
      attendees INTEGER DEFAULT 1,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','cancelled')),
      approved_by INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT DEFAULT 'general',
      location TEXT,
      priority TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high','urgent')),
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','in_progress','completed','cancelled')),
      assigned_to INTEGER REFERENCES users(id),
      created_by INTEGER REFERENCES users(id),
      complaint_id INTEGER REFERENCES complaints(id),
      due_date DATE,
      completion_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS staff_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE REFERENCES users(id),
      department TEXT,
      designation TEXT,
      shift TEXT DEFAULT 'morning',
      join_date DATE,
      emergency_contact TEXT,
      address TEXT
    );
  `);
}

module.exports = { initSchema };
