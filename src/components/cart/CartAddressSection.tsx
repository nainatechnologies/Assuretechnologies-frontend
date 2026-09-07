import React, { useState } from 'react';
import { FaTrash, FaPlus, FaEdit, FaCheckCircle } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Swal from 'sweetalert2';
import API from '../../api/axiosConfig';
import { Toast } from '../../utils/errorHandler';
import { StateSelect } from '../StateSelect';
import { type Address, addressFormSchema, type AddressFormValues } from './CartTypes';

interface CartAddressSectionProps {
  addresses: Address[];
  selectedAddressId: string;
  onSelectAddressId: (id: string) => void;
  onDeliverHere: () => void;
  onAddressesUpdated: (newSelectedId?: string) => Promise<void>;
}

export const CartAddressSection: React.FC<CartAddressSectionProps> = ({
  addresses,
  selectedAddressId,
  onSelectAddressId,
  onDeliverHere,
  onAddressesUpdated
}) => {
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const {
    register: registerAddress,
    handleSubmit: handleAddressFormSubmit,
    reset: resetAddressForm,
    setValue: setAddressValue,
    watch: watchAddress,
    clearErrors: clearAddressErrors,
    formState: { errors: addressErrors, isSubmitting: isSavingAddress }
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      fullName: '',
      mobileNumber: '',
      pincode: '',
      city: '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      state: ''
    }
  });

  const selectedCartState = watchAddress('state');

  const onSaveAddress = async (data: AddressFormValues) => {
    try {
      const payload = {
        full_name: data.fullName,
        mobile_number: data.mobileNumber,
        pincode: data.pincode,
        address_line1: data.addressLine1,
        address_line2: data.addressLine2 || '',
        landmark: data.landmark || '',
        city: data.city,
        state: data.state
      };

      if (editingAddressId) {
        const res = await API.put(`/auth/customer/addresses/${editingAddressId}`, payload);
        if (res.data.success) {
          setEditingAddressId(null);
          resetAddressForm();
          Toast.fire({ icon: 'success', title: 'Address updated successfully!' });
          await onAddressesUpdated();
        }
      } else {
        const res = await API.post('/auth/customer/addresses', {
          ...payload,
          is_default: addresses.length === 0
        });
        if (res.data.success) {
          setShowNewAddressForm(false);
          resetAddressForm();
          Toast.fire({ icon: 'success', title: 'Address saved successfully!' });
          await onAddressesUpdated(res.data.data?.id);
        }
      }
    } catch (err: any) {
      console.error('Failed to save address', err);
      Toast.fire({ icon: 'error', title: err.response?.data?.message || 'Failed to save address.' });
    }
  };

  const handleStartEditAddress = (addr: Address) => {
    setShowNewAddressForm(false);
    setEditingAddressId(addr.id);
    resetAddressForm({
      fullName: addr.fullName,
      mobileNumber: addr.mobileNumber,
      pincode: addr.pincode,
      city: addr.city,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      landmark: addr.landmark || '',
      state: addr.state
    });
  };

  const handleCancelEditAddress = () => {
    setEditingAddressId(null);
    resetAddressForm();
  };

  const handleDeleteAddress = async (addressId: string) => {
    const result = await Swal.fire({
      title: 'Delete Address?',
      text: 'Are you sure you want to remove this delivery address?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it'
    });

    if (result.isConfirmed) {
      try {
        const res = await API.delete(`/auth/customer/addresses/${addressId}`);
        if (res.data.success) {
          Toast.fire({ icon: 'success', title: 'Address deleted successfully!' });
          if (editingAddressId === addressId) {
            setEditingAddressId(null);
            resetAddressForm();
          }
          await onAddressesUpdated();
        }
      } catch (err: any) {
        console.error('Failed to delete address', err);
        Toast.fire({ icon: 'error', title: err.response?.data?.message || 'Failed to delete address.' });
      }
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const res = await API.patch(`/auth/customer/addresses/${addressId}/default`);
      if (res.data.success) {
        Toast.fire({ icon: 'success', title: 'Default address updated!' });
        onSelectAddressId(addressId);
        await onAddressesUpdated(addressId);
      }
    } catch (err: any) {
      console.error('Failed to set default address', err);
      Toast.fire({ icon: 'error', title: err.response?.data?.message || 'Failed to update default address.' });
    }
  };

  const handleCancelAddress = () => {
    setShowNewAddressForm(false);
    resetAddressForm();
  };

  return (
    <div className="address-step-container">
      <div className="cart-items-header">
        <h2>Select Delivery Address</h2>
      </div>
      <div className="address-list">
        {addresses.map(addr => {
          const isEditingThis = editingAddressId === addr.id;
          const isSelected = selectedAddressId === addr.id;

          return (
            <div key={addr.id} className={`address-card ${isSelected ? 'selected' : ''} ${isEditingThis ? 'is-editing' : ''}`}>
              {isEditingThis ? (
                <div className="edit-address-form-container">
                  <div className="address-form-header">
                    <h3>Edit Address</h3>
                    <button type="button" className="btn-close-edit" onClick={handleCancelEditAddress} aria-label="Cancel editing">
                      ✕
                    </button>
                  </div>
                  <form className="new-address-form" onSubmit={handleAddressFormSubmit(onSaveAddress)} noValidate>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          className={addressErrors.fullName ? 'input-error' : ''}
                          placeholder="Full Name"
                          maxLength={100}
                          {...registerAddress('fullName')}
                        />
                        {addressErrors.fullName && <span className="error-text">{addressErrors.fullName.message}</span>}
                      </div>
                      <div className="form-group">
                        <label>Mobile Number</label>
                        <input
                          type="tel"
                          className={addressErrors.mobileNumber ? 'input-error' : ''}
                          placeholder="10-digit Mobile Number"
                          maxLength={10}
                          {...registerAddress('mobileNumber')}
                        />
                        {addressErrors.mobileNumber && <span className="error-text">{addressErrors.mobileNumber.message}</span>}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Pincode</label>
                        <input
                          type="text"
                          className={addressErrors.pincode ? 'input-error' : ''}
                          placeholder="6-digit Pincode"
                          maxLength={6}
                          {...registerAddress('pincode')}
                        />
                        {addressErrors.pincode && <span className="error-text">{addressErrors.pincode.message}</span>}
                      </div>
                      <div className="form-group">
                        <label>Town/City</label>
                        <input
                          type="text"
                          className={addressErrors.city ? 'input-error' : ''}
                          placeholder="City / Town"
                          maxLength={50}
                          {...registerAddress('city')}
                        />
                        {addressErrors.city && <span className="error-text">{addressErrors.city.message}</span>}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Flat, House no., Building, Company, Apartment</label>
                      <input
                        type="text"
                        className={addressErrors.addressLine1 ? 'input-error' : ''}
                        placeholder="Flat / House No. / Building"
                        maxLength={150}
                        {...registerAddress('addressLine1')}
                      />
                      {addressErrors.addressLine1 && <span className="error-text">{addressErrors.addressLine1.message}</span>}
                    </div>

                    <div className="form-group">
                      <label>Area, Street, Sector, Village</label>
                      <input
                        type="text"
                        className={addressErrors.addressLine2 ? 'input-error' : ''}
                        placeholder="Area / Street / Sector"
                        maxLength={150}
                        {...registerAddress('addressLine2')}
                      />
                      {addressErrors.addressLine2 && <span className="error-text">{addressErrors.addressLine2.message}</span>}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Landmark (Optional)</label>
                        <input
                          type="text"
                          className={addressErrors.landmark ? 'input-error' : ''}
                          placeholder="E.g. near Apollo Hospital"
                          maxLength={100}
                          {...registerAddress('landmark')}
                        />
                        {addressErrors.landmark && <span className="error-text">{addressErrors.landmark.message}</span>}
                      </div>
                      <div className="form-group">
                        <label>State</label>
                        <StateSelect
                          value={selectedCartState}
                          onChange={(val: string) => {
                            setAddressValue('state', val, { shouldValidate: true });
                            if (val) clearAddressErrors('state');
                          }}
                          error={Boolean(addressErrors.state)}
                          placeholder="Select State"
                        />
                        {addressErrors.state && <span className="error-text">{addressErrors.state.message}</span>}
                      </div>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn-save-address" disabled={isSavingAddress}>
                        {isSavingAddress ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button type="button" className="btn-cancel-address" onClick={handleCancelEditAddress}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="address-card-inner">
                  <label className="address-radio-label">
                    <input
                      type="radio"
                      name="delivery_address"
                      checked={isSelected}
                      onChange={() => onSelectAddressId(addr.id)}
                    />
                    <div className="address-details">
                      <div className="address-title-row">
                        <span className="address-name">{addr.fullName}</span>
                        {addr.isDefault && <span className="address-type-tag is-default">DEFAULT</span>}
                      </div>

                      <span className="address-phone">{addr.mobileNumber}</span>
                      <span className="address-full">
                        {[addr.addressLine1, addr.addressLine2, addr.landmark, addr.city, addr.state].filter(Boolean).join(', ')} - <span className="address-pin">{addr.pincode}</span>
                      </span>

                      <div className="address-card-footer">
                        <div className="address-actions-bar">
                          <button
                            type="button"
                            className="btn-address-action btn-edit-address"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleStartEditAddress(addr);
                            }}
                          >
                            <FaEdit size={13} /> Edit
                          </button>

                          <button
                            type="button"
                            className="btn-address-action btn-delete-address"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteAddress(addr.id);
                            }}
                          >
                            <FaTrash size={12} /> Delete
                          </button>

                          {!addr.isDefault && (
                            <button
                              type="button"
                              className="btn-address-action btn-default-address"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSetDefaultAddress(addr.id);
                              }}
                            >
                              <FaCheckCircle size={13} /> Set as Default
                            </button>
                          )}
                        </div>

                        {isSelected && (
                          <button
                            type="button"
                            className="btn-deliver-here"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onDeliverHere();
                            }}
                          >
                            Deliver Here
                          </button>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              )}
            </div>
          );
        })}

        {!showNewAddressForm ? (
          <div className="add-new-address-btn" onClick={() => setShowNewAddressForm(true)}>
            <FaPlus className="add-icon" /> Add a new address
          </div>
        ) : (
          <div className="new-address-form-container">
            <h3>Add a New Address</h3>
            <form className="new-address-form" onSubmit={handleAddressFormSubmit(onSaveAddress)} noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className={addressErrors.fullName ? 'input-error' : ''}
                    placeholder="Full Name"
                    maxLength={100}
                    {...registerAddress('fullName')}
                  />
                  {addressErrors.fullName && <span className="error-text">{addressErrors.fullName.message}</span>}
                </div>
                <div className="form-group">
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    className={addressErrors.mobileNumber ? 'input-error' : ''}
                    placeholder="10-digit Mobile Number"
                    maxLength={10}
                    {...registerAddress('mobileNumber')}
                  />
                  {addressErrors.mobileNumber && <span className="error-text">{addressErrors.mobileNumber.message}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    className={addressErrors.pincode ? 'input-error' : ''}
                    placeholder="6-digit Pincode"
                    maxLength={6}
                    {...registerAddress('pincode')}
                  />
                  {addressErrors.pincode && <span className="error-text">{addressErrors.pincode.message}</span>}
                </div>
                <div className="form-group">
                  <label>Town/City</label>
                  <input
                    type="text"
                    className={addressErrors.city ? 'input-error' : ''}
                    placeholder="City / Town"
                    maxLength={50}
                    {...registerAddress('city')}
                  />
                  {addressErrors.city && <span className="error-text">{addressErrors.city.message}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Flat, House no., Building, Company, Apartment</label>
                <input
                  type="text"
                  className={addressErrors.addressLine1 ? 'input-error' : ''}
                  placeholder="Flat / House No. / Building"
                  maxLength={150}
                  {...registerAddress('addressLine1')}
                />
                {addressErrors.addressLine1 && <span className="error-text">{addressErrors.addressLine1.message}</span>}
              </div>

              <div className="form-group">
                <label>Area, Street, Sector, Village</label>
                <input
                  type="text"
                  className={addressErrors.addressLine2 ? 'input-error' : ''}
                  placeholder="Area / Street / Sector"
                  maxLength={150}
                  {...registerAddress('addressLine2')}
                />
                {addressErrors.addressLine2 && <span className="error-text">{addressErrors.addressLine2.message}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Landmark (Optional)</label>
                  <input
                    type="text"
                    className={addressErrors.landmark ? 'input-error' : ''}
                    placeholder="E.g. near Apollo Hospital"
                    maxLength={100}
                    {...registerAddress('landmark')}
                  />
                  {addressErrors.landmark && <span className="error-text">{addressErrors.landmark.message}</span>}
                </div>
                <div className="form-group">
                  <label>State</label>
                  <StateSelect
                    value={selectedCartState}
                    onChange={(val: string) => {
                      setAddressValue('state', val, { shouldValidate: true });
                      if (val) clearAddressErrors('state');
                    }}
                    error={Boolean(addressErrors.state)}
                    placeholder="Select State"
                  />
                  {addressErrors.state && <span className="error-text">{addressErrors.state.message}</span>}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save-address" disabled={isSavingAddress}>
                  {isSavingAddress ? 'Saving...' : 'Save and Deliver Here'}
                </button>
                <button type="button" className="btn-cancel-address" onClick={handleCancelAddress}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
