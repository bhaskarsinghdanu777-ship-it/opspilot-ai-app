import React, { useState, useMemo } from 'react';
import { CustomerItem, CustomerStatus } from '@/src/types';
import { Search, Crown, UserCheck, AlertTriangle, UserX, MessageSquare, Phone } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';

interface CustomersTableProps {
  customers: CustomerItem[];
}

export const CustomersTable: React.FC<CustomersTableProps> = ({ customers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [contactCustomer, setContactCustomer] = useState<CustomerItem | null>(null);

  const statuses = ['All', 'VIP', 'Active', 'At Risk', 'Inactive'];

  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const matchesSearch =
        cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust.phone.includes(searchTerm);
      const matchesStatus =
        statusFilter === 'All' || cust.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  const getStatusBadge = (status: CustomerStatus) => {
    switch (status) {
      case 'VIP':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Crown className="w-3 h-3 text-purple-600" />
            VIP
          </span>
        );
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <UserCheck className="w-3 h-3 text-emerald-600" />
            Active
          </span>
        );
      case 'At Risk':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            At Risk
          </span>
        );
      case 'Inactive':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <UserX className="w-3 h-3 text-slate-400" />
            Inactive
          </span>
        );
    }
  };

  return (
    <div id="customers-management-table" className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex flex-1 items-center gap-2.5">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="customer-search-input"
              type="text"
              placeholder="Search by name, email, or mobile number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <select
            id="customer-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                Status: {s}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredCustomers.length} of {customers.length} registered accounts
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="py-3 px-4">Customer Details</th>
              <th className="py-3 px-4 text-center">Orders</th>
              <th className="py-3 px-4 text-right">Total Spend</th>
              <th className="py-3 px-4">Last Purchase</th>
              <th className="py-3 px-4">Preferred Category</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Engage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No customers found matching the search criteria.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{cust.name}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{cust.email}</span>
                      <span>•</span>
                      <span className="font-mono">{cust.phone}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                    {cust.orders}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    ₹{cust.totalSpend.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{cust.lastPurchase}</td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {cust.preferredCategory}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">{getStatusBadge(cust.status)}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setContactCustomer(cust)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                        cust.status === 'At Risk'
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>{cust.status === 'At Risk' ? 'Re-engage' : 'Contact'}</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Contact Customer Modal */}
      {contactCustomer && (
        <Modal
          isOpen={Boolean(contactCustomer)}
          onClose={() => setContactCustomer(null)}
          title={`Engage Customer: ${contactCustomer.name}`}
          subtitle={`Status: ${contactCustomer.status} • Total Spend: ₹${contactCustomer.totalSpend.toLocaleString('en-IN')}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Phone / WhatsApp:</span>
                <span className="font-mono font-semibold text-slate-900">{contactCustomer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-900">{contactCustomer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Purchase:</span>
                <span className="text-slate-900">{contactCustomer.lastPurchase}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Favorite Vertical:</span>
                <span className="font-medium text-blue-600">{contactCustomer.preferredCategory}</span>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Proposed Re-engagement Message
              </label>
              <textarea
                rows={3}
                defaultValue={`Hi ${contactCustomer.name}, we miss you at NovaMart! Enjoy a special ₹300 voucher on your next ${contactCustomer.preferredCategory} purchase with code WELCOME300.`}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setContactCustomer(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Message sent to ${contactCustomer.name} (${contactCustomer.phone})`);
                  setContactCustomer(null);
                }}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Send WhatsApp Offer</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
