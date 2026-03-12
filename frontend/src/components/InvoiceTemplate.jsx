import React, { forwardRef } from 'react';

const InvoiceTemplate = forwardRef(({ invoiceData }, ref) => {
    if (!invoiceData) return null;

    const {
        dealerName,
        transactions, // array of { id, type, count, price, amount, date }
        subtotal,
        netAmount
    } = invoiceData;

    return (
        <div
            ref={ref}
            style={{
                width: '794px', /* 210mm approx A4 width at 96 DPI */
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
                marginBottom: '30px'
            }}>
                <div>
                    <h1 style={{ margin: '0 0 5px 0', color: '#111827', fontSize: '28px' }}>Radhe 4P</h1>
                    <p style={{ margin: '2px 0', color: '#6b7280', fontSize: '14px' }}>3rd FLOOR, ROOM NO. 11,</p>
                    <p style={{ margin: '2px 0', color: '#6b7280', fontSize: '14px' }}>PLOT NO.11, BAJARANG APP., MATA VADI,</p>
                    <p style={{ margin: '2px 0', color: '#6b7280', fontSize: '14px' }}>VARACHHA, SURAT, GUJARAT-395006</p>
                    <p style={{ margin: '2px 0', color: '#6b7280', fontSize: '14px' }}>Phone: +91 9979265814</p>
                </div>
            </div>

            {/* MIDDLE SECTION */}
            <div style={{
                backgroundColor: '#f9fafb',
                padding: '15px',
                borderRadius: '6px',
                marginBottom: '30px',
                borderLeft: '4px solid #4f46e5'
            }}>
                <h3 style={{ margin: 0, color: '#1f2937' }}>Dealer Name: {dealerName}</h3>
            </div>

            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '30px'
            }}>
                <thead>
                    <tr>
                        <th style={{ backgroundColor: '#4f46e5', color: 'white', padding: '12px', textAlign: 'left', fontWeight: '600' }}>S.No</th>
                        <th style={{ backgroundColor: '#4f46e5', color: 'white', padding: '12px', textAlign: 'left', fontWeight: '600' }}>Date</th>
                        <th style={{ backgroundColor: '#4f46e5', color: 'white', padding: '12px', textAlign: 'left', fontWeight: '600' }}>Diamonds Received</th>
                        <th style={{ backgroundColor: '#4f46e5', color: 'white', padding: '12px', textAlign: 'right', fontWeight: '600' }}>Price per Diamond</th>
                        <th style={{ backgroundColor: '#4f46e5', color: 'white', padding: '12px', textAlign: 'right', fontWeight: '600' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions && transactions.length > 0 ? (
                        transactions.map((item, index) => (
                            <tr key={index}>
                                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>{index + 1}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>{item.date}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>{item.count} {item.type ? `(${item.type})` : ''}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#374151', textAlign: 'right' }}>₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#374151', textAlign: 'right' }}>₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>No transactions found.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* TOTAL SECTION */}
            <div style={{
                width: '300px',
                float: 'right',
                borderTop: '2px solid #e5e7eb',
                paddingTop: '15px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#111827',
                    borderTop: 'none',
                    paddingTop: '0',
                    marginTop: '0'
                }}>
                    <span>Net Amount:</span>
                    <span>₹{netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </div>

            <div style={{ clear: 'both' }}></div>

            <div style={{
                textAlign: 'center',
                color: '#9ca3af',
                fontSize: '12px',
                borderTop: '1px solid #e5e7eb',
                paddingTop: '20px',
                marginTop: '40px'
            }}>
                <p>Thank you for your business! For any inquiries, please contact +91 9979265814.</p>
            </div>
        </div>
    );
});

export default InvoiceTemplate;
