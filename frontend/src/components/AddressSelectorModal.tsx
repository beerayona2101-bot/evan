import React, { useState } from 'react';
import { MapPin, Check, Plus, Trash2, X, Home, Briefcase, Phone, User, CheckCircle2 } from 'lucide-react';
import {
  SavedAddress,
  getSavedAddresses,
  saveAddressItem,
  deleteSavedAddress,
  setSelectedAddressId,
} from '../utils/addressStorage';
import { showToast } from './ToastContainer';

interface AddressSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAddressId: string;
  onSelectAddress: (address: SavedAddress) => void;
}

export const AddressSelectorModal: React.FC<AddressSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedAddressId,
  onSelectAddress,
}) => {
  const [addresses, setAddresses] = useState<SavedAddress[]>(() => getSavedAddresses());
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState<Partial<SavedAddress>>({
    fullName: '',
    phone: '',
    houseNo: '',
    street: '',
    area: '',
    city: 'Hyderabad',
    state: 'Telangana',
    postalCode: '',
    country: 'India',
    addressType: 'Home',
  });

  if (!isOpen) return null;

  const handleSelect = (addr: SavedAddress) => {
    setSelectedAddressId(addr._id);
    onSelectAddress(addr);
    showToast(`Delivery address set to ${addr.area || addr.city}!`, 'success');
    onClose();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteSavedAddress(id);
    setAddresses(updated);
    showToast('Address removed from saved list.', 'info');
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      showToast('Please enter full recipient name.', 'error');
      return;
    }
    const cleanPhone = (formData.phone || '').replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      showToast('Please enter a valid 10-digit Indian mobile number.', 'error');
      return;
    }
    if (!formData.postalCode || !/^[1-9][0-9]{5}$/.test(formData.postalCode.trim())) {
      showToast('Please enter a valid 6-digit Pincode.', 'error');
      return;
    }
    if (!formData.houseNo?.trim() || !formData.street?.trim()) {
      showToast('Please enter flat/house no and street.', 'error');
      return;
    }

    const savedList = saveAddressItem(formData as SavedAddress);
    setAddresses(savedList);
    const newest = savedList[0];
    onSelectAddress(newest);
    setShowAddForm(false);
    showToast('New address saved for future orders!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col border border-amber-200 shadow-2xl animate-in slide-in-from-bottom duration-200">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4 text-red-800" />
            </div>
            <div>
              <h3 className="font-serif-luxury font-bold text-base text-slate-900">SELECT DELIVERY ADDRESS</h3>
              <p className="text-[10px] text-slate-500 font-medium">Choose from saved addresses or add a new one</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
          
          {/* Add New Address Button */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-red-800 border border-dashed border-amber-300 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-4 h-4" /> Add & Save New Address
            </button>
          ) : (
            <form onSubmit={handleSaveNew} className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                <span className="font-bold text-slate-900 uppercase text-[11px]">Add New Delivery Address</span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-[11px] text-slate-500 hover:text-slate-800 font-bold"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Recipient Name"
                    value={formData.fullName || ''}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full p-2 bg-white border border-amber-200 rounded-xl text-xs focus:outline-none focus:border-red-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit number"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 bg-white border border-amber-200 rounded-xl text-xs focus:outline-none focus:border-red-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Flat / House / Bldg *</label>
                  <input
                    type="text"
                    required
                    placeholder="Flat 302, Sai Nilayam"
                    value={formData.houseNo || ''}
                    onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })}
                    className="w-full p-2 bg-white border border-amber-200 rounded-xl text-xs focus:outline-none focus:border-red-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Pincode *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="6-digit Pincode"
                    value={formData.postalCode || ''}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full p-2 bg-white border border-amber-200 rounded-xl text-xs focus:outline-none focus:border-red-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Street / Area / Locality *</label>
                <input
                  type="text"
                  required
                  placeholder="Road No. 10, Banjara Hills"
                  value={formData.street || ''}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full p-2 bg-white border border-amber-200 rounded-xl text-xs focus:outline-none focus:border-red-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-0.5">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="Hyderabad"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2 bg-white border border-amber-200 rounded-xl text-xs focus:outline-none focus:border-red-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-0.5">District</label>
                  <input
                    type="text"
                    placeholder="Ranga Reddy"
                    value={formData.district || ''}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full p-2 bg-white border border-amber-200 rounded-xl text-xs focus:outline-none focus:border-red-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-0.5">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="Telangana"
                    value={formData.state || ''}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full p-2 bg-white border border-amber-200 rounded-xl text-xs focus:outline-none focus:border-red-800"
                  />
                </div>
              </div>

              {/* Type Selection */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-bold text-slate-600 uppercase">Save As:</span>
                {['Home', 'Office', 'Other'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, addressType: type })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                      formData.addressType === type
                        ? 'bg-slate-900 text-amber-300 border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-red-800 hover:bg-red-900 text-amber-300 font-bold text-xs uppercase rounded-xl transition shadow"
              >
                Save & Select This Address
              </button>
            </form>
          )}

          {/* List of Saved Addresses */}
          <div className="space-y-2 pt-1">
            {addresses.map((addr) => {
              const isSelected = addr._id === selectedAddressId;
              return (
                <div
                  key={addr._id}
                  onClick={() => handleSelect(addr)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-red-800 bg-red-50/50 ring-1 ring-red-800/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{addr.fullName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-900 font-bold rounded">
                          {addr.addressType || 'Home'}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        {addr.houseNo ? addr.houseNo + ', ' : ''}{addr.street}{addr.area ? ', ' + addr.area : ''}
                      </p>
                      <p className="text-xs text-slate-500">
                        {addr.city}, {addr.state} - <strong className="text-slate-800">{addr.postalCode}</strong>
                      </p>
                      <p className="text-[11px] text-slate-600 font-semibold pt-0.5">
                        📞 {addr.phone}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={(e) => handleDelete(addr._id, e)}
                        className="text-slate-400 hover:text-red-700 p-1 rounded"
                        title="Delete Address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleSelect(addr)}
                        className={`px-3 py-1 text-[11px] font-bold rounded-lg transition ${
                          isSelected
                            ? 'bg-red-800 text-amber-300'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? 'Delivering Here' : 'Deliver Here'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};
