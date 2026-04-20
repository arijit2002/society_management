import { useEffect, useState } from 'react';
import { Building2, Plus, XCircle, Clock } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Badge, statusVariant, formatStatus } from '../../components/Badge';
import { toast } from '../../components/Toast';
import { useAuthStore } from '../../store/authStore';

export default function ResidentAmenities() {
  const [amenities, setAmenities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ booking_date:'', start_time:'', end_time:'', purpose:'', attendees:1 });
  const { user } = useAuthStore();

  const load = () => {
    window.api.getAmenities().then(setAmenities);
    if (user) window.api.getBookings({ resident_id: user.id }).then(setBookings);
  };
  useEffect(() => { load(); }, [user]);

  const onBook = async () => {
    if (!form.booking_date || !form.start_time || !form.end_time) return toast.error('Please fill all required fields');
    if (form.start_time >= form.end_time) return toast.error('End time must be after start time');
    const res = await window.api.addBooking({ ...form, amenity_id: modal.id, resident_id: user.id });
    if (res.success) { toast.success('Booking request submitted'); setModal(null); load(); }
    else toast.error(res.message || 'Booking failed');
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Amenities</h1>
        <p className="text-sm text-gray-500">Book and manage facility reservations</p>
      </div>

      {/* Available amenities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {amenities.map(a => (
          <div key={a.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl"><Building2 size={18}/></div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{a.name}</h3>
                {a.location && <p className="text-xs text-gray-400">{a.location}</p>}
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.description}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge variant="info"><Clock size={11} className="mr-1"/>{a.open_time}–{a.close_time}</Badge>
                  <Badge variant="default">Cap: {a.capacity}</Badge>
                </div>
              </div>
            </div>
            {a.booking_required ? (
              <button onClick={() => { setModal(a); setForm({ booking_date:'', start_time:'', end_time:'', purpose:'', attendees:1 }); }}
                className="btn-primary w-full mt-3 flex items-center justify-center gap-2 py-2">
                <Plus size={14}/> Book Now
              </button>
            ) : (
              <p className="text-xs text-center text-green-600 mt-3 font-medium">Walk-in · No booking required</p>
            )}
          </div>
        ))}
      </div>

      {/* My bookings */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">My Bookings</h3>
        {bookings.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No bookings yet</p>
        ) : (
          <div className="space-y-2">
            {bookings.map(b => (
              <div key={b.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{b.amenity_name}</p>
                  <p className="text-xs text-gray-400">{b.booking_date} · {b.start_time} to {b.end_time}</p>
                  {b.purpose && <p className="text-xs text-gray-400">{b.purpose}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant(b.status)}>{formatStatus(b.status)}</Badge>
                  {b.status === 'pending' && (
                    <button onClick={async () => { await window.api.cancelBooking(b.id); toast.info('Booking cancelled'); load(); }}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                      <XCircle size={15}/>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={`Book — ${modal?.name}`} size="md">
        {modal && (
          <div className="space-y-4">
            <div className="bg-primary-50 rounded-xl p-3 text-sm text-primary-700">
              <strong>{modal.name}</strong> · {modal.location} · Open {modal.open_time}–{modal.close_time}
            </div>
            <div><label className="label">Date *</label><input type="date" className="input" min={new Date().toISOString().split('T')[0]} value={form.booking_date} onChange={e=>setForm(f=>({...f,booking_date:e.target.value}))}/></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Start Time *</label><input type="time" className="input" value={form.start_time} onChange={e=>setForm(f=>({...f,start_time:e.target.value}))}/></div>
              <div><label className="label">End Time *</label><input type="time" className="input" value={form.end_time} onChange={e=>setForm(f=>({...f,end_time:e.target.value}))}/></div>
            </div>
            <div><label className="label">Purpose</label><input className="input" placeholder="What's the occasion?" value={form.purpose} onChange={e=>setForm(f=>({...f,purpose:e.target.value}))}/></div>
            <div><label className="label">Expected Attendees</label><input type="number" className="input" min={1} max={modal.capacity} value={form.attendees} onChange={e=>setForm(f=>({...f,attendees:+e.target.value}))}/></div>
            <div className="flex gap-3 pt-1">
              <button onClick={onBook} className="btn-primary flex-1">Submit Request</button>
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
