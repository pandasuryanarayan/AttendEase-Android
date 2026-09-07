// src/pages/EmployeeManagement.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EmployeeFormModal } from './EmployeeFormModal';
import { PlusIcon, MailIcon, CalendarBadgeIcon, UsersManageIcon } from '../components/Icons';

export const EmployeeManagement = () => {
  const { users, toggleEmployeeStatus, deleteEmployee } = useApp();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedDept, setAppliedDept] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const employees = users.filter((u) => u.role === 'employee');

  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    const email = emp.email.toLowerCase();
    const searchLower = appliedSearch.toLowerCase();

    const matchesSearch = searchLower
      ? fullName.includes(searchLower) || email.includes(searchLower)
      : true;
    const matchesDept = appliedDept ? emp.department === appliedDept : true;

    return matchesSearch && matchesDept;
  });

  const departments = Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setAppliedSearch(search);
    setAppliedDept(deptFilter);
  };

  const handleClear = () => {
    setSearch('');
    setDeptFilter('');
    setAppliedSearch('');
    setAppliedDept('');
  };

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmployee(emp);
    setIsModalOpen(true);
  };

  const handleDelete = (emp) => {
    if (window.confirm(`Delete ${emp.first_name} ${emp.last_name}? This cannot be undone.`)) {
      deleteEmployee(emp.id);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Employees Management</h2>
          <p className="subtitle">
            {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          <PlusIcon size={16} />
          Add Employee
        </button>
      </div>

      {/* Search & Department Filters */}
      <div className="filter-bar">
        <form onSubmit={handleFilterSubmit} className="filter-form">
          <div className="filter-group">
            <input
              type="text"
              name="search"
              placeholder="Search name or email…"
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select
              name="department"
              className="form-input"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-secondary">
            Filter
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleClear}
          >
            Clear
          </button>
        </form>
      </div>

      {/* Employee Cards Grid */}
      {filteredEmployees.length > 0 ? (
        <div className="employee-grid">
          {filteredEmployees.map((emp) => {
            const initials = `${emp.first_name ? emp.first_name[0] : ''}${
              emp.last_name ? emp.last_name[0] : ''
            }`.toUpperCase();

            return (
              <div
                key={emp.id}
                className={`employee-card ${!emp.is_active ? 'emp-inactive' : ''}`}
              >
                <div className="emp-card-header">
                  <div className="avatar-lg">{initials}</div>
                  <div
                    className={`emp-status-dot ${emp.is_active ? 'active' : 'inactive'}`}
                    title={emp.is_active ? 'Active' : 'Inactive'}
                  ></div>
                </div>

                <div className="emp-card-body">
                  <h4>
                    {emp.first_name} {emp.last_name}
                  </h4>
                  <p className="emp-position">{emp.position || 'No position set'}</p>
                  <span className="dept-badge">{emp.department || 'No Dept.'}</span>

                  <div className="emp-meta">
                    <span>
                      <MailIcon size={14} />
                      {emp.email}
                    </span>
                    {emp.hire_date && (
                      <span>
                        <CalendarBadgeIcon size={14} />
                        {new Date(emp.hire_date).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="emp-card-footer">
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleOpenEdit(emp)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${emp.is_active ? 'btn-warning' : 'btn-success'}`}
                    onClick={() => toggleEmployeeStatus(emp.id)}
                  >
                    {emp.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(emp)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state large card">
          <UsersManageIcon size={64} />
          <h3>No employees found</h3>
          <p>Try adjusting your search filters or add a new employee.</p>
          <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
            Add First Employee
          </button>
        </div>
      )}

      {/* Employee Modal */}
      <EmployeeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={editingEmployee}
      />
    </div>
  );
};
