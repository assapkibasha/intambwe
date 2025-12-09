import React, { useEffect, useState } from 'react';
import inventoryService from '../../../services/inventoryService';
import { useEmployeeAuth } from '../../../contexts/EmployeeAuthContext';

export default function InventoryRequests() {
  const { employee } = useEmployeeAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const resp = await inventoryService.listRequests({ limit: 100 });
      setRequests(resp.data || resp);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (r) => {
    if (!confirm('Approve this request?')) return;
    try {
      await inventoryService.approveRequest(r.request_id);
      await load();
      alert('Approved');
    } catch (err) { alert(err.message || 'Approve failed'); }
  };

  const handleReject = async (r) => {
    const reason = prompt('Rejection reason', 'Not available');
    if (reason === null) return;
    try {
      await inventoryService.rejectRequest(r.request_id, reason);
      await load();
      alert('Rejected');
    } catch (err) { alert(err.message || 'Reject failed'); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Inventory Requests</h2>
      <div className="bg-white p-4 rounded shadow">
        {loading ? <div>Loading...</div> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>Item</th>
                <th>Requester</th>
                <th>Qty requested</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.request_id} className="border-t">
                  <td className="py-2">{r.item?.name} ({r.item?.stock_keeping_unit})</td>
                  <td>{r.requester?.emp_name}</td>
                  <td>{r.quantity_requested}</td>
                  <td>{r.status}</td>
                  <td>
                    {employee?.emp_role && ['admin','stock_manager'].includes(employee.emp_role) && r.status === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(r)} className="bg-emerald-600 text-white px-3 py-1 rounded mr-2">Approve</button>
                        <button onClick={() => handleReject(r)} className="bg-red-600 text-white px-3 py-1 rounded">Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
