// src/pages/EmployeeFormModal.jsx
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { EyeIcon, EyeOffIcon } from '../components/Icons';

export const EmployeeFormModal = ({ isOpen, onClose, employee }) => {
  const { addEmployee, editEmployee } = useApp();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: 'Engineering',
    position: '',
    hire_date: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        department: employee.department || 'Engineering',
        position: employee.position || '',
        hire_date: employee.hire_date || '',
        password: '',
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        department: 'Engineering',
        position: '',
        hire_date: new Date().toISOString().split('T')[0],
        password: '',
      });
    }
  }, [employee, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (employee) {
      const success = editEmployee(employee.id, formData);
      if (success) onClose();
    } else {
      const success = addEmployee(formData);
      if (success) onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? 'Edit Employee' : 'Add New Employee'}
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div className="form-section">
            <h4 className="form-section-title">Personal Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">
                  First Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="last_name">
                  Last Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="emp_email">
                  Email Address <span className="req">*</span>
                </label>
                <input
                  type="email"
                  id="emp_email"
                  name="email"
                  required
                  readOnly={!!employee}
                  value={formData.email}
                  onChange={handleChange}
                />
                {employee && <small className="help-text">Email cannot be changed.</small>}
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4 className="form-section-title">Work Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="emp_department">Department</label>
                <select
                  id="emp_department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                >
                  {[
                    'Engineering',
                    'Marketing',
                    'HR',
                    'Finance',
                    'Operations',
                    'Sales',
                    'Management',
                  ].map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="emp_position">Position</label>
                <input
                  type="text"
                  id="emp_position"
                  name="position"
                  placeholder="e.g. Senior Developer"
                  value={formData.position}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hire_date">Hire Date</label>
                <input
                  type="date"
                  id="hire_date"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4 className="form-section-title">
              {employee ? 'Change Password' : 'Set Password'}
            </h4>
            <div className="form-group">
              <label htmlFor="emp_password">
                Password {!employee && <span className="req">*</span>}
              </label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="emp_password"
                  name="password"
                  placeholder={employee ? 'Leave blank to keep current' : 'Min. 6 characters'}
                  required={!employee}
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {employee ? 'Save Changes' : 'Create Employee'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
