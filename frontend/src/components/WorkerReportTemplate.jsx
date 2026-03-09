import React, { forwardRef } from 'react';

const WorkerReportTemplate = forwardRef(({ reportData }, ref) => {
    if (!reportData) return null;

    const {
        workerName,
        reportNumber,
        date,
        workLogs,      // array of { id, date, diamonds, price, dealer, income }
        advances,      // array of { id, date, remark, amount }
        totalDiamonds,
        totalIncome,
        totalAdvance,
        netPayable
    } = reportData;

    return (
        <div 
            ref={ref} 
            style={{ 
                position: 'absolute', 
                top: '-9999px', 
                left: '-9999px',
                width: '794px', /* 210mm approx A4 width at 96 DPI */
                minHeight: '1123px', /* 297mm approx A4 height */
                backgroundColor: 'white',
                padding: '40px',
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                color: '#333',
                boxSizing: 'border-box'
            }}
        >
            {/* HEADER */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '2px solid #e5e7eb',
                paddingBottom: '20px',
                marginBottom: '20px'
            }}>
                <div>
                    <h1 style={{ margin: '0 0 5px 0', color: '#111827', fontSize: '28px' }}>Radhe 4P</h1>
                    <p style={{ margin: '2px 0', color: '#6b7280', fontSize: '14px' }}>3rd FLOOR, ROOM NO. 11,</p>
                    <p style={{ margin: '2px 0', color: '#6b7280', fontSize: '14px' }}>PLOT NO.11, BAJARANG APP., MATA VADI,</p>
                    <p style={{ margin: '2px 0', color: '#6b7280', fontSize: '14px' }}>VARACHHA, SURAT, GUJARAT-395006</p>
                    <p style={{ margin: '2px 0', color: '#6b7280', fontSize: '14px' }}>Phone: +91 9979265814</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h2 style={{ margin: '0 0 10px 0', color: '#4f46e5', fontSize: '24px', textTransform: 'uppercase', letterSpacing: '1px' }}>Diamond Worker Work Report</h2>
                    <p style={{ margin: '5px 0', color: '#374151', fontWeight: '500' }}>Report #: {reportNumber}</p>
                    <p style={{ margin: '5px 0', color: '#374151', fontWeight: '500' }}>Date: {date}</p>
                </div>
            </div>

            {/* WORKER DETAILS */}
            <div style={{
                backgroundColor: '#f9fafb',
                padding: '15px',
                borderRadius: '6px',
                marginBottom: '20px',
                borderLeft: '4px solid #4f46e5'
            }}>
                <h3 style={{ margin: 0, color: '#1f2937' }}>Worker Name: {workerName}</h3>
            </div>

            {/* DAILY WORK TABLE */}
            <h4 style={{ color: '#4f46e5', marginBottom: '10px', fontSize: '18px', borderBottom: '1px solid #e5e7eb', paddingBottom: '5px' }}>
                Daily Work Logs
            </h4>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '25px',
                fontSize: '14px'
            }}>
                <thead>
                    <tr>
                        <th style={{ backgroundColor: '#4f46e5', color: 'white', padding: '10px', textAlign: 'left', fontWeight: '600' }}>S.No</th>
                        <th style={{ backgroundColor: '#4f46e5', color: 'white', padding: '10px', textAlign: 'left', fontWeight: '600' }}>Date</th>
                        <th style={{ backgroundColor: '#4f46e5', color: 'white', padding: '10px', textAlign: 'left', fontWeight: '600' }}>Number of Diamonds</th>
                        <th style={{ backgroundColor: '#4f46e5', color: 'white', padding: '10px', textAlign: 'left', fontWeight: '600' }}>Work Price (per diamond)</th>
                        <th style={{ backgroundColor: '#4f46e5', color: 'white', padding: '10px', textAlign: 'left', fontWeight: '600' }}>Dealer Name</th>
                        <th style={{ backgroundColor: '#4f46e5', color: 'white', padding: '10px', textAlign: 'right', fontWeight: '600' }}>Total Income</th>
                    </tr>
                </thead>
                <tbody>
                    {workLogs && workLogs.length > 0 ? (
                        workLogs.map((item, index) => (
                            <tr key={index}>
                                <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>{index + 1}</td>
                                <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>{item.date}</td>
                                <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>{item.diamonds}</td>
                                <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>{item.dealer}</td>
                                <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', color: '#374151', textAlign: 'right' }}>₹{item.income.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" style={{ padding: '10px', textAlign: 'center', color: '#6b7280' }}>No work logs found.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* ADVANCE TABLE */}
            <h4 style={{ color: '#4f46e5', marginBottom: '10px', fontSize: '18px', borderBottom: '1px solid #e5e7eb', paddingBottom: '5px' }}>
                Advances Taken
            </h4>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '25px',
                fontSize: '14px'
            }}>
                <thead>
                    <tr>
                        <th style={{ backgroundColor: '#4f46e5', color: 'white', padding: '10px', textAlign: 'left', fontWeight: '600' }}>S.No</th>
                        <th style={{ backgroundColor: '#4f46e5', color: 'white', padding: '10px', textAlign: 'left', fontWeight: '600' }}>Date</th>
                        <th style={{ backgroundColor: '#4f46e5', color: 'white', padding: '10px', textAlign: 'left', fontWeight: '600' }}>Remark</th>
                        <th style={{ backgroundColor: '#4f46e5', color: 'white', padding: '10px', textAlign: 'right', fontWeight: '600' }}>Advance Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {advances && advances.length > 0 ? (
                        advances.map((item, index) => (
                            <tr key={index}>
                                <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>{index + 1}</td>
                                <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>{item.date}</td>
                                <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>{item.remark || '-'}</td>
                                <td style={{ padding: '10px', borderBottom: '1px solid #e5e7eb', color: '#dc2626', textAlign: 'right' }}>
                                    -₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" style={{ padding: '10px', textAlign: 'center', color: '#6b7280' }}>No advances found.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* SUMMARY SECTION */}
            <div style={{
                width: '350px',
                float: 'right',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                padding: '15px',
                backgroundColor: '#f9fafb',
                marginBottom: '40px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#4b5563' }}>
                    <span>Total Diamonds Worked:</span>
                    <span>{totalDiamonds.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#4b5563' }}>
                    <span>Total Income:</span>
                    <span>₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#dc2626' }}>
                    <span>Total Advance Taken:</span>
                    <span>-₹{totalAdvance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    color: '#111827', 
                    borderTop: '1px solid #d1d5db', 
                    paddingTop: '10px', 
                    marginTop: '10px' 
                }}>
                    <span>Final Payable Amount:</span>
                    <span>₹{netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </div>
            
            <div style={{ clear: 'both' }}></div>

            {/* FOOTER / SIGNATURES */}
            <div style={{
                position: 'absolute',
                bottom: '60px',
                left: '40px',
                right: '40px',
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '50px'
            }}>
                <div style={{ textAlign: 'center', width: '200px' }}>
                    <div style={{ borderBottom: '1px solid #111827', marginBottom: '10px', height: '40px' }}></div>
                    <strong>Worker Signature</strong>
                </div>
                <div style={{ textAlign: 'center', width: '200px' }}>
                    <div style={{ 
                        borderBottom: '2px dashed #9ca3af', 
                        marginBottom: '10px', 
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9ca3af'
                    }}>
                        (Stamp Here)
                    </div>
                    <strong>Company Stamp</strong>
                </div>
                <div style={{ textAlign: 'center', width: '200px' }}>
                    <div style={{ borderBottom: '1px solid #111827', marginBottom: '10px', height: '40px' }}></div>
                    <strong>Manager Signature</strong>
                </div>
            </div>
        </div>
    );
});

export default WorkerReportTemplate;
