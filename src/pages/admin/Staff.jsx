import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Shield, Wrench } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { toast } from '../../components/Toast';

const EMPTY = { name:'', email:'', phone:'', role:'maintenance', department:'', designation:'', shift:'morning', join_date:'', emergency_contact:'', address:'', password:'' };

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = () => window.api.getStaff().then(setStaff);
  useEffect(() => { load(); }, []);

  const openEdit = (s) => {
    setForm({ name:s.name, email:s.email, phone:s.phone||'', role:s.role,
      department:s.department||'', designation:s.designation||'', shift:s.shift||'morning',
      join_date:s.join_date||'', emergency_contact:s.emergency_contact||'', address:s.address||'', password:'' });
    setEditing(s.id); setModal(true);
  };

  const onSave = async () => {
    if (!form.name || !form.email) return toast.error('Name and email required');
    const res = editing ? await window.api.updateStaff(editing, form) : await window.api.addStaff(form);
    if (res.success) { toast.success(editing ? 'Staff updated' : 'Staff added'); setModal(false); load(); }
    else toast.error(res.message || 'Operation failed');
  };

  const onDelete = async () => {
    await window.api.deleteStaff(confirm);
    toast.success('Staff removed'); setConfirm(null); load();
  };

  const security = staff.filter(s => s.role === 'security');
  const maintenance = staff.filter(s => s.role === 'maintenance');

  const StaffTable = ({ members, title, icon: Icon, color }) => (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 rounded-lg ${color}`}><Icon size={16}/></div>
        <h3 className="font-semibold text-gray-800">{title} ({members.length})</h3>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="table-header">
            {['Name','Email','Phone','Designation','Shift','Joined',''].map(h=>(
              <th key={h} className="px-3 py-2">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.length===0 && <tr><td colSpan={7} className="text-center py-6 text-gray-400 text-sm">No staff added</td></tr>}
          {members.map(s=>(
            <tr key={s.id} className="table-row">
              <td className="px-3 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">{s.name.charAt(0)}</div>
                  <span className="font-medium">{s.name}</span>
                </div>
              </td>
              <td className="px-3 py-3 text-sm text-gray-600">{s.email}</td>
              <td className="px-3 py-3 text-sm text-gray-600">{s.phone||'—'}</td>
              <td className="px-3 py-3 text-sm">{s.designation||'—'}</td>
              <td className="px-3 py-3 text-sm capitalize"><Badge variant="default">{s.shift||'—'}</Badge></td>
              <td className="px-3 py-3 text-sm text-gray-400">{s.join_date||'—'}</td>
              <td className="px-3 py-3">
                <div className="flex gap-1">
                  <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Pencil size={13}/></button>
                  <button onClick={() => setConfirm(s.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={13}/></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="text-sm text-gray-500">{staff.length} total staff members</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setEditing(null); setModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={15}/> Add Staff</button>
      </div>

      <StaffTable members={security} title="Security Guards" icon={Shield} color="bg-slate-100 text-slate-600" />
      <StaffTable members={maintenance} title="Maintenance Staff" icon={Wrench} color="bg-orange-100 text-orange-600" />

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Staff' : 'Add Staff'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Full Name *</label><input className="input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
            <div><label className="label">Email *</label><input type="email" className="input" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div>
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/></div>
            <div>
              <label className="label">Role *</label>
              <select className="input" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
                <option value="maintenance">Maintenance</option>
                <option value="security">Security</option>
              </select>
            </div>
            <div><label className="label">Department</label><input className="input" value={form.department} onChange={e=>setForm(f=>({...f,department:e.target.value}))}/></div>
            <div><label className="label">Designation</label><input className="input" value={form.designation} onChange={e=>setForm(f=>({...f,designation:e.target.value}))}/></div>
            <div>
              <label className="label">Shift</label>
              <select className="input" value={form.shift} onChange={e=>setForm(f=>({...f,shift:e.target.value}))}>
                <option value="morning">Morning (6AM–2PM)</option>
                <option value="afternoon">Afternoon (2PM–10PM)</option>
                <option value="night">Night (10PM–6AM)</option>
              </select>
            </div>
            <div><label className="label">Join Date</label><input type="date" className="input" value={form.join_date} onChange={e=>setForm(f=>({...f,join_date:e.target.value}))}/></div>
            <div><label className="label">Emergency Contact</label><input className="input" value={form.emergency_contact} onChange={e=>setForm(f=>({...f,emergency_contact:e.target.value}))}/></div>
            <div><label className="label">Address</label><input className="input" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))}/></div>
            {!editing && <div className="col-span-2"><label className="label">Password (default based on role)</label><input type="password" className="input" placeholder="Leave blank for default" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/></div>}
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onSave} className="btn-primary flex-1">{editing ? 'Update' : 'Add Staff'}</button>
            <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!confirm} onConfirm={onDelete} onCancel={() => setConfirm(null)}
        title="Remove Staff" message="This will deactivate the staff account." confirmLabel="Remove"/>
    </div>
  );
}
