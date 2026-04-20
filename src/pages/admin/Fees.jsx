import { useEffect, useState } from 'react';
import { Plus, CheckCircle, RefreshCw, AlertTriangle, Download } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Badge, statusVariant, formatStatus } from '../../components/Badge';
import { toast } from '../../components/Toast';
import { format } from 'date-fns';

const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const now = new Date();

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [residents, setResidents] = useState([]);
  const [filters, setFilters] = useState({ month: now.getMonth()+1, year: now.getFullYear(), status: '' });
  const [modal, setModal] = useState(null);
  const [payModal, setPayModal] = useState(null);
  const [bulkModal, setBulkModal] = useState(false);
  const [form, setForm] = useState({ resident_id:'', amount:2500, month: now.getMonth()+1, year: now.getFullYear() });
  const [payForm, setPayForm] = useState({ payment_method:'cash', notes:'' });
  const [bulkForm, setBulkForm] = useState({ month: now.getMonth()+1, year: now.getFullYear(), amount:2500 });

  const load = () => window.api.getFees(filters).then(setFees);
  useEffect(() => { window.api.getResidents().then(setResidents); }, []);
  useEffect(() => { load(); }, [filters]);

  const summary = {
    total: fees.length,
    paid: fees.filter(f => f.status === 'paid').length,
    pending: fees.filter(f => f.status === 'pending').length,
    overdue: fees.filter(f => f.status === 'overdue').length,
    collected: fees.filter(f => f.status === 'paid').reduce((s,f) => s+f.amount, 0),
    pending_amount: fees.filter(f => f.status !== 'paid' && f.status !== 'waived').reduce((s,f) => s+f.amount, 0),
  };

  const onMarkPaid = async () => {
    const res = await window.api.markFeePaid({ id: payModal.id, ...payForm });
    if (res.success) { toast.success(`Marked as paid · Receipt: ${res.receipt_no}`); setPayModal(null); load(); }
    else toast.error('Failed');
  };

  const onBulkGenerate = async () => {
    const res = await window.api.bulkGenerateFees(bulkForm);
    if (res.success) { toast.success(`Created ${res.created} fee records`); setBulkModal(false); load(); }
  };

  const onMarkOverdue = async () => {
    await window.api.markFeesOverdue();
    toast.info('Overdue fees updated'); load();
  };

  const onAddFee = async () => {
    const r = residents.find(x => x.id === +form.resident_id);
    const data = { ...form, flat_id: r?.flat_id || null };
    const res = await window.api.addFee(data);
    if (res.success) { toast.success('Fee record added'); setModal(false); load(); }
    else toast.error(res.message);
  };

  const years = Array.from({length:3}, (_,i) => now.getFullYear()-i);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Maintenance Fees</h1>
          <p className="text-sm text-gray-500">Track and manage fee collection</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={onMarkOverdue} className="btn-secondary flex items-center gap-2 text-xs"><AlertTriangle size={14}/> Mark Overdue</button>
          <button onClick={() => setBulkModal(true)} className="btn-secondary flex items-center gap-2"><RefreshCw size={14}/> Bulk Generate</button>
          <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2"><Plus size={14}/> Add Record</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label:'Total',     value: summary.total,          color:'text-gray-700' },
          { label:'Paid',      value: summary.paid,           color:'text-green-600' },
          { label:'Pending',   value: summary.pending,        color:'text-yellow-600' },
          { label:'Overdue',   value: summary.overdue,        color:'text-red-600' },
          { label:'Collected', value:`₹${summary.collected.toLocaleString()}`, color:'text-green-600' },
          { label:'Due',       value:`₹${summary.pending_amount.toLocaleString()}`, color:'text-red-600' },
        ].map(s => (
          <div key={s.label} className="card py-3 text-center">
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card py-3">
        <div className="flex gap-3 flex-wrap">
          <select className="input w-auto text-sm" value={filters.month} onChange={e=>setFilters(f=>({...f,month:+e.target.value}))}>
            {MONTHS.map((m,i) => i>0 && <option key={i} value={i}>{m}</option>)}
          </select>
          <select className="input w-auto text-sm" value={filters.year} onChange={e=>setFilters(f=>({...f,year:+e.target.value}))}>
            {years.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
          <select className="input w-auto text-sm" value={filters.status} onChange={e=>setFilters(f=>({...f,status:e.target.value}))}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="waived">Waived</option>
          </select>
        </div>
      </div>

      <div className="card p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="table-header">
                {['Resident','Flat','Month/Year','Amount','Due Date','Status','Paid Date','Payment',''].map(h=>(
                  <th key={h} className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fees.length===0 && <tr><td colSpan={9} className="text-center py-10 text-gray-400 text-sm">No records found</td></tr>}
              {fees.map(f => (
                <tr key={f.id} className="table-row">
                  <td className="table-cell font-medium">{f.resident_name}</td>
                  <td className="table-cell">{f.block}-{f.flat_no}</td>
                  <td className="table-cell">{MONTHS[f.month]} {f.year}</td>
                  <td className="table-cell font-medium">₹{f.amount.toLocaleString()}</td>
                  <td className="table-cell">{f.due_date || '—'}</td>
                  <td className="table-cell"><Badge variant={statusVariant(f.status)}>{formatStatus(f.status)}</Badge></td>
                  <td className="table-cell">{f.paid_date || '—'}</td>
                  <td className="table-cell capitalize">{f.payment_method || '—'}</td>
                  <td className="table-cell">
                    {f.status !== 'paid' && f.status !== 'waived' && (
                      <button onClick={() => setPayModal(f)} className="text-xs btn-success px-3 py-1">Mark Paid</button>
                    )}
                    {f.status === 'paid' && f.receipt_no && (
                      <span className="text-xs text-gray-400">{f.receipt_no}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark Paid Modal */}
      <Modal isOpen={!!payModal} onClose={() => setPayModal(null)} title="Mark Fee as Paid" size="sm">
        {payModal && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Marking fee for <strong>{payModal.resident_name}</strong> — {MONTHS[payModal.month]} {payModal.year} — ₹{payModal.amount.toLocaleString()}</p>
            <div>
              <label className="label">Payment Method</label>
              <select className="input" value={payForm.payment_method} onChange={e=>setPayForm(f=>({...f,payment_method:e.target.value}))}>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div><label className="label">Notes</label><textarea className="input" rows={2} value={payForm.notes} onChange={e=>setPayForm(f=>({...f,notes:e.target.value}))}/></div>
            <div className="flex gap-3"><button onClick={onMarkPaid} className="btn-success flex-1 flex items-center justify-center gap-2"><CheckCircle size={15}/>Confirm Payment</button><button onClick={()=>setPayModal(null)} className="btn-secondary">Cancel</button></div>
          </div>
        )}
      </Modal>

      {/* Bulk Generate Modal */}
      <Modal isOpen={bulkModal} onClose={() => setBulkModal(false)} title="Bulk Generate Fee Records" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Generate fee records for all active residents for the selected month.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Month</label>
              <select className="input" value={bulkForm.month} onChange={e=>setBulkForm(f=>({...f,month:+e.target.value}))}>
                {MONTHS.map((m,i) => i>0 && <option key={i} value={i}>{m}</option>)}
              </select>
            </div>
            <div><label className="label">Year</label><input type="number" className="input" value={bulkForm.year} onChange={e=>setBulkForm(f=>({...f,year:+e.target.value}))}/></div>
            <div className="col-span-2"><label className="label">Amount (₹)</label><input type="number" className="input" value={bulkForm.amount} onChange={e=>setBulkForm(f=>({...f,amount:+e.target.value}))}/></div>
          </div>
          <div className="flex gap-3"><button onClick={onBulkGenerate} className="btn-primary flex-1">Generate</button><button onClick={()=>setBulkModal(false)} className="btn-secondary">Cancel</button></div>
        </div>
      </Modal>

      {/* Add Single Fee Modal */}
      <Modal isOpen={!!modal} onClose={() => setModal(false)} title="Add Fee Record" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Resident</label>
            <select className="input" value={form.resident_id} onChange={e=>setForm(f=>({...f,resident_id:e.target.value}))}>
              <option value="">Select resident</option>
              {residents.map(r=><option key={r.id} value={r.id}>{r.name} ({r.flat_no})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Month</label>
              <select className="input" value={form.month} onChange={e=>setForm(f=>({...f,month:+e.target.value}))}>
                {MONTHS.map((m,i)=>i>0&&<option key={i} value={i}>{m}</option>)}
              </select>
            </div>
            <div><label className="label">Year</label><input type="number" className="input" value={form.year} onChange={e=>setForm(f=>({...f,year:+e.target.value}))}/></div>
            <div className="col-span-2"><label className="label">Amount (₹)</label><input type="number" className="input" value={form.amount} onChange={e=>setForm(f=>({...f,amount:+e.target.value}))}/></div>
          </div>
          <div className="flex gap-3"><button onClick={onAddFee} className="btn-primary flex-1">Add Record</button><button onClick={()=>setModal(false)} className="btn-secondary">Cancel</button></div>
        </div>
      </Modal>
    </div>
  );
}
