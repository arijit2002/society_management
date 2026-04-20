import { useEffect, useState } from 'react';
import { Plus, Building2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Badge, statusVariant, formatStatus } from '../../components/Badge';
import { toast } from '../../components/Toast';

export default function AdminAmenities() {
  const [amenities, setAmenities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('bookings');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name:'', description:'', capacity:0, location:'', open_time:'06:00', close_time:'22:00', booking_required:true });

  const loadAmenities = () => window.api.getAmenities().then(setAmenities);
  const loadBookings  = () => window.api.getBookings({ status: 'pending' }).then(setBookings);

  useEffect(() => { loadAmenities(); loadBookings(); }, []);

  const onApprove = async (id) => {
    await window.api.updateBooking({ id, status: 'approved' });
    toast.success('Booking approved'); loadBookings();
  };

  const onReject = async (id) => {
    await window.api.updateBooking({ id, status: 'rejected' });
    toast.info('Booking rejected'); loadBookings();
  };

  const onAddAmenity = async () => {
    if (!form.name) return toast.error('Name is required');
    const res = await window.api.addAmenity(form);
    if (res.success) { toast.success('Amenity added'); setModal(false); loadAmenities(); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Amenities</h1>
          <p className="text-sm text-gray-500">Manage facilities and booking requests</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2"><Plus size={15}/> Add Amenity</button>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {['bookings','amenities'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${tab===t ? 'border-primary-600 text-primary-600':'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t} {t==='bookings' && bookings.length > 0 && <span className="ml-1 bg-red-100 text-red-600 text-xs px-1.5 rounded-full">{bookings.length}</span>}
          </button>
        ))}
      </div>

      {tab === 'bookings' && (
        <div className="card p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="table-header">
                  {['Amenity','Resident','Date','Time','Purpose','Attendees','Status',''].map(h=>(
                    <th key={h} className="px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.length===0 && <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-sm">No pending booking requests</td></tr>}
                {bookings.map(b => (
                  <tr key={b.id} className="table-row">
                    <td className="table-cell font-medium">{b.amenity_name}</td>
                    <td className="table-cell">{b.resident_name}<br/><span className="text-xs text-gray-400">Flat {b.flat_no}</span></td>
                    <td className="table-cell">{b.booking_date}</td>
                    <td className="table-cell text-xs">{b.start_time} – {b.end_time}</td>
                    <td className="table-cell text-xs">{b.purpose||'—'}</td>
                    <td className="table-cell">{b.attendees}</td>
                    <td className="table-cell"><Badge variant={statusVariant(b.status)}>{formatStatus(b.status)}</Badge></td>
                    <td className="table-cell">
                      {b.status === 'pending' && (
                        <div className="flex gap-1">
                          <button onClick={() => onApprove(b.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"><CheckCircle size={15}/></button>
                          <button onClick={() => onReject(b.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><XCircle size={15}/></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'amenities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {amenities.map(a => (
            <div key={a.id} className="card">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl"><Building2 size={18}/></div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{a.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{a.location}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{a.description}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Badge variant="info"><Clock size={11} className="mr-1"/>{a.open_time}–{a.close_time}</Badge>
                    <Badge variant="default">Cap: {a.capacity}</Badge>
                    {a.booking_required ? <Badge variant="warning">Booking Required</Badge> : <Badge variant="success">Walk-in</Badge>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Amenity" size="md">
        <div className="space-y-4">
          <div><label className="label">Name *</label><input className="input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
          <div><label className="label">Description</label><textarea className="input" rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Location</label><input className="input" value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))}/></div>
            <div><label className="label">Capacity</label><input type="number" className="input" value={form.capacity} onChange={e=>setForm(f=>({...f,capacity:+e.target.value}))}/></div>
            <div><label className="label">Opening Time</label><input type="time" className="input" value={form.open_time} onChange={e=>setForm(f=>({...f,open_time:e.target.value}))}/></div>
            <div><label className="label">Closing Time</label><input type="time" className="input" value={form.close_time} onChange={e=>setForm(f=>({...f,close_time:e.target.value}))}/></div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="booking_required" checked={form.booking_required} onChange={e=>setForm(f=>({...f,booking_required:e.target.checked}))} className="rounded"/>
            <label htmlFor="booking_required" className="text-sm text-gray-700">Booking required to use this amenity</label>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onAddAmenity} className="btn-primary flex-1">Add Amenity</button>
            <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
