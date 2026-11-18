export interface SavedAddress {
  _id: string;
  fullName: string;
  phone: string;
  houseNo?: string;
  street: string;
  area?: string;
  city: string;
  district?: string;
  state: string;
  postalCode: string;
  country: string;
  addressType?: 'Home' | 'Work' | 'Other' | string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export const INITIAL_SAVED_ADDRESSES: SavedAddress[] = [
  {
    _id: 'addr-default-1',
    fullName: 'Ananya Sharma',
    phone: '9490644435',
    houseNo: 'Flat 402, Royal Residency',
    street: 'Road No. 12, Banjara Hills',
    area: 'Banjara Hills',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    postalCode: '500034',
    country: 'India',
    addressType: 'Home',
    isDefault: true,
  },
  {
    _id: 'addr-default-2',
    fullName: 'Ananya Sharma',
    phone: '9490644435',
    houseNo: 'Level 5, Signature Tower',
    street: 'HITEC City Main Road',
    area: 'Madhapur',
    city: 'Hyderabad',
    district: 'Ranga Reddy',
    state: 'Telangana',
    postalCode: '500081',
    country: 'India',
    addressType: 'Work',
    isDefault: false,
  },
];

const STORAGE_KEY = 'evan_saved_addresses';
const SELECTED_KEY = 'evan_selected_address_id';

export const getSavedAddresses = (): SavedAddress[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore JSON error
  }
  // Initialize default
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAVED_ADDRESSES));
  } catch (e) {}
  return INITIAL_SAVED_ADDRESSES;
};

export const saveAddressItem = (address: Omit<SavedAddress, '_id'> & { _id?: string }): SavedAddress[] => {
  const current = getSavedAddresses();
  const id = address._id || `addr-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const newAddr: SavedAddress = {
    ...address,
    _id: id,
    country: address.country || 'India',
    addressType: address.addressType || 'Home',
  };

  const existingIdx = current.findIndex((a) => a._id === id);
  let updated: SavedAddress[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = newAddr;
  } else {
    updated = [newAddr, ...current];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(SELECTED_KEY, id);
  } catch (e) {}
  return updated;
};

export const deleteSavedAddress = (id: string): SavedAddress[] => {
  const current = getSavedAddresses();
  const updated = current.filter((a) => a._id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    const selected = getSelectedAddressId();
    if (selected === id && updated.length > 0) {
      setSelectedAddressId(updated[0]._id);
    }
  } catch (e) {}
  return updated;
};

export const getSelectedAddressId = (): string => {
  try {
    const stored = localStorage.getItem(SELECTED_KEY);
    if (stored) return stored;
    const addrs = getSavedAddresses();
    if (addrs.length > 0) return addrs[0]._id;
  } catch (e) {}
  return 'addr-default-1';
};

export const setSelectedAddressId = (id: string) => {
  try {
    localStorage.setItem(SELECTED_KEY, id);
  } catch (e) {}
};
