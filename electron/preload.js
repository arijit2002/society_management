const { contextBridge, ipcRenderer } = require('electron');

const invoke = (channel, ...args) => ipcRenderer.invoke(channel, ...args);

contextBridge.exposeInMainWorld('api', {
  // Auth
  login:              (data)       => invoke('auth:login', data),
  getSocietyInfo:     ()           => invoke('auth:getSocietyInfo'),
  updateSocietyInfo:  (data)       => invoke('auth:updateSocietyInfo', data),
  changePassword:     (data)       => invoke('auth:changePassword', data),

  // Residents
  getResidents:       ()           => invoke('residents:getAll'),
  getResident:        (id)         => invoke('residents:getById', id),
  addResident:        (data)       => invoke('residents:add', data),
  updateResident:     (id, data)   => invoke('residents:update', { id, data }),
  deleteResident:     (id)         => invoke('residents:delete', id),
  getFlats:           ()           => invoke('flats:getAll'),
  getVacantFlats:     ()           => invoke('flats:getVacant'),

  // Fees
  getFees:            (filters)    => invoke('fees:getAll', filters),
  addFee:             (data)       => invoke('fees:add', data),
  bulkGenerateFees:   (data)       => invoke('fees:bulkGenerate', data),
  markFeePaid:        (data)       => invoke('fees:markPaid', data),
  markFeesOverdue:    ()           => invoke('fees:markOverdue'),
  waiveFee:           (data)       => invoke('fees:waive', data),
  deleteFee:          (id)         => invoke('fees:delete', id),

  // Complaints
  getComplaints:      (filters)    => invoke('complaints:getAll', filters),
  addComplaint:       (data)       => invoke('complaints:add', data),
  updateComplaint:    (id, data)   => invoke('complaints:update', { id, data }),
  deleteComplaint:    (id)         => invoke('complaints:delete', id),

  // Notices
  getNotices:         ()           => invoke('notices:getAll'),
  addNotice:          (data)       => invoke('notices:add', data),
  updateNotice:       (id, data)   => invoke('notices:update', { id, data }),
  deleteNotice:       (id)         => invoke('notices:delete', id),

  // Visitors
  getVisitors:        (filters)    => invoke('visitors:getAll', filters),
  addVisitor:         (data)       => invoke('visitors:add', data),
  checkoutVisitor:    (id)         => invoke('visitors:checkout', id),
  getVisitorCounts:   (guardId)    => invoke('visitors:getTodayCount', guardId),

  // Amenities
  getAmenities:       ()           => invoke('amenities:getAll'),
  getBookings:        (filters)    => invoke('amenities:getBookings', filters),
  addBooking:         (data)       => invoke('amenities:addBooking', data),
  updateBooking:      (data)       => invoke('amenities:updateBooking', data),
  cancelBooking:      (id)         => invoke('amenities:cancelBooking', id),
  addAmenity:         (data)       => invoke('amenities:add', data),

  // Tasks
  getTasks:           (filters)    => invoke('tasks:getAll', filters),
  addTask:            (data)       => invoke('tasks:add', data),
  updateTask:         (id, data)   => invoke('tasks:update', { id, data }),
  updateTaskStatus:   (data)       => invoke('tasks:updateStatus', data),
  deleteTask:         (id)         => invoke('tasks:delete', id),
  getStaffList:       ()           => invoke('tasks:getStaffList'),

  // Staff
  getStaff:           ()           => invoke('staff:getAll'),
  addStaff:           (data)       => invoke('staff:add', data),
  updateStaff:        (id, data)   => invoke('staff:update', { id, data }),
  deleteStaff:        (id)         => invoke('staff:delete', id),

  // Stats
  getDashboardStats:        ()           => invoke('stats:dashboard'),
  getResidentDashboard:     (id)         => invoke('stats:residentDashboard', id),
  getReports:               (filters)    => invoke('stats:reports', filters),
});
