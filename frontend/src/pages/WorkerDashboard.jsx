import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const WorkerDashboard = () => {
    const { user, logout } = useAuth();
    const [dealers, setDealers] = useState([]);
    const [diamondTypes, setDiamondTypes] = useState([]);
    const [earnings, setEarnings] = useState([]);
    const [advances, setAdvances] = useState([]);
    const [employeeOfWeek, setEmployeeOfWeek] = useState(null);
    const [loading, setLoading] = useState(true);

    // Work request form
    const [formData, setFormData] = useState({
        dealer: '',
        diamondType: '',
        diamondCount: ''
    });

    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [dealersRes, typesRes, earningsRes, advancesRes, employeeRes] = await Promise.all([
                api.get('/worker/dealers'),
                api.get('/worker/diamond-types'),
                api.get('/worker/earnings'),
                api.get('/worker/advances'),
                api.get('/worker/employee-of-week')
            ]);

            setDealers(dealersRes.data.dealers);
            setDiamondTypes(typesRes.data.diamondTypes);
            setEarnings(earningsRes.data.earnings);
            setAdvances(advancesRes.data.advances);
            setEmployeeOfWeek(employeeRes.data.employeeOfWeek);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            await api.post('/worker/work-request', formData);
            setMessage({ type: 'success', text: 'Work request submitted successfully!' });
            setFormData({ dealer: '', diamondType: '', diamondCount: '' });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to submit request'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const downloadReport = async () => {
        try {
            const response = await api.get('/worker/report', {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `worker-report-${Date.now()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Failed to download report');
        }
    };

    const totalEarnings = earnings.reduce((sum, e) => sum + (e.totalEarning || 0), 0);
    const totalAdvances = advances.reduce((sum, a) => sum + a.amount, 0);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="header">
                <div className="header-content">
                    <h1>Worker Dashboard</h1>
                    <div className="user-info">
                        <span className="user-name">👋 {user.name}</span>
                        <button onClick={logout} className="btn btn-secondary">Logout</button>
                    </div>
                </div>
            </div>

            <div className="container">
                {/* Employee of the Week Banner */}
                {employeeOfWeek && (
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '20px 24px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        textAlign: 'center',
                        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                        animation: 'fadeIn 0.5s ease'
                    }}>
                        <div style={{ fontSize: '36px', marginBottom: '8px' }}>🏆</div>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
                            Employee of the Week
                        </h3>
                        <p style={{ fontSize: '16px', fontWeight: '600', opacity: 0.95 }}>
                            {employeeOfWeek.name}
                        </p>
                        {user.email === employeeOfWeek.email && (
                            <p style={{ fontSize: '14px', opacity: 0.9, marginTop: '8px' }}>
                                🎉 Congratulations! Keep up the great work!
                            </p>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-3" style={{ marginBottom: '24px' }}>
                    <div className="stat-card">
                        <div className="stat-value">₹{totalEarnings.toLocaleString()}</div>
                        <div className="stat-label">Total Earnings</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">₹{totalAdvances.toLocaleString()}</div>
                        <div className="stat-label">Total Advances</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">₹{(totalEarnings - totalAdvances).toLocaleString()}</div>
                        <div className="stat-label">Net Amount</div>
                    </div>
                </div>

                <div className="grid grid-2">
                    {/* Work Request Form */}
                    <div className="card">
                        <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>
                            Submit Work Request
                        </h2>

                        {message.text && (
                            <div style={{
                                padding: '12px',
                                background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
                                color: message.type === 'success' ? '#065f46' : '#991b1b',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                fontSize: '14px'
                            }}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Dealer</label>
                                <select
                                    className="form-select"
                                    value={formData.dealer}
                                    onChange={(e) => setFormData({ ...formData, dealer: e.target.value })}
                                    required
                                >
                                    <option value="">Select Dealer</option>
                                    {dealers.map(dealer => (
                                        <option key={dealer._id} value={dealer._id}>{dealer.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Diamond Type</label>
                                <select
                                    className="form-select"
                                    value={formData.diamondType}
                                    onChange={(e) => setFormData({ ...formData, diamondType: e.target.value })}
                                    required
                                >
                                    <option value="">Select Diamond Type</option>
                                    {diamondTypes.map(type => (
                                        <option key={type._id} value={type._id}>{type.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Diamond Count</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.diamondCount}
                                    onChange={(e) => setFormData({ ...formData, diamondCount: e.target.value })}
                                    placeholder="Enter count"
                                    min="1"
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </form>
                    </div>

                    {/* Advances */}
                    <div className="card">
                        <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>
                            Advances Received
                        </h2>
                        {advances.length === 0 ? (
                            <p style={{ color: 'var(--text-light)' }}>No advances received yet.</p>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Amount</th>
                                            <th>Given By</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {advances.map(advance => (
                                            <tr key={advance._id}>
                                                <td>{new Date(advance.date).toLocaleDateString()}</td>
                                                <td>₹{advance.amount.toLocaleString()}</td>
                                                <td>{advance.manager?.name || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Earnings */}
                <div className="card" style={{ marginTop: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600' }}>My Earnings</h2>
                        <button onClick={downloadReport} className="btn btn-success">
                            📥 Download Report
                        </button>
                    </div>

                    {earnings.length === 0 ? (
                        <p style={{ color: 'var(--text-light)' }}>No earnings yet. Submit work requests to start earning!</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Dealer</th>
                                        <th>Diamond Type</th>
                                        <th>Count</th>
                                        <th>Price/Diamond</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {earnings.map(earning => (
                                        <tr key={earning._id}>
                                            <td>{new Date(earning.approvalDate).toLocaleDateString()}</td>
                                            <td>{earning.dealer?.name || 'N/A'}</td>
                                            <td>{earning.diamondType?.name || 'N/A'}</td>
                                            <td>{earning.diamondCount}</td>
                                            <td>₹{earning.assignedPrice}</td>
                                            <td style={{ fontWeight: '600' }}>₹{earning.totalEarning.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkerDashboard;
