import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Users, Shield, CheckCircle2, AlertCircle, Ban, RefreshCw, X, Loader2 } from 'lucide-react';
import apiRequest from '../../services/api.js';
import { User, UserRole } from '../../types/index.js';

export const AdminUsers: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Role edit modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('CUSTOMER');
  const [updating, setUpdating] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await apiRequest('/api/v1/admin/users');
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (editingUser.id === currentAdmin?.id && selectedRole !== 'ADMIN') {
      setModalError('Security policy prevents demoting your own active administrator account.');
      return;
    }

    setUpdating(true);
    setModalError(null);

    try {
      const res = await apiRequest(`/api/v1/admin/users/${editingUser.id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: selectedRole }),
      });

      if (res.success) {
        setEditingUser(null);
        await fetchUsers();
      } else {
        setModalError(res.error || 'Failed to update user role.');
      }
    } catch {
      setModalError('Network error while updating role.');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (user.id === currentAdmin?.id) {
      alert('Security policy prevents suspending your own active administrator account.');
      return;
    }

    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!confirm(`Are you sure you want to set status of ${user.email} to ${nextStatus}?`)) {
      return;
    }

    try {
      const res = await apiRequest(`/api/v1/admin/users/${user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.success) {
        await fetchUsers();
      } else {
        alert(res.error || 'Could not change status.');
      }
    } catch {
      alert('Failed to update status.');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
            ADMIN
          </span>
        );
      case 'CONSULTANT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            CONSULTANT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            CUSTOMER
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-red-600 uppercase tracking-wider block mb-0.5">
            Identity & Privilege Governance
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            User Directory & Access Control
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Assign licensed consultant desks, delegate administrator privileges, and enforce security policies
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="p-2 border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Users</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading user registry...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3">User & Identity</th>
                  <th className="px-6 py-3">Assigned Role</th>
                  <th className="px-6 py-3">Account Status</th>
                  <th className="px-6 py-3">Workload / Dossiers</th>
                  <th className="px-6 py-3">Registered Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {u.profile ? `${u.profile.firstName} ${u.profile.lastName}` : u.email}
                        </span>
                        <span className="text-[11px] text-slate-400">{u.email}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">{getRoleBadge(u.role)}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {u.role === 'CUSTOMER' && (
                        <span>{u.applicationCount || 0} application(s)</span>
                      )}
                      {(u.role === 'CONSULTANT' || u.role === 'ADMIN') && (
                        <span>{u.assignedCasesCount || 0} assigned case(s)</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setSelectedRole(u.role);
                            setModalError(null);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition cursor-pointer"
                        >
                          Change Role
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={u.id === currentAdmin?.id}
                          className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                            u.status === 'ACTIVE'
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-red-600" />
                <h3 className="font-bold text-slate-900 text-sm">Privilege Assignment</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateRole} className="space-y-4 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Target Account:</span>
                <span className="font-bold text-slate-900 text-sm">{editingUser.email}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Assigned Role
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="CUSTOMER"
                      checked={selectedRole === 'CUSTOMER'}
                      onChange={() => setSelectedRole('CUSTOMER')}
                      className="mr-3 text-blue-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">CUSTOMER</span>
                      <span className="text-slate-500 text-[11px]">
                        Standard applicant. Can upload own documents and track dossiers.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="CONSULTANT"
                      checked={selectedRole === 'CONSULTANT'}
                      onChange={() => setSelectedRole('CONSULTANT')}
                      className="mr-3 text-blue-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">CONSULTANT</span>
                      <span className="text-slate-500 text-[11px]">
                        Licensed staff. Access to assigned applicant cases and document reviews.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="ADMIN"
                      checked={selectedRole === 'ADMIN'}
                      onChange={() => setSelectedRole('ADMIN')}
                      className="mr-3 text-blue-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">ADMINISTRATOR</span>
                      <span className="text-slate-500 text-[11px]">
                        Executive access. Full system control, case reassignments, and audit inspection.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
                >
                  {updating ? 'Assigning...' : 'Confirm Role Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
