import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UsersTable.css';

const UsersTable = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState(''); // 'delete' or 'role'

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [usersRes, statsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users`, config),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/stats`, config)
      ]);

      setUsers(usersRes.data.users || []);
      setStats({
        total: statsRes.data.stats.totalUsers || 0,
        active: statsRes.data.stats.activeUsers || 0,
        inactive: statsRes.data.stats.inactiveUsers || 0
      });

      setLoading(false);
    } catch (err) {
      console.error('Fetch users error:', err);
      setError(err.response?.data?.message || 'Failed to fetch users');
      setLoading(false);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    }
  };

  const handleRoleChange = async (user) => {
    try {
      const token = localStorage.getItem('accessToken');
      const newRole = user.role === 'admin' ? 'user' : 'admin';

      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${user._id}/role`,
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Update local state
        setUsers(prev => prev.map(u => 
          u._id === user._id ? { ...u, role: newRole } : u
        ));
        setShowConfirmDialog(false);
        setSelectedUser(null);
      }
    } catch (err) {
      console.error('Role change error:', err);
      setError(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setUsers(prev => prev.filter(u => u._id !== userId));
        setStats(prev => ({ ...prev, total: prev.total - 1 }));
        setShowConfirmDialog(false);
        setSelectedUser(null);
      }
    } catch (err) {
      console.error('Delete user error:', err);
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const openConfirmDialog = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setShowConfirmDialog(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="users-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <div>
          <h1>👥 User Management</h1>
          <p>Manage user accounts and permissions</p>
        </div>
        <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span>❌ {error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="user-stats">
        <div className="stat-card total">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Active Users</h3>
            <p className="stat-value">{stats.active}</p>
            <span className="stat-detail">With recent orders</span>
          </div>
        </div>
        <div className="stat-card inactive">
          <div className="stat-icon">💤</div>
          <div className="stat-content">
            <h3>Inactive Users</h3>
            <p className="stat-value">{stats.inactive}</p>
            <span className="stat-detail">No recent activity</span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="user-name">{user.name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role === 'admin' ? '👑' : '👤'} {user.role}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn role"
                        onClick={() => openConfirmDialog(user, 'role')}
                        title={user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                      >
                        {user.role === 'admin' ? '👤 Demote' : '👑 Promote'}
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => openConfirmDialog(user, 'delete')}
                        title="Delete User"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowConfirmDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              {actionType === 'delete' ? '🗑️ Delete User' : '🔄 Change Role'}
            </h3>
            <p>
              {actionType === 'delete' 
                ? `Are you sure you want to delete ${selectedUser.name}? This action cannot be undone.`
                : `Are you sure you want to ${selectedUser.role === 'admin' ? 'demote' : 'promote'} ${selectedUser.name} ${selectedUser.role === 'admin' ? 'to User' : 'to Admin'}?`
              }
            </p>
            <div className="modal-actions">
              <button
                className="modal-btn cancel"
                onClick={() => {
                  setShowConfirmDialog(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </button>
              <button
                className={`modal-btn confirm ${actionType === 'delete' ? 'delete' : 'primary'}`}
                onClick={() => {
                  if (actionType === 'delete') {
                    handleDeleteUser(selectedUser._id);
                  } else {
                    handleRoleChange(selectedUser);
                  }
                }}
              >
                {actionType === 'delete' ? 'Delete' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTable;
