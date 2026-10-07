import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';

function Profile() {
  const { lang } = useLanguage();
  const [user, setUser] = React.useState(JSON.parse(localStorage.getItem('user')) || { id: 0, name: lang === 'vi' ? 'Người dùng' : 'User', email: 'guest@email.com', phone: '', avatar: '' });
  
  // Profile state
  const [name, setName] = React.useState(user.name || '');
  const [phone, setPhone] = React.useState(user.phone || '');
  const [avatar, setAvatar] = React.useState(user.avatar || '');
  const [statusMsg, setStatusMsg] = React.useState('');

  // Password state
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [pwStatusMsg, setPwStatusMsg] = React.useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user.id) return setStatusMsg(lang === 'vi' ? 'Lỗi: Bạn chưa đăng nhập' : 'Error: You are not logged in');
    
    try {
      const res = await fetch(`/identity/api/auth/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, avatar })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setStatusMsg(lang === 'vi' ? 'Cập nhật hồ sơ thành công!' : 'Profile updated successfully!');
      } else {
        const err = await res.text();
        setStatusMsg(lang === 'vi' ? `Lỗi: ${err}` : `Error: ${err}`);
      }
    } catch (error) {
      setStatusMsg(lang === 'vi' ? 'Lỗi kết nối' : 'Connection error');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!user.id) return setPwStatusMsg(lang === 'vi' ? 'Lỗi: Bạn chưa đăng nhập' : 'Error: You are not logged in');
    if (!oldPassword || !newPassword || !confirmPassword) return setPwStatusMsg(lang === 'vi' ? 'Vui lòng nhập đủ mật khẩu' : 'Please enter all password fields');
    if (newPassword !== confirmPassword) return setPwStatusMsg(lang === 'vi' ? 'Mật khẩu mới nhập lại không khớp!' : 'New passwords do not match!');

    try {
      const res = await fetch(`/identity/api/auth/password/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      if (res.ok) {
        setPwStatusMsg(lang === 'vi' ? 'Đổi mật khẩu thành công!' : 'Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const err = await res.text();
        setPwStatusMsg(lang === 'vi' ? `Lỗi: ${err}` : `Error: ${err}`);
      }
    } catch (error) {
      setPwStatusMsg(lang === 'vi' ? 'Lỗi kết nối' : 'Connection error');
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', animation: 'scaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .avatar-container {
          position: relative;
          display: inline-block;
          margin-bottom: 1.5rem;
        }
        .avatar-circle {
          border-radius: 50%;
          width: 100px;
          height: 100px;
          object-fit: cover;
          border: 1px solid var(--border-medium);
          padding: 4px;
          background-color: var(--bg-light);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          transition: var(--transition-smooth);
        }
        .avatar-container:hover .avatar-circle {
          transform: scale(1.05) rotate(5deg);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }
        .premium-sidebar-card {
          text-align: center;
          background-color: var(--bg-light);
          padding: 3rem 2rem;
          border: 1px solid var(--border-light);
          margin-bottom: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          transition: var(--transition-smooth);
          border-radius: var(--radius-sm);
        }
        .premium-sidebar-card:hover {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
        }
        .sidebar-nav-link {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 1.1rem 1.5rem;
          border-radius: var(--radius-sm);
          font-family: var(--font-sans);
          font-size: 0.825rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          transition: var(--transition-smooth);
          text-decoration: none;
          cursor: pointer;
          border: 1px solid var(--border-light);
        }
        .sidebar-nav-link.active {
          background-color: var(--secondary-color);
          color: var(--primary-color) !important;
          border-color: #111111;
          padding-left: 1.5rem;
        }
        .sidebar-nav-link.inactive {
          background-color: transparent;
          color: var(--text-muted) !important;
        }
        .sidebar-nav-link.inactive:hover {
          color: var(--primary-color) !important;
          border-color: #111111;
          transform: translateY(-1px);
        }
        .sidebar-nav-link.admin {
          color: var(--primary-color) !important;
          background-color: var(--bg-light);
        }
        .sidebar-nav-link.admin:hover {
          border-color: var(--primary-color);
          transform: translateY(-1px);
        }
        .premium-profile-card {
          background-color: var(--bg-light);
          padding: 3.5rem;
          border: 1px solid var(--border-light);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          transition: var(--transition-smooth);
          border-radius: var(--radius-sm);
        }
        .premium-profile-card:hover {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
        }
        .premium-profile-input {
          width: 100%;
          padding: 1rem 1.25rem;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          border: 1px solid var(--border-medium);
          background-color: var(--bg-light);
          color: var(--text-dark);
          transition: var(--transition-smooth);
          outline: none;
          border-radius: var(--radius-sm);
          letter-spacing: 0.02em;
        }
        .premium-profile-input:focus {
          border-color: #111111;
          box-shadow: 0 0 0 1px #111111;
        }
        .premium-profile-input::placeholder {
          color: var(--text-muted);
        }
        .premium-profile-input:disabled {
          background-color: var(--bg-light);
          color: var(--text-muted);
          cursor: not-allowed;
          opacity: 0.6;
        }
      `}</style>
      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
         {/* Sidebar Navigation */}
         <div style={{ width: '280px', flexShrink: 0 }}>
            <div className="premium-sidebar-card">
               <div className="avatar-container">
                 <img 
                   src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=000000&color=B99B6B&size=120&font-size=0.33&bold=true`} 
                   className="avatar-circle"
                   alt={user.name}
                 />
               </div>
               <h3 style={{ 
                 fontFamily: 'var(--font-display)', 
                 fontSize: '1.3rem', 
                 fontWeight: 600,
                 letterSpacing: '-0.02em',
                 margin: '0 0 0.5rem 0' 
               }}>{user.name}</h3>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', letterSpacing: '0.02em' }}>
                 {user.socialProvider ? (lang === 'vi' ? `Đăng nhập qua ${user.socialProvider}` : `Logged in via ${user.socialProvider}`) : (lang === 'vi' ? 'Thành viên' : 'Member')}
               </p>
               <button 
                 className="btn btn-outline" 
                 style={{ padding: '0.6rem 1.25rem', fontSize: '0.8rem', width: '100%', borderRadius: '8px' }} 
                 onClick={() => { localStorage.removeItem('user'); window.location.href='/login'; }}
               >
                 {lang === 'vi' ? 'Đăng xuất' : 'Logout'}
               </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               <Link to="/profile" className="sidebar-nav-link active">
                 <i className="ri-user-line" style={{ marginRight: '12px', fontSize: '1.1rem' }}></i> {lang === 'vi' ? 'Hồ Sơ Cá Nhân' : 'My Profile'}
               </Link>
               <Link to="/orders" className="sidebar-nav-link inactive">
                 <i className="ri-file-list-3-line" style={{ marginRight: '12px', fontSize: '1.1rem' }}></i> {lang === 'vi' ? 'Đơn Hàng Của Tôi' : 'My Orders'}
               </Link>
               {user.role === 'ADMIN' && (
                 <Link to="/admin" className="sidebar-nav-link admin">
                   <i className="ri-dashboard-line" style={{ marginRight: '12px', fontSize: '1.1rem' }}></i> {lang === 'vi' ? 'Trang Quản Trị' : 'Admin Panel'}
                 </Link>
               )}
            </div>
         </div>
         
         {/* Main Profile Form */}
         <div style={{ flex: 1, minWidth: '320px' }}>
            <h2 style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '2.4rem', 
              fontWeight: 600,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              marginBottom: '2rem' 
            }}>{lang === 'vi' ? 'Hồ Sơ Của Tôi' : 'My Profile'}</h2>
            
            <div className="premium-profile-card">
               
               <form onSubmit={handleUpdateProfile}>
                  {statusMsg && (
                    <div style={{ 
                      padding: '1.1rem 1.5rem', 
                      marginBottom: '2rem', 
                      backgroundColor: (statusMsg.includes('Lỗi') || statusMsg.includes('Error')) ? 'rgba(199, 74, 74, 0.05)' : 'rgba(94, 106, 210, 0.05)', 
                      color: (statusMsg.includes('Lỗi') || statusMsg.includes('Error')) ? '#c94a4a' : 'var(--primary-color)', 
                      border: (statusMsg.includes('Lỗi') || statusMsg.includes('Error')) ? '1px solid rgba(199, 74, 74, 0.2)' : '1px solid var(--border-light)',
                      borderRadius: '12px',
                      fontSize: '0.9rem',
                      letterSpacing: '0.02em'
                    }}>
                      {statusMsg}
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                     <div>
                       <label style={{ 
                         display: 'block', 
                         marginBottom: '0.65rem', 
                         fontFamily: 'var(--font-display)',
                         fontWeight: 600, 
                         textTransform: 'uppercase', 
                         fontSize: '0.75rem', 
                         letterSpacing: '0.12em', 
                         color: 'var(--text-muted)' 
                       }}>{lang === 'vi' ? 'Họ và tên' : 'Full Name'}</label>
                       <input type="text" className="premium-profile-input" value={name} onChange={e => setName(e.target.value)} required />
                     </div>
                     <div>
                       <label style={{ 
                         display: 'block', 
                         marginBottom: '0.65rem', 
                         fontFamily: 'var(--font-display)',
                         fontWeight: 600, 
                         textTransform: 'uppercase', 
                         fontSize: '0.75rem', 
                         letterSpacing: '0.12em', 
                         color: 'var(--text-muted)' 
                       }}>Email</label>
                       <input type="email" className="premium-profile-input" defaultValue={user.email} disabled />
                     </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                     <div>
                       <label style={{ 
                         display: 'block', 
                         marginBottom: '0.65rem', 
                         fontFamily: 'var(--font-display)',
                         fontWeight: 600, 
                         textTransform: 'uppercase', 
                         fontSize: '0.75rem', 
                         letterSpacing: '0.12em', 
                         color: 'var(--text-muted)' 
                       }}>{lang === 'vi' ? 'Số điện thoại' : 'Phone Number'}</label>
                       <input type="tel" className="premium-profile-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="09xxxxxxxx" />
                     </div>
                     <div>
                       <label style={{ 
                         display: 'block', 
                         marginBottom: '0.65rem', 
                         fontFamily: 'var(--font-display)',
                         fontWeight: 600, 
                         textTransform: 'uppercase', 
                         fontSize: '0.75rem', 
                         letterSpacing: '0.12em', 
                         color: 'var(--text-muted)' 
                        }}>{lang === 'vi' ? 'Ảnh đại diện hoặc Tải Lên' : 'Avatar URL or Upload'}</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input type="text" className="premium-profile-input" value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="https://..." style={{ flex: 1 }} />
                          <label className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 1.25rem', fontSize: '0.85rem', margin: 0, cursor: 'pointer', backgroundColor: '#eaeaea', border: '1px solid #d9d9d9', fontWeight: 600, color: '#333' }}>
                            Chọn File
                            <input 
                              type="file" 
                              accept="image/*" 
                              style={{ display: 'none' }} 
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const uploadData = new FormData();
                                  uploadData.append('file', file);
                                  try {
                                    const uploadRes = await fetch('/identity/api/upload', {
                                      method: 'POST',
                                      body: uploadData
                                    });
                                    if (uploadRes.ok) {
                                      const data = await uploadRes.json();
                                      setAvatar(data.imageUrl);
                                    } else {
                                      alert('Tải ảnh lên thất bại!');
                                    }
                                  } catch (err) {
                                    console.error('Lỗi tải ảnh:', err);
                                    alert('Lỗi kết nối server!');
                                  }
                                }
                              }}
                            />
                          </label>
                        </div>
                     </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ padding: '1.1rem 3.5rem', borderRadius: '8px' }}>
                    <span>{lang === 'vi' ? 'Lưu Thay Đổi' : 'Save Changes'}</span>
                  </button>
               </form>
               
               <h3 style={{ 
                 fontFamily: 'var(--font-display)',
                 fontSize: '1.6rem',
                 fontWeight: 600,
                 letterSpacing: '-0.02em',
                 textTransform: 'uppercase',
                 marginTop: '4rem', 
                 marginBottom: '2rem', 
                 paddingTop: '2.5rem', 
                 borderTop: '1px solid var(--border-light)' 
               }}>{lang === 'vi' ? 'Đổi Mật Khẩu' : 'Change Password'}</h3>
               
               {user.socialProvider ? (
                 <div style={{ 
                   padding: '1.1rem 1.5rem', 
                   backgroundColor: 'rgba(94, 106, 210, 0.06)', 
                   color: 'var(--primary-hover)', 
                   border: '1px solid rgba(94, 106, 210, 0.2)',
                   borderRadius: '12px',
                   fontSize: '0.9rem' 
                 }}>
                   {lang === 'vi' ? `Bạn đang đăng nhập bằng mạng xã hội (${user.socialProvider}), không thể thay đổi mật khẩu trực tiếp.` : `You are logged in via social login (${user.socialProvider}), cannot change password directly.`}
                 </div>
               ) : (
                 <form onSubmit={handleUpdatePassword}>
                    {pwStatusMsg && (
                      <div style={{ 
                        padding: '1.1rem 1.5rem', 
                        marginBottom: '2rem', 
                        backgroundColor: (pwStatusMsg.includes('Lỗi') || pwStatusMsg.includes('Error')) ? 'rgba(199, 74, 74, 0.05)' : 'rgba(94, 106, 210, 0.05)', 
                        color: (pwStatusMsg.includes('Lỗi') || pwStatusMsg.includes('Error')) ? '#c94a4a' : 'var(--primary-color)', 
                        border: (pwStatusMsg.includes('Lỗi') || pwStatusMsg.includes('Error')) ? '1px solid rgba(199, 74, 74, 0.2)' : '1px solid var(--border-light)',
                        borderRadius: '12px',
                        fontSize: '0.9rem'
                      }}>
                        {pwStatusMsg}
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                       <div>
                         <label style={{ 
                           display: 'block', 
                           marginBottom: '0.65rem', 
                           fontFamily: 'var(--font-display)',
                           fontWeight: 600, 
                           textTransform: 'uppercase', 
                           fontSize: '0.75rem', 
                           letterSpacing: '0.12em', 
                           color: 'var(--text-muted)' 
                         }}>{lang === 'vi' ? 'Mật khẩu hiện tại' : 'Current Password'}</label>
                         <input type="password" className="premium-profile-input" placeholder="••••••••" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
                       </div>
                       <div>
                         <label style={{ 
                           display: 'block', 
                           marginBottom: '0.65rem', 
                           fontFamily: 'var(--font-display)',
                           fontWeight: 600, 
                           textTransform: 'uppercase', 
                           fontSize: '0.75rem', 
                           letterSpacing: '0.12em', 
                           color: 'var(--text-muted)' 
                         }}>{lang === 'vi' ? 'Mật khẩu mới' : 'New Password'}</label>
                         <input type="password" className="premium-profile-input" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                       </div>
                       <div>
                         <label style={{ 
                           display: 'block', 
                           marginBottom: '0.65rem', 
                           fontFamily: 'var(--font-display)',
                           fontWeight: 600, 
                           textTransform: 'uppercase', 
                           fontSize: '0.75rem', 
                           letterSpacing: '0.12em', 
                           color: 'var(--text-muted)' 
                         }}>{lang === 'vi' ? 'Nhập lại mật khẩu mới' : 'Confirm New Password'}</label>
                         <input type="password" className="premium-profile-input" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
                       </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '1.1rem 3.5rem', borderRadius: '8px' }}>
                      <span>{lang === 'vi' ? 'Cập Nhật Mật Khẩu' : 'Update Password'}</span>
                    </button>
                 </form>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

function Orders() {
  const { lang } = useLanguage();
  const [user] = React.useState(JSON.parse(localStorage.getItem('user')) || { name: 'Người dùng', avatar: '', role: 'USER' });
  const [orders, setOrders] = React.useState([]);
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('ALL');

  const [isEditingAddress, setIsEditingAddress] = React.useState(false);
  const [editName, setEditName] = React.useState('');
  const [editPhone, setEditPhone] = React.useState('');
  const [editAddress, setEditAddress] = React.useState('');
  const [isSavingAddress, setIsSavingAddress] = React.useState(false);
  const [isCancelling, setIsCancelling] = React.useState(false);

  React.useEffect(() => {
    if (selectedOrder) {
      setEditName(selectedOrder.customerName || '');
      setEditPhone(selectedOrder.customerPhone || '');
      setEditAddress(selectedOrder.shippingAddress || '');
      setIsEditingAddress(false);
    }
  }, [selectedOrder]);

  React.useEffect(() => {
    const localOrders = JSON.parse(localStorage.getItem('myOrders') || '[]');
    if (user && user.id) {
       fetch(`/identity/api/orders/user/${user.id}`)
         .then(r => r.json())
         .then(data => {
            if(data && Array.isArray(data) && data.length > 0) {
              setOrders(data);
            } else {
              setOrders(localOrders);
            }
         }).catch(() => {
            setOrders(localOrders);
         });
    } else {
       setOrders(localOrders);
    }
  }, [user]);

  const updateLocalOrders = (updatedOrder) => {
    const localOrders = JSON.parse(localStorage.getItem('myOrders') || '[]');
    const isLocal = localOrders.some(o => o.id === updatedOrder.id);
    if (isLocal) {
      const newLocals = localOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
      localStorage.setItem('myOrders', JSON.stringify(newLocals));
    }
  };

  const handleUpdateShippingAddress = async () => {
    if (!editAddress.trim()) {
      alert(lang === 'vi' ? 'Vui lòng nhập địa chỉ giao hàng!' : 'Please enter shipping address!');
      return;
    }
    
    setIsSavingAddress(true);
    try {
      const res = await fetch(`/identity/api/orders/${selectedOrder.id}/shipping-address`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Name': encodeURIComponent(user.name || (lang === 'vi' ? 'Khách hàng' : 'Customer'))
        },
        body: JSON.stringify({
          shippingAddress: editAddress,
          customerName: editName,
          customerPhone: editPhone
        })
      });
      
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        setSelectedOrder(updatedOrder);
        updateLocalOrders(updatedOrder);
        setIsEditingAddress(false);
        alert(lang === 'vi' ? 'Cập nhật thông tin giao hàng thành công!' : 'Shipping information updated successfully!');
      } else {
        const err = await res.json();
        alert((lang === 'vi' ? 'Lỗi: ' : 'Error: ') + (err.error || (lang === 'vi' ? 'Không thể cập nhật địa chỉ.' : 'Failed to update address.')));
      }
    } catch (e) {
      console.error(e);
      alert((lang === 'vi' ? 'Lỗi kết nối mạng: ' : 'Network connection error: ') + e.message);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleCancelOrder = async () => {
    if (window.confirm(lang === 'vi' ? 'Bạn có chắc chắn muốn hủy đơn hàng này không?' : 'Are you sure you want to cancel this order?')) {
      setIsCancelling(true);
      try {
        const res = await fetch(`/identity/api/orders/${selectedOrder.id}/cancel`, {
          method: 'PUT',
          headers: {
            'X-User-Name': encodeURIComponent(user.name || (lang === 'vi' ? 'Khách hàng' : 'Customer'))
          }
        });
        
        if (res.ok) {
          const updatedOrder = await res.json();
          setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
          setSelectedOrder(updatedOrder);
          updateLocalOrders(updatedOrder);
          alert(lang === 'vi' ? 'Hủy đơn hàng thành công!' : 'Order cancelled successfully!');
        } else {
          const err = await res.json();
          alert((lang === 'vi' ? 'Lỗi: ' : 'Error: ') + (err.error || (lang === 'vi' ? 'Không thể hủy đơn hàng.' : 'Failed to cancel order.')));
        }
      } catch (e) {
        console.error(e);
        alert((lang === 'vi' ? 'Lỗi kết nối mạng: ' : 'Network connection error: ') + e.message);
      } finally {
        setIsCancelling(false);
      }
    }
  };

  const formatStatus = (status) => {
    const s = status ? status.toUpperCase() : 'PENDING';
    if (s === 'PENDING') return lang === 'vi' ? 'Chờ xử lý' : 'Pending';
    if (s === 'SHIPPING') return lang === 'vi' ? 'Đang giao' : 'Shipping';
    if (s === 'COMPLETED') return lang === 'vi' ? 'Hoàn thành' : 'Completed';
    if (s === 'CANCELLED') return lang === 'vi' ? 'Đã hủy' : 'Cancelled';
    return status;
  };

  const getStatusIcon = (status) => {
    const s = status ? status.toUpperCase() : '';
    if(s === 'COMPLETED' || s === 'HOÀN THÀNH') return <i className="ri-checkbox-circle-fill"></i>;
    if(s === 'SHIPPING' || s === 'ĐANG GIAO') return <i className="ri-truck-fill"></i>;
    if(s === 'CANCELLED' || s === 'ĐÃ HỦY') return <i className="ri-close-circle-fill"></i>;
    return <i className="ri-time-fill"></i>;
  };

  const getStatusColor = (status) => {
    const s = status ? status.toUpperCase() : '';
    if(s === 'COMPLETED' || s === 'HOÀN THÀNH') return 'var(--primary-color)';
    if(s === 'SHIPPING' || s === 'ĐANG GIAO') return 'var(--accent-gold)';
    if(s === 'CANCELLED' || s === 'ĐÃ HỦY') return '#c94a4a';
    return 'var(--text-muted)';
  };

  const getStatusBg = (status) => {
    const s = status ? status.toUpperCase() : '';
    if(s === 'COMPLETED' || s === 'HOÀN THÀNH') return 'rgba(15, 29, 17, 0.06)';
    if(s === 'SHIPPING' || s === 'ĐANG GIAO') return 'rgba(185, 155, 107, 0.08)';
    if(s === 'CANCELLED' || s === 'ĐÃ HỦY') return 'rgba(199, 74, 74, 0.06)';
    return 'rgba(0, 0, 0, 0.03)';
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'ALL') return true;
    const s = order.status ? order.status.toUpperCase() : 'PENDING';
    return s === activeTab;
  });

  return (
    <>
    <div className="container" style={{ padding: '2.5rem 1.5rem', animation: 'scaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .avatar-container {
          position: relative;
          display: inline-block;
          margin-bottom: 1.5rem;
        }
        .avatar-circle {
          border-radius: 50%;
          width: 100px;
          height: 100px;
          object-fit: cover;
          border: 1px solid var(--border-medium);
          padding: 4px;
          background-color: var(--bg-light);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          transition: var(--transition-smooth);
        }
        .avatar-container:hover .avatar-circle {
          transform: scale(1.05) rotate(5deg);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }
        .premium-sidebar-card {
          text-align: center;
          background-color: var(--bg-light);
          padding: 3rem 2rem;
          border: 1px solid var(--border-light);
          margin-bottom: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          transition: var(--transition-smooth);
          border-radius: var(--radius-sm);
        }
        .premium-sidebar-card:hover {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
        }
        .sidebar-nav-link {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 1.1rem 1.5rem;
          border-radius: var(--radius-sm);
          font-family: var(--font-sans);
          font-size: 0.825rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          transition: var(--transition-smooth);
          text-decoration: none;
          cursor: pointer;
          border: 1px solid var(--border-light);
        }
        .sidebar-nav-link.active {
          background-color: var(--secondary-color);
          color: var(--primary-color) !important;
          border-color: #111111;
          padding-left: 1.5rem;
        }
        .sidebar-nav-link.inactive {
          background-color: transparent;
          color: var(--text-muted) !important;
        }
        .sidebar-nav-link.inactive:hover {
          color: var(--primary-color) !important;
          border-color: #111111;
          transform: translateY(-1px);
        }
        .sidebar-nav-link.admin {
          color: var(--primary-color) !important;
          background-color: var(--bg-light);
        }
        .sidebar-nav-link.admin:hover {
          border-color: var(--primary-color);
          transform: translateY(-1px);
        }
        .premium-order-card {
          border: 1px solid var(--border-light);
          background-color: var(--bg-light);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          transition: var(--transition-smooth);
          border-radius: var(--radius-sm);
          margin-bottom: 2rem;
          overflow: hidden;
        }
        .premium-order-card:hover {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
        }
        .status-badge {
          font-weight: 700;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 1rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-medium);
        }
        .status-badge.pending {
          color: var(--text-muted);
          background-color: var(--bg-light);
        }
        .status-badge.shipping {
          color: var(--primary-color);
          background-color: var(--bg-light);
          border-color: var(--primary-color);
        }
        .status-badge.completed {
          color: var(--accent-secondary);
          background-color: var(--bg-light);
          border-color: var(--accent-secondary);
        }
        .status-badge.cancelled {
          color: #ff4d4f;
          background-color: var(--bg-light);
          border-color: #ff4d4f;
        }
        .premium-tab-btn {
          padding: 0.75rem 1.5rem;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border: 1px solid var(--border-medium);
          background-color: var(--bg-light);
          cursor: pointer;
          transition: var(--transition-smooth);
          position: relative;
          border-radius: var(--radius-sm);
        }
        .premium-tab-btn.active {
          color: var(--primary-color);
          border-color: var(--primary-color);
          background-color: var(--secondary-color);
        }
        .premium-tab-btn.inactive {
          color: var(--text-muted);
        }
        .premium-tab-btn.inactive:hover {
          color: var(--primary-color);
          border-color: #111111;
        }
        .glass-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(61, 72, 82, 0.4);
          backdrop-filter: blur(8px);
          z-index: 1100;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1rem;
          animation: modalFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .glass-modal-content {
          background-color: var(--bg-light) !important;
          border-radius: var(--radius-sm) !important;
          width: 640px;
          max-width: 100%;
          max-height: 85vh;
          overflow-y: auto;
          border: 1px solid var(--border-light) !important;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.15);
          position: relative;
          animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
         {/* Sidebar Navigation */}
         <div style={{ width: '280px', flexShrink: 0 }}>
            <div className="premium-sidebar-card">
               <div className="avatar-container">
                  <img 
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=000000&color=B99B6B&size=120&font-size=0.33&bold=true`} 
                    className="avatar-circle"
                    alt={user.name}
                  />
               </div>
               <h3 style={{ 
                 fontFamily: 'var(--font-display)', 
                 fontSize: '1.3rem', 
                 fontWeight: 600,
                 letterSpacing: '-0.02em',
                 margin: '0 0 0.5rem 0' 
               }}>{user.name}</h3>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', letterSpacing: '0.02em' }}>{lang === 'vi' ? 'Thành viên' : 'Member'}</p>
               <button 
                 className="btn btn-outline" 
                 style={{ padding: '0.6rem 1.25rem', fontSize: '0.8rem', width: '100%', borderRadius: '8px' }} 
                 onClick={() => { localStorage.removeItem('user'); window.location.href='/login'; }}
               >
                 {lang === 'vi' ? 'Đăng xuất' : 'Logout'}
               </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               <Link to="/profile" className="sidebar-nav-link inactive">
                 <i className="ri-user-line" style={{ marginRight: '12px', fontSize: '1.1rem' }}></i> {lang === 'vi' ? 'Hồ Sơ Cá Nhân' : 'My Profile'}
               </Link>
               <Link to="/orders" className="sidebar-nav-link active">
                 <i className="ri-file-list-3-line" style={{ marginRight: '12px', fontSize: '1.1rem' }}></i> {lang === 'vi' ? 'Đơn Hàng Của Tôi' : 'My Orders'}
               </Link>
               {user.role === 'ADMIN' && (
                 <Link to="/admin" className="sidebar-nav-link admin">
                   <i className="ri-dashboard-line" style={{ marginRight: '12px', fontSize: '1.1rem' }}></i> {lang === 'vi' ? 'Trang Quản Trị' : 'Admin Panel'}
                 </Link>
               )}
            </div>
         </div>
         
         {/* Main Orders History */}
         <div style={{ flex: 1, minWidth: '320px' }}>
            <h2 style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '2.4rem', 
              fontWeight: 600,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              marginBottom: '1rem' 
            }}>{lang === 'vi' ? 'Lịch Sử Đơn Hàng' : 'Order History'}</h2>
            
            {/* Filter Tabs */}
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              marginBottom: '2rem', 
              flexWrap: 'wrap',
              borderBottom: '1px solid var(--border-light)',
              paddingBottom: '1rem'
            }}>
               {[
                 { label: lang === 'vi' ? 'Tất cả' : 'All', id: 'ALL' },
                 { label: lang === 'vi' ? 'Chờ xử lý' : 'Pending', id: 'PENDING' },
                 { label: lang === 'vi' ? 'Đang giao' : 'Shipping', id: 'SHIPPING' },
                 { label: lang === 'vi' ? 'Hoàn thành' : 'Completed', id: 'COMPLETED' },
                 { label: lang === 'vi' ? 'Đã hủy' : 'Cancelled', id: 'CANCELLED' }
               ].map(tab => (
                 <button 
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`premium-tab-btn ${activeTab === tab.id ? 'active' : 'inactive'}`}
                 >
                   {tab.label}
                 </button>
               ))}
            </div>
            
            {/* Orders List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
               {filteredOrders.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '5rem 2rem', 
                    backgroundColor: 'var(--bg-white)', 
                    border: '1px solid var(--border-light)',
                    boxShadow: 'var(--shadow-sm)',
                    borderRadius: '16px'
                  }}>
                    <i className="ri-inbox-2-line" style={{ fontSize: '3.5rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'block' }}></i>
                    <p style={{ fontSize: '1.15rem', color: 'var(--text-dark)', marginBottom: '1.5rem', fontWeight: 500 }}>{lang === 'vi' ? 'Không tìm thấy đơn hàng phù hợp!' : 'No matching orders found!'}</p>
                    <Link to="/products" className="btn btn-primary" style={{ padding: '1rem 2.5rem', borderRadius: '8px' }}>{lang === 'vi' ? 'Mua sắm ngay' : 'Shop now'}</Link>
                  </div>
               ) : (
                  filteredOrders.map((order, idx) => (
                    <div 
                      key={idx} 
                      className="premium-order-card"
                    >
                      {/* Order Item Header */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '1.25rem 2rem', 
                        backgroundColor: 'var(--bg-light)', 
                        borderBottom: '1px solid var(--border-light)',
                        flexWrap: 'wrap',
                        gap: '1rem'
                      }}>
                          <div>
                            <span style={{ 
                              fontFamily: 'var(--font-display)', 
                              fontWeight: 600, 
                              color: 'var(--primary-color)',
                              fontSize: '1rem',
                              letterSpacing: '0.02em'
                            }}>{lang === 'vi' ? `ĐƠN HÀNG #${order.orderCode || order.id}` : `ORDER #${order.orderCode || order.id}`}</span>
                            <span style={{ margin: '0 0.75rem', color: 'var(--text-muted)' }}>|</span>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                              {lang === 'vi' ? 'Ngày đặt: ' : 'Order date: '}{order.date || new Date(order.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          
                          <div className={`status-badge ${
                            (() => {
                              const s = order.status ? order.status.toUpperCase() : 'PENDING';
                              if (s === 'COMPLETED' || s === 'HOÀN THÀNH') return 'completed';
                              if (s === 'SHIPPING' || s === 'ĐANG GIAO') return 'shipping';
                              if (s === 'CANCELLED' || s === 'ĐÃ HỦY') return 'cancelled';
                              return 'pending';
                            })()
                          }`}>
                            {getStatusIcon(order.status)} 
                            {formatStatus(order.status)}
                          </div>
                      </div>

                      {/* Order Item Body */}
                      <div style={{ padding: '2rem' }}>
                          {order.items && order.items.map((item, idxx) => (
                            <div 
                              key={idxx} 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '1.5rem', 
                                paddingBottom: '1.25rem', 
                                borderBottom: idxx === order.items.length - 1 ? 'none' : '1px solid var(--border-light)', 
                                marginBottom: idxx === order.items.length - 1 ? '0' : '1.25rem' 
                              }}
                            >
                              <img 
                                src={(() => {
                                  if (item.product && item.product.images && item.product.images.length > 0) {
                                    if (item.color) {
                                      const matchedImg = item.product.images.find(img => img.color === item.color);
                                      if (matchedImg) return matchedImg.imageUrl;
                                    }
                                    const mainImg = item.product.images.find(img => img.isMain);
                                    return mainImg ? mainImg.imageUrl : item.product.images[0].imageUrl;
                                  }
                                  return item.productImage || item.image;
                                })()} 
                                style={{ width: '80px', height: '100px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-light)' }} 
                                alt={item.product?.name || item.productName || item.name}
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.25rem' }}>
                                  {item.product?.name || item.productName || item.name}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                  <span>Màu: <strong style={{ color: 'var(--text-dark)' }}>{item.color || 'Mặc định'}</strong></span>
                                  <span>Size: <strong style={{ color: 'var(--text-dark)' }}>{item.product?.size || item.productSize || item.size || 'M'}</strong></span>
                                  <span>Số lượng: <strong style={{ color: 'var(--text-dark)' }}>{item.quantity}</strong></span>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right', fontWeight: 600, fontSize: '1.05rem', color: 'var(--primary-color)' }}>
                                {new Intl.NumberFormat('vi-VN').format(item.price || item.unitPrice || item.rawPrice) + ' VND'}
                              </div>
                            </div>
                          ))}
                          
                          {/* Order Footer summary */}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            paddingTop: '1.5rem',
                            borderTop: '1px solid var(--border-light)',
                            marginTop: '1.5rem',
                            flexWrap: 'wrap',
                            gap: '1.5rem'
                          }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                              Cước vận chuyển: {new Intl.NumberFormat('vi-VN').format(order.shippingFee || 0) + ' VND'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                              <div style={{ fontSize: '1.05rem' }}>
                                Tổng thanh toán: <span style={{ 
                                  color: 'var(--accent-gold)', 
                                  fontSize: '1.6rem', 
                                  fontWeight: 700,
                                  fontFamily: 'var(--font-display)',
                                  marginLeft: '0.5rem'
                                }}>{new Intl.NumberFormat('vi-VN').format(order.totalAmount || order.total) + ' VND'}</span>
                              </div>
                              <button 
                                className="btn btn-outline" 
                                style={{ padding: '0.65rem 1.5rem', fontSize: '0.85rem' }} 
                                onClick={() => setSelectedOrder(order)}
                              >
                                Chi tiết
                              </button>
                            </div>
                          </div>
                      </div>
                    </div>
                  ))
               )}
            </div>
         </div>
      </div>
    </div>
    
    {/* Elegant Sharp Edge Modal Detail */}
    {selectedOrder && (
      <div className="glass-modal-backdrop" onClick={() => setSelectedOrder(null)}>
        <div className="glass-modal-content" onClick={e => e.stopPropagation()}>
           {/* Modal Header */}
           <div style={{ 
             display: 'flex', 
             justifyContent: 'space-between', 
             alignItems: 'center', 
             padding: '1.5rem 2.5rem', 
             borderBottom: '1px solid var(--border-light)', 
             position: 'sticky', 
             top: 0, 
             backgroundColor: 'var(--bg-white)', 
             zIndex: 2 
           }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '1.35rem', 
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '-0.02em' 
              }}>Đơn hàng #{selectedOrder.orderCode || selectedOrder.id}</h3>
              <button 
                onClick={() => setSelectedOrder(null)} 
                style={{ 
                  border: 'none', 
                  background: 'none', 
                  fontSize: '1.75rem', 
                  cursor: 'pointer', 
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                &times;
              </button>
           </div>
           
           {/* Modal Body */}
           <div style={{ padding: '2.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                 <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Ngày đặt hàng</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{selectedOrder.date || new Date(selectedOrder.createdAt || Date.now()).toLocaleString('vi-VN')}</div>
                 </div>
                 <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Trạng thái</div>
                    <div style={{ fontWeight: 600, color: getStatusColor(selectedOrder.status) }}>{getStatusIcon(selectedOrder.status)} {formatStatus(selectedOrder.status)}</div>
                 </div>
                 <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Phương thức</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{selectedOrder.paymentMethod || 'Thanh toán trực tuyến'}</div>
                 </div>
                 <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Mã vận đơn GHN</div>
                    <div style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>{selectedOrder.ghnOrderCode || 'Đang cập nhật'}</div>
                 </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <h4 style={{ 
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  margin: 0
                }}>Thông tin giao hàng</h4>
                {selectedOrder?.status?.toUpperCase() === 'PENDING' && (
                  <button 
                    onClick={() => setIsEditingAddress(!isEditingAddress)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-color)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <i className="ri-edit-line"></i> {isEditingAddress ? 'Hủy chỉnh sửa' : 'Chỉnh sửa'}
                  </button>
                )}
              </div>
              
              {isEditingAddress ? (
                <div className="shadow-inset-small" style={{ 
                  marginBottom: '2.5rem', 
                  backgroundColor: 'var(--bg-light)', 
                  padding: '1.25rem 1.5rem', 
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Tên người nhận</label>
                      <input 
                        type="text" 
                        value={editName} 
                        onChange={e => setEditName(e.target.value)} 
                        style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-medium)', background: 'var(--bg-white)', fontSize: '0.85rem' }} 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Số điện thoại</label>
                      <input 
                        type="text" 
                        value={editPhone} 
                        onChange={e => setEditPhone(e.target.value)} 
                        style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-medium)', background: 'var(--bg-white)', fontSize: '0.85rem' }} 
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Địa chỉ nhận hàng</label>
                    <textarea 
                      value={editAddress} 
                      onChange={e => setEditAddress(e.target.value)} 
                      rows="2" 
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-medium)', background: 'var(--bg-white)', fontSize: '0.85rem', resize: 'vertical' }} 
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button 
                      className="btn btn-outline" 
                      onClick={() => setIsEditingAddress(false)}
                      style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}
                    >
                      Hủy
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={handleUpdateShippingAddress}
                      style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}
                      disabled={isSavingAddress}
                    >
                      {isSavingAddress ? 'Đang lưu...' : 'Lưu'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="shadow-inset-small" style={{ 
                  marginBottom: '2.5rem', 
                  backgroundColor: 'var(--bg-light)', 
                  padding: '1.25rem 1.5rem', 
                  borderRadius: '16px'
                }}>
                   <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary-color)' }}>{selectedOrder.customerName || 'Khách vãng lai'} - {selectedOrder.customerPhone || 'Không có SĐT'}</div>
                   <div style={{ color: 'var(--text-dark)', fontSize: '0.9rem', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                      <i className="ri-map-pin-line" style={{ color: 'var(--primary-color)', fontSize: '1.05rem', position: 'relative', top: '1.5px' }}></i> 
                      {selectedOrder.shippingAddress || 'Không có thông tin địa chỉ'}
                   </div>
                </div>
              )}
              
              <h4 style={{ 
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.05em',
                marginBottom: '1.25rem', 
                borderBottom: '1px solid var(--border-light)', 
                paddingBottom: '0.5rem' 
              }}>Sản phẩm ({selectedOrder.items?.length || 0})</h4>
              <div style={{ marginBottom: '2.5rem' }}>
                 {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1.25rem', 
                        marginBottom: '1.25rem', 
                        paddingBottom: '1.25rem', 
                        borderBottom: '1px solid var(--border-light)' 
                      }}
                    >
                       <img 
                         src={(() => {
                            if (item.product && item.product.images && item.product.images.length > 0) {
                              if (item.color) {
                                const matchedImg = item.product.images.find(img => img.color === item.color);
                                if (matchedImg) return matchedImg.imageUrl;
                              }
                              const mainImg = item.product.images.find(img => img.isMain);
                              return mainImg ? mainImg.imageUrl : item.product.images[0].imageUrl;
                            }
                            return item.productImage || item.image;
                         })()} 
                         style={{ width: '60px', height: '75px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-light)' }} 
                         alt={item.product?.name || item.productName}
                       />
                       <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-dark)' }}>{item.product?.name || item.productName || item.name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Màu: {item.color || 'Mặc định'} | Size: {item.product?.size || item.productSize || item.size || 'M'}</div>
                       </div>
                       <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{new Intl.NumberFormat('vi-VN').format(item.price || item.unitPrice || item.rawPrice) + ' VND'}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>SL: {item.quantity}</div>
                       </div>
                    </div>
                 ))}
              </div>
              
              <h4 style={{ 
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.05em',
                marginBottom: '1.25rem', 
                borderBottom: '1px solid var(--border-light)', 
                paddingBottom: '0.5rem' 
              }}>Thanh toán</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.95rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tạm tính</span>
                    <span style={{ color: 'var(--text-dark)' }}>{new Intl.NumberFormat('vi-VN').format((selectedOrder.totalAmount || selectedOrder.total) - (selectedOrder.shippingFee || 0)) + ' VND'}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Phí vận chuyển</span>
                    <span style={{ color: 'var(--text-dark)' }}>{new Intl.NumberFormat('vi-VN').format(selectedOrder.shippingFee || 0) + ' VND'}</span>
                 </div>
                 <div style={{ 
                   display: 'flex', 
                   justifyContent: 'space-between', 
                   marginTop: '0.75rem', 
                   paddingTop: '0.75rem', 
                   borderTop: '1px solid var(--border-light)', 
                   fontWeight: 700, 
                   fontSize: '1.25rem',
                   fontFamily: 'var(--font-display)' 
                 }}>
                    <span>Tổng cộng</span>
                    <span style={{ color: 'var(--accent-gold)' }}>{new Intl.NumberFormat('vi-VN').format(selectedOrder.totalAmount || selectedOrder.total) + ' VND'}</span>
                 </div>
              </div>
           </div>
           
           {/* Modal Footer */}
           <div style={{ 
             padding: '1.5rem 2.5rem', 
             borderTop: '1px solid var(--border-light)', 
             backgroundColor: 'var(--bg-light)', 
             display: 'flex', 
             justifyContent: (selectedOrder?.status?.toUpperCase() === 'PENDING') ? 'space-between' : 'flex-end',
             alignItems: 'center'
           }}>
              {selectedOrder?.status?.toUpperCase() === 'PENDING' && (
                <button 
                  className="btn" 
                  onClick={handleCancelOrder} 
                  style={{ 
                    padding: '0.8rem 1.5rem', 
                    color: '#c94a4a', 
                    borderRadius: '8px', 
                    border: '1px solid rgba(199, 74, 74, 0.3)', 
                    backgroundColor: 'rgba(199, 74, 74, 0.05)', 
                    cursor: 'pointer', 
                    fontWeight: 600, 
                    fontSize: '0.85rem', 
                    transition: 'all 0.2s ease'
                  }}
                  disabled={isCancelling}
                >
                  {isCancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
                </button>
              )}
              <button className="btn btn-primary" onClick={() => setSelectedOrder(null)} style={{ padding: '0.8rem 2rem' }}>Đóng</button>
           </div>
        </div>
      </div>
    )}
    </>
  );
}

const UserPages = { Profile, Orders };
export default UserPages;
