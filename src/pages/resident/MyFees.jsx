import { useEffect, useState } from 'react';
import { Badge, statusVariant, formatStatus } from '../../components/Badge';
import { useAuthStore } from '../../store/authStore';
import { CreditCard, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function MyFees() {
  const [fees, setFees] = useState([]);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) window.api.getFees({ resident_id: user.id }).then(setFees);
  }, [user]);

  const paid    = fees.filter(f => f.status === 'paid');
  const pending = fees.filter(f => f.status !== 'paid' && f.status !== 'waived');
  const totalDue = pending.reduce((s,f) => s+f.amount, 0);
  const totalPaid = paid.reduce((s,f) => s+f.amount, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">My Maintenance Fees</h1>
        <p className="text-sm text-gray-500">Fee payment history for your flat</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <CheckCircle size={20} className="mx-auto mb-1 text-green-500"/>
          <p className="text-xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Total Paid</p>
        </div>
        <div className="card text-center">
          <AlertTriangle size={20} className="mx-auto mb-1 text-red-500"/>
          <p className="text-xl font-bold text-red-600">₹{totalDue.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Outstanding</p>
        </div>
        <div className="card text-center">
          <CreditCard size={20} className="mx-auto mb-1 text-primary-500"/>
          <p className="text-xl font-bold text-gray-800">{fees.length}</p>
          <p className="text-xs text-gray-400">Total Records</p>
        </div>
      </div>

      <div className="card p-0">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Payment History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="table-header">
                {['Month','Amount','Due Date','Status','Paid Date','Payment Method','Receipt'].map(h=>(
                  <th key={h} className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fees.length===0 && <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">No fee records found</td></tr>}
              {fees.map(f => (
                <tr key={f.id} className="table-row">
                  <td className="table-cell font-medium">{MONTHS[f.month]} {f.year}</td>
                  <td className="table-cell font-semibold">₹{f.amount.toLocaleString()}</td>
                  <td className="table-cell">{f.due_date || '—'}</td>
                  <td className="table-cell"><Badge variant={statusVariant(f.status)}>{formatStatus(f.status)}</Badge></td>
                  <td className="table-cell">{f.paid_date || '—'}</td>
                  <td className="table-cell capitalize">{f.payment_method || '—'}</td>
                  <td className="table-cell text-xs text-gray-400">{f.receipt_no || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalDue > 0 && (
        <div className="card bg-red-50 border-red-100">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-500 flex-shrink-0"/>
            <div>
              <p className="font-semibold text-red-700">Outstanding Amount: ₹{totalDue.toLocaleString()}</p>
              <p className="text-sm text-red-500">Please contact the society office to make your payment and avoid late fees.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
