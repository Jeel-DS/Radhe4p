import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import InvoiceTemplate from '../components/InvoiceTemplate';
import WorkerReportTemplate from '../components/WorkerReportTemplate';

const ManagerDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('approvals');
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Data states
    const [pendingRequests, setPendingRequests] = useState([]);
    const [dealers, setDealers] = useState([]);
    const [diamondTypes, setDiamondTypes] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [analytics, setAnalytics] = useState({});
    const [employeeOfWeek, setEmployeeOfWeek] = useState(null);
    const [advancesHistory, setAdvancesHistory] = useState([]);
    const [dealerTransactions, setDealerTransactions] = useState([]);
    const [profitData, setProfitData] = useState(null);

    // Form states
    const [dealerForm, setDealerForm] = useState({ name: '', contactInfo: '' });
    const [typeForm, setTypeForm] = useState({ name: '', description: '' });
    const [advanceForm, setAdvanceForm] = useState({ worker: '', amount: '', notes: '' });
    const [workerForm, setWorkerForm] = useState({ name: '', email: '', password: '' });
    const [transactionForm, setTransactionForm] = useState({ dealer: '', diamondType: '', count: '', pricePerDiamond: '', date: '' });
    const [message, setMessage] = useState({ type: '', text: '' });

    // PDF specific states
    const [selectedDealerForInvoice, setSelectedDealerForInvoice] = useState('');
    const [invoiceData, setInvoiceData] = useState(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const invoiceRef = useRef(null);

    // Worker Report PDF states
    const [selectedWorkerForReport, setSelectedWorkerForReport] = useState('');
    const [workerReportData, setWorkerReportData] = useState(null);
    const [isGeneratingWorkerReport, setIsGeneratingWorkerReport] = useState(false);
    const workerReportRef = useRef(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [requestsRes, dealersRes, typesRes, workersRes, analyticsRes, advancesRes, transactionsRes, profitRes] = await Promise.all([
                api.get('/manager/pending-requests'),
                api.get('/manager/dealers'),
                api.get('/manager/diamond-types'),
                api.get('/manager/workers'),
                api.get('/manager/analytics'),
                api.get('/manager/advances'),
                api.get('/manager/dealer-transactions'),
                api.get('/manager/profit')
            ]);

            setPendingRequests(requestsRes.data.requests);
            setDealers(dealersRes.data.dealers);
            setDiamondTypes(typesRes.data.diamondTypes);
            setWorkers(workersRes.data.workers);
            setAnalytics(analyticsRes.data.analytics);
            setAdvancesHistory(advancesRes.data.advances);
            setDealerTransactions(transactionsRes.data.transactions);
            setProfitData(profitRes.data.profit);

            const currentEmployee = workersRes.data.workers.find(w => w.isEmployeeOfWeek);
            setEmployeeOfWeek(currentEmployee || null);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const setEmployeeOfTheWeek = async (workerId) => {
        try {
            const response = await api.post('/manager/employee-of-week', { workerId });
            showMessage('success', response.data.message);
            fetchAllData();
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to set employee of the week');
        }
    };

    const removeEmployeeOfWeek = async (workerId) => {
        try {
            const response = await api.delete(`/manager/employee-of-week/${workerId}`);
            showMessage('success', response.data.message);
            fetchAllData();
        } catch (error) {
            showMessage('error', 'Failed to remove employee of the week status');
        }
    };

    const approveRequest = async (id) => {
        const price = prompt('Enter price per diamond:');
        if (!price || isNaN(price)) return;

        try {
            await api.put(`/manager/approve-request/${id}`, {
                status: 'approved',
                assignedPrice: parseFloat(price)
            });
            showMessage('success', 'Request approved successfully!');
            fetchAllData();
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to approve request');
        }
    };

    const rejectRequest = async (id) => {
        if (!confirm('Are you sure you want to reject this request?')) return;

        try {
            await api.put(`/manager/approve-request/${id}`, { status: 'rejected' });
            showMessage('success', 'Request rejected');
            fetchAllData();
        } catch (error) {
            showMessage('error', 'Failed to reject request');
        }
    };

    const createDealer = async (e) => {
        e.preventDefault();
        try {
            await api.post('/manager/dealers', dealerForm);
            showMessage('success', 'Dealer created successfully!');
            setDealerForm({ name: '', contactInfo: '' });
            fetchAllData();
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to create dealer');
        }
    };

    const toggleDealer = async (id, currentStatus) => {
        try {
            await api.put(`/manager/dealers/${id}`, { active: !currentStatus });
            fetchAllData();
        } catch (error) {
            showMessage('error', 'Failed to update dealer');
        }
    };

    const createDiamondType = async (e) => {
        e.preventDefault();
        try {
            await api.post('/manager/diamond-types', typeForm);
            showMessage('success', 'Diamond type created successfully!');
            setTypeForm({ name: '', description: '' });
            fetchAllData();
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to create diamond type');
        }
    };

    const giveAdvance = async (e) => {
        e.preventDefault();
        try {
            await api.post('/manager/advances', advanceForm);
            showMessage('success', 'Advance given successfully!');
            setAdvanceForm({ worker: '', amount: '', notes: '' });
            fetchAllData();
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to give advance');
        }
    };

    const createWorker = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { ...workerForm, role: 'worker' });
            showMessage('success', 'Worker created successfully!');
            setWorkerForm({ name: '', email: '', password: '' });
            fetchAllData();
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to create worker');
        }
    };

    const createTransaction = async (e) => {
        e.preventDefault();
        try {
            await api.post('/manager/dealer-transactions', transactionForm);
            showMessage('success', 'Transaction recorded successfully!');
            setTransactionForm({ dealer: '', diamondType: '', count: '', pricePerDiamond: '', date: '' });
            fetchAllData();
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Failed to record transaction');
        }
    };

    const generateDealerInvoicePDF = async () => {
        if (!selectedDealerForInvoice) {
            showMessage('error', 'Please select a dealer to generate invoice');
            return;
        }

        const dealer = dealers.find(d => d._id === selectedDealerForInvoice);
        if (!dealer) return;

        const dealerTxns = dealerTransactions.filter(t => t.dealer?._id === selectedDealerForInvoice);
        if (dealerTxns.length === 0) {
            showMessage('error', 'No transactions found for this dealer');
            return;
        }

        let subtotal = 0;
        const formattedTxns = dealerTxns.map(t => {
            const amount = t.count * t.pricePerDiamond;
            subtotal += amount;
            return {
                id: t._id,
                type: t.diamondType?.name || 'N/A',
                count: t.count,
                price: t.pricePerDiamond,
                amount: amount,
                date: new Date(t.date).toLocaleDateString()
            };
        });

        const netAmount = subtotal;

        const data = {
            dealerName: dealer.name,
            transactions: formattedTxns,
            subtotal,
            netAmount
        };

        setInvoiceData(data);
        setIsGeneratingPDF(true);

        setTimeout(async () => {
            if (invoiceRef.current) {
                try {
                    const canvas = await html2canvas(invoiceRef.current, {
                        scale: 2,
                        useCORS: true,
                        logging: false
                    });

                    const imgData = canvas.toDataURL('image/png');

                    // Calculate PDF dimensions based on content
                    const pdfWidth = 210;
                    const imgWidth = canvas.width;
                    const imgHeight = canvas.height;
                    const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

                    const pdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

                    const safeName = dealer.name.replace(/\s+/g, '_');
                    pdf.save(`Invoice_${safeName}.pdf`);

                    showMessage('success', 'Invoice PDF generated successfully!');
                } catch (error) {
                    console.error("Error generating PDF:", error);
                    showMessage('error', 'Failed to generate PDF');
                } finally {
                    setIsGeneratingPDF(false);
                }
            }
        }, 500); // Wait for React to render the template
    };

    const generateWorkerReportPDF = async () => {
        if (!selectedWorkerForReport) {
            showMessage('error', 'Please select a worker to generate report');
            return;
        }

        const worker = workers.find(w => w._id === selectedWorkerForReport);
        if (!worker) return;

        try {
            setIsGeneratingWorkerReport(true);
            const response = await api.get(`/manager/worker-report/${worker._id}`);
            const data = response.data;

            let totalIncome = 0;
            let totalDiamonds = 0;
            const formattedWorkLogs = data.workLogs.map(log => {
                const income = log.diamonds * log.price;
                totalIncome += income;
                totalDiamonds += log.diamonds;
                return {
                    id: log._id,
                    date: new Date(log.date).toLocaleDateString(),
                    diamonds: log.diamonds,
                    price: log.price,
                    dealer: log.dealerName,
                    income: income
                };
            });

            let totalAdvance = 0;
            const formattedAdvances = data.advances.map(adv => {
                totalAdvance += adv.amount;
                return {
                    id: adv._id,
                    date: new Date(adv.date).toLocaleDateString(),
                    remark: adv.notes,
                    amount: adv.amount
                };
            });

            const netPayable = totalIncome - totalAdvance;

            setWorkerReportData({
                workerName: worker.name,
                reportNumber: `RPT-${Math.floor(Math.random() * 100000)}`,
                date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                workLogs: formattedWorkLogs,
                advances: formattedAdvances,
                totalDiamonds,
                totalIncome,
                totalAdvance,
                netPayable
            });

            setTimeout(async () => {
                if (workerReportRef.current) {
                    try {
                        const canvas = await html2canvas(workerReportRef.current, {
                            scale: 2,
                            useCORS: true,
                            logging: false
                        });

                        const imgData = canvas.toDataURL('image/png');

                        // Calculate PDF dimensions based on content
                        const pdfWidth = 210;
                        const imgWidth = canvas.width;
                        const imgHeight = canvas.height;
                        const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

                        const pdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);
                        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

                        const safeName = worker.name.replace(/\s+/g, '_');
                        pdf.save(`WorkerReport_${safeName}.pdf`);

                        showMessage('success', 'Worker Report PDF generated successfully!');
                    } catch (error) {
                        console.error("Error generating PDF:", error);
                        showMessage('error', 'Failed to generate worker report');
                    } finally {
                        setIsGeneratingWorkerReport(false);
                    }
                }
            }, 500);

        } catch (error) {
            console.error('Error fetching worker report:', error);
            showMessage('error', 'Failed to generate worker report. Ensure API endpoint exists.');
            setIsGeneratingWorkerReport(false);
        }
    };


    // ... (existing code)

    const downloadAdvancesPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(102, 126, 234);
        doc.text('Radhe 4P Diamond Management System', 105, 15, { align: 'center' });

        doc.setFontSize(14);
        doc.setTextColor(51, 51, 51);
        doc.text('Advance History Report', 105, 25, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100);
        const dateStr = new Date().toLocaleString();
        doc.text(`Generated on: ${dateStr}`, 105, 32, { align: 'center' });

        const tableColumn = ["Worker Name", "Email", "Amount", "Date", "Notes"];
        const tableRows = advancesHistory.map(advance => [
            advance.worker?.name || 'N/A',
            advance.worker?.email || 'N/A',
            `Rs. ${advance.amount.toLocaleString()}`,
            new Date(advance.date).toLocaleDateString(),
            advance.notes || '-'
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'striped',
            headStyles: { fillColor: [102, 126, 234] },
            alternateRowStyles: { fillColor: [245, 247, 255] }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        }

        doc.save(`advances-report-${Date.now()}.pdf`);
    };

    const downloadAdvancesExcel = () => {
        const data = advancesHistory.map(advance => ({
            "Worker Name": advance.worker?.name || 'N/A',
            "Email": advance.worker?.email || 'N/A',
            "Amount": advance.amount,
            "Date": new Date(advance.date).toLocaleDateString(),
            "Notes": advance.notes || '-'
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Advances");
        XLSX.writeFile(wb, `advances-report-${Date.now()}.xlsx`);
    };

    const downloadTransactionsPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(102, 126, 234);
        doc.text('Radhe 4P Diamond Management System', 105, 15, { align: 'center' });

        doc.setFontSize(14);
        doc.setTextColor(51, 51, 51);
        doc.text('Dealer Transaction History', 105, 25, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100);
        const dateStr = new Date().toLocaleString();
        doc.text(`Generated on: ${dateStr}`, 105, 32, { align: 'center' });

        const tableColumn = ["Dealer", "Type", "Count", "Price", "Total", "Date"];
        const tableRows = dealerTransactions.map(t => [
            t.dealer?.name || 'N/A',
            t.diamondType?.name || 'N/A',
            t.count,
            `Rs. ${t.pricePerDiamond}`,
            `Rs. ${(t.totalAmount || 0).toLocaleString()}`,
            new Date(t.date).toLocaleDateString()
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'striped',
            headStyles: { fillColor: [102, 126, 234] },
            alternateRowStyles: { fillColor: [245, 247, 255] }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        }

        doc.save(`transactions-report-${Date.now()}.pdf`);
    };

    const downloadTransactionsExcel = () => {
        const data = dealerTransactions.map(t => ({
            "Dealer": t.dealer?.name || 'N/A',
            "Type": t.diamondType?.name || 'N/A',
            "Count": t.count,
            "Price": t.pricePerDiamond,
            "Total": t.totalAmount || 0,
            "Date": new Date(t.date).toLocaleDateString()
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Transactions");
        XLSX.writeFile(wb, `transactions-report-${Date.now()}.xlsx`);
    };

    const downloadProfitPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(102, 126, 234);
        doc.text('Radhe 4P Diamond Management System', 105, 15, { align: 'center' });

        doc.setFontSize(14);
        doc.setTextColor(51, 51, 51);
        doc.text('Profit Overview Report', 105, 25, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(100);
        const dateStr = new Date().toLocaleString();
        doc.text(`Generated on: ${dateStr}`, 105, 32, { align: 'center' });

        // Financial Summary Table
        const tableColumn = ["Metric", "Amount"];
        const tableRows = [
            ["Total Revenue (From Dealers)", `Rs. ${(profitData?.totalRevenue || 0).toLocaleString()}`],
            ["Total Labor Cost (To Workers)", `Rs. ${(profitData?.totalLaborCost || 0).toLocaleString()}`],
            ["Net Profit", `Rs. ${(profitData?.netProfit || 0).toLocaleString()}`]
        ];

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [40, 40, 40] },
            columnStyles: {
                0: { fontStyle: 'bold' },
                1: { title: 'Amount', halign: 'right' }
            },
            didParseCell: function (data) {
                if (data.row.index === 2 && data.section === 'body') {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.textColor = (profitData?.netProfit || 0) >= 0 ? [0, 128, 0] : [255, 0, 0];
                }
            }
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Confidential Financial Report', 105, 290, { align: 'center' });

        doc.save(`profit-report-${Date.now()}.pdf`);
    };

    const downloadProfitExcel = () => {
        const data = [{
            "Total Revenue": profitData?.totalRevenue || 0,
            "Total Labor Cost": profitData?.totalLaborCost || 0,
            "Net Profit": profitData?.netProfit || 0
        }];

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Profit");
        XLSX.writeFile(wb, `profit-report-${Date.now()}.xlsx`);
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h1>Radhe 4P</h1>
                </div>
                <div className="sidebar-nav">
                    <div className={`nav-item ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => { setActiveTab('approvals'); setIsSidebarOpen(false); }}>
                        <span>📋 Approvals ({pendingRequests.length})</span>
                    </div>
                    <div className={`nav-item ${activeTab === 'dealers' ? 'active' : ''}`} onClick={() => { setActiveTab('dealers'); setIsSidebarOpen(false); }}>
                        <span>🤝 Dealers</span>
                    </div>
                    <div className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => { setActiveTab('transactions'); setIsSidebarOpen(false); }}>
                        <span>💸 Transactions</span>
                    </div>
                    <div className={`nav-item ${activeTab === 'profit' ? 'active' : ''}`} onClick={() => { setActiveTab('profit'); setIsSidebarOpen(false); }}>
                        <span>📈 Profit</span>
                    </div>
                    <div className={`nav-item ${activeTab === 'types' ? 'active' : ''}`} onClick={() => { setActiveTab('types'); setIsSidebarOpen(false); }}>
                        <span>💎 Types</span>
                    </div>
                    <div className={`nav-item ${activeTab === 'advances' ? 'active' : ''}`} onClick={() => { setActiveTab('advances'); setIsSidebarOpen(false); }}>
                        <span>💰 Advances</span>
                    </div>
                    <div className={`nav-item ${activeTab === 'employee' ? 'active' : ''}`} onClick={() => { setActiveTab('employee'); setIsSidebarOpen(false); }}>
                        <span>🏆 Employee of Week</span>
                    </div>
                    <div className={`nav-item ${activeTab === 'add-worker' ? 'active' : ''}`} onClick={() => { setActiveTab('add-worker'); setIsSidebarOpen(false); }}>
                        <span>👤 Add Worker</span>
                    </div>
                </div>
                <div className="sidebar-footer">
                    <button onClick={logout} className="btn btn-secondary" style={{ width: '100%' }}>Logout</button>
                </div>
            </div>

            {/* Mobile Overlay */}
            <div className={`mobile-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

            <div className="main-content">
                {/* Navbar */}
                <div className="navbar">
                    <button className="navbar-toggle" onClick={() => setIsSidebarOpen(true)}>☰</button>
                    <div className="navbar-info">
                        <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>👨‍💼 {user.name}</span>
                    </div>
                </div>

                {message.text && (
                    <div style={{
                        padding: '12px 24px',
                        background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
                        color: message.type === 'success' ? '#065f46' : '#991b1b',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '14px',
                        textAlign: 'center'
                    }}>
                        {message.text}
                    </div>
                )}

                {/* Tab Content */}
                {activeTab === 'approvals' && (
                    <div className="card fade-in">
                        <h2>Pending Work Requests</h2>
                        {pendingRequests.length === 0 ? <p>No pending requests</p> : (
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Worker</th><th>Dealer</th><th>Type</th><th>Count</th><th>Date</th><th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingRequests.map(request => (
                                            <tr key={request._id}>
                                                <td>{request.worker?.name}</td>
                                                <td>{request.dealer?.name}</td>
                                                <td>{request.diamondType?.name}</td>
                                                <td>{request.diamondCount}</td>
                                                <td>{new Date(request.requestDate).toLocaleDateString()}</td>
                                                <td style={{ whiteSpace: 'nowrap' }}>
                                                    <button onClick={() => approveRequest(request._id)} className="btn btn-success" style={{ padding: '6px 12px' }}>✓</button>
                                                    <button onClick={() => rejectRequest(request._id)} className="btn btn-danger" style={{ padding: '6px 12px' }}>✗</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'dealers' && (
                    <div className="grid grid-2 fade-in">
                        <div className="card">
                            <h2>Create Dealer</h2>
                            <form onSubmit={createDealer}>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input type="text" className="form-input" value={dealerForm.name} onChange={e => setDealerForm({ ...dealerForm, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Contact Info</label>
                                    <input type="text" className="form-input" value={dealerForm.contactInfo} onChange={e => setDealerForm({ ...dealerForm, contactInfo: e.target.value })} />
                                </div>
                                <button type="submit" className="btn btn-primary">Create</button>
                            </form>
                        </div>
                        <div className="card">
                            <h2>All Dealers</h2>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead><tr><th>Name</th><th className="hide-mobile">Contact</th><th>Status</th><th>Action</th></tr></thead>
                                    <tbody>
                                        {dealers.map(dealer => (
                                            <tr key={dealer._id}>
                                                <td>{dealer.name}</td>
                                                <td className="hide-mobile">{dealer.contactInfo || '-'}</td>
                                                <td><span className={`badge ${dealer.active ? 'badge-success' : 'badge-danger'}`}>{dealer.active ? 'Active' : 'Inactive'}</span></td>
                                                <td><button onClick={() => toggleDealer(dealer._id, dealer.active)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>{dealer.active ? 'Deactivate' : 'Activate'}</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div className="grid grid-2 fade-in">
                        <div className="card">
                            <h2>Record Dealer Transaction</h2>
                            <form onSubmit={createTransaction}>
                                <div className="form-group">
                                    <label>Dealer</label>
                                    <select className="form-select" value={transactionForm.dealer} onChange={e => setTransactionForm({ ...transactionForm, dealer: e.target.value })} required>
                                        <option value="">Select Dealer</option>
                                        {dealers.filter(d => d.active).map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Diamond Type</label>
                                    <select className="form-select" value={transactionForm.diamondType} onChange={e => setTransactionForm({ ...transactionForm, diamondType: e.target.value })} required>
                                        <option value="">Select Type</option>
                                        {diamondTypes.filter(t => t.active).map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Count</label>
                                    <input type="number" className="form-input" value={transactionForm.count} onChange={e => setTransactionForm({ ...transactionForm, count: e.target.value })} required min="1" />
                                </div>
                                <div className="form-group">
                                    <label>Price Per Diamond</label>
                                    <input type="number" className="form-input" value={transactionForm.pricePerDiamond} onChange={e => setTransactionForm({ ...transactionForm, pricePerDiamond: e.target.value })} required min="0" step="0.01" />
                                </div>
                                <div className="form-group">
                                    <label>Date (Optional)</label>
                                    <input type="date" className="form-input" value={transactionForm.date} onChange={e => setTransactionForm({ ...transactionForm, date: e.target.value })} />
                                </div>
                                <button type="submit" className="btn btn-primary">Record Transaction</button>
                            </form>
                        </div>
                        <div className="card">
                            <div className="card-header-flex">
                                <h2 style={{ marginBottom: 0 }}>Transaction History</h2>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <select
                                        className="form-select"
                                        style={{ width: 'auto', padding: '6px 10px', fontSize: '13px', margin: 0 }}
                                        value={selectedDealerForInvoice}
                                        onChange={e => setSelectedDealerForInvoice(e.target.value)}
                                    >
                                        <option value="">Select Dealer for Invoice</option>
                                        {dealers.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                    </select>
                                    <button
                                        onClick={generateDealerInvoicePDF}
                                        className="btn btn-primary"
                                        style={{ fontSize: '13px', whiteSpace: 'nowrap' }}
                                        disabled={isGeneratingPDF}
                                    >
                                        {isGeneratingPDF ? 'Generating...' : '📄 Generate Invoice PDF'}
                                    </button>
                                </div>
                            </div>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead><tr><th>Dealer</th><th>Type</th><th>Count</th><th>Price</th><th>Total</th><th>Date</th></tr></thead>
                                    <tbody>
                                        {dealerTransactions.map(t => (
                                            <tr key={t._id}>
                                                <td>{t.dealer?.name}</td>
                                                <td>{t.diamondType?.name}</td>
                                                <td>{t.count}</td>
                                                <td>₹{t.pricePerDiamond}</td>
                                                <td>₹{(t.totalAmount || 0).toLocaleString()}</td>
                                                <td>{new Date(t.date).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'profit' && (
                    <div className="fade-in">
                        <div className="card">
                            <div className="card-header-flex">
                                <h2 style={{ marginBottom: 0 }}>Profit Overview</h2>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={downloadProfitPDF} className="btn btn-secondary" style={{ fontSize: '13px', padding: '6px 12px' }}>📥 PDF</button>
                                    <button onClick={downloadProfitExcel} className="btn btn-success" style={{ fontSize: '13px', padding: '6px 12px' }}>📊 Excel</button>
                                </div>
                            </div>
                            <div className="stats-grid">
                                <div className="stat-card" style={{ background: '#ecfdf5', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                                    <div className="stat-value" style={{ color: '#059669', fontSize: '24px', fontWeight: 700 }}>₹{(profitData?.totalRevenue || 0).toLocaleString()}</div>
                                    <div className="stat-label" style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Revenue</div>
                                </div>
                                <div className="stat-card" style={{ background: '#fef2f2', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                                    <div className="stat-value" style={{ color: '#dc2626', fontSize: '24px', fontWeight: 700 }}>₹{(profitData?.totalLaborCost || 0).toLocaleString()}</div>
                                    <div className="stat-label" style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Labor Cost</div>
                                </div>
                                <div className="stat-card" style={{ background: '#eff6ff', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                                    <div className="stat-value" style={{ color: '#2563eb', fontSize: '24px', fontWeight: 700 }}>₹{(profitData?.netProfit || 0).toLocaleString()}</div>
                                    <div className="stat-label" style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Net Profit</div>
                                </div>
                                <div className="stat-card" style={{ background: '#fffbeb', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                                    <div className="stat-value" style={{ color: '#d97706', fontSize: '24px', fontWeight: 700 }}>{analytics.totalWorkers}</div>
                                    <div className="stat-label" style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Workers</div>
                                </div>
                            </div>
                        </div>
                        <div className="card" style={{ marginTop: '20px' }}>
                            <h3>Analytics</h3>
                            <div className="grid grid-2">
                                <div className="stat-card">
                                    <div className="stat-value">{analytics.totalWorkers}</div>
                                    <div className="stat-label">Total Workers</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-value">{analytics.pendingRequests}</div>
                                    <div className="stat-label">Pending Requests</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'types' && (
                    <div className="grid grid-2 fade-in">
                        <div className="card">
                            <h2>Create Diamond Type</h2>
                            <form onSubmit={createDiamondType}>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input type="text" className="form-input" value={typeForm.name} onChange={e => setTypeForm({ ...typeForm, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <input type="text" className="form-input" value={typeForm.description} onChange={e => setTypeForm({ ...typeForm, description: e.target.value })} />
                                </div>
                                <button type="submit" className="btn btn-primary">Create</button>
                            </form>
                        </div>
                        <div className="card">
                            <h2>All Types</h2>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead><tr><th>Name</th><th>Description</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {diamondTypes.map(t => (
                                            <tr key={t._id}><td>{t.name}</td><td>{t.description || '-'}</td><td>{t.active ? 'Active' : 'Inactive'}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'advances' && (
                    <div className="grid grid-2 fade-in">
                        <div className="card">
                            <h2>Give Advance</h2>
                            <form onSubmit={giveAdvance}>
                                <div className="form-group">
                                    <label>Worker</label>
                                    <select className="form-select" value={advanceForm.worker} onChange={e => setAdvanceForm({ ...advanceForm, worker: e.target.value })} required>
                                        <option value="">Select Worker</option>
                                        {workers.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Amount (₹)</label>
                                    <input type="number" className="form-input" value={advanceForm.amount} onChange={e => setAdvanceForm({ ...advanceForm, amount: e.target.value })} required min="1" />
                                </div>
                                <div className="form-group">
                                    <label>Notes</label>
                                    <input type="text" className="form-input" value={advanceForm.notes} onChange={e => setAdvanceForm({ ...advanceForm, notes: e.target.value })} />
                                </div>
                                <button type="submit" className="btn btn-primary">Give Advance</button>
                            </form>
                        </div>
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h2>Advance History</h2>
                                <div>
                                    <button onClick={downloadAdvancesPDF} className="btn btn-secondary" style={{ fontSize: '13px', marginRight: '5px' }}>📥 PDF</button>
                                    <button onClick={downloadAdvancesExcel} className="btn btn-success" style={{ fontSize: '13px' }}>📊 Excel</button>
                                </div>
                            </div>
                            <div className="table-responsive" style={{ maxHeight: '400px' }}>
                                <table className="table">
                                    <thead><tr><th>Worker</th><th>Amount</th><th>Date</th><th className="hide-mobile">Notes</th></tr></thead>
                                    <tbody>
                                        {advancesHistory.map(a => (
                                            <tr key={a._id}>
                                                <td>{a.worker?.name}</td>
                                                <td style={{ fontWeight: 'bold', color: '#dc2626' }}>₹{a.amount}</td>
                                                <td>{new Date(a.date).toLocaleDateString()}</td>
                                                <td className="hide-mobile">{a.notes || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'employee' && (
                    <div className="card fade-in">
                        <div className="card-header-flex">
                            <h2 style={{ marginBottom: 0 }}>🏆 Employee of the Week</h2>

                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f3f4f6', padding: '10px', borderRadius: '8px', flexWrap: 'wrap' }}>
                                <select
                                    className="form-select"
                                    style={{ width: 'auto', padding: '6px 10px', fontSize: '13px', margin: 0 }}
                                    value={selectedWorkerForReport}
                                    onChange={e => setSelectedWorkerForReport(e.target.value)}
                                >
                                    <option value="">Select Worker for Report</option>
                                    {workers.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                                </select>
                                <button
                                    onClick={generateWorkerReportPDF}
                                    className="btn btn-primary"
                                    style={{ fontSize: '13px', whiteSpace: 'nowrap' }}
                                    disabled={isGeneratingWorkerReport}
                                >
                                    {isGeneratingWorkerReport ? 'Generating...' : '📄 Download Worker Report'}
                                </button>
                            </div>
                        </div>

                        {employeeOfWeek && (
                            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0 }}>{employeeOfWeek.name}</h3>
                                <p>{employeeOfWeek.email}</p>
                                <button onClick={() => removeEmployeeOfWeek(employeeOfWeek._id)} className="btn" style={{ marginTop: '10px', background: 'rgba(255,255,255,0.2)', color: 'white' }}>Remove Badge</button>
                            </div>
                        )}
                        <div className="table-responsive">
                            <table className="table">
                                <thead><tr><th>Name</th><th className="hide-mobile">Email</th><th>Action</th></tr></thead>
                                <tbody>
                                    {workers.map(w => (
                                        <tr key={w._id}>
                                            <td>{w.name}</td>
                                            <td className="hide-mobile">{w.email}</td>
                                            <td>
                                                {!w.isEmployeeOfWeek && <button onClick={() => setEmployeeOfTheWeek(w._id)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>Set as Winner</button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'add-worker' && (
                    <div className="card fade-in" style={{ maxWidth: '600px' }}>
                        <h2>Add New Worker</h2>
                        <form onSubmit={createWorker}>
                            <div className="form-group"><label>Name</label><input type="text" className="form-input" value={workerForm.name} onChange={e => setWorkerForm({ ...workerForm, name: e.target.value })} required /></div>
                            <div className="form-group"><label>Email</label><input type="email" className="form-input" value={workerForm.email} onChange={e => setWorkerForm({ ...workerForm, email: e.target.value })} required /></div>
                            <div className="form-group"><label>Password</label><input type="password" className="form-input" value={workerForm.password} onChange={e => setWorkerForm({ ...workerForm, password: e.target.value })} required /></div>
                            <button type="submit" className="btn btn-primary">Create Worker</button>
                        </form>
                    </div>
                )}
            </div>

            <InvoiceTemplate ref={invoiceRef} invoiceData={invoiceData} />
            <WorkerReportTemplate ref={workerReportRef} reportData={workerReportData} />
        </div>
    );
};

export default ManagerDashboard;
