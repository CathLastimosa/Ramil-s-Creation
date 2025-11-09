// @/components/PrintUtils.tsx
interface BookingType {
    booking_id: string;
    transaction_number: string;
    event_name: string;
    event_date: string;
    event_time_from: string;
    event_time_to: string;
    event_type: string;
    guest_count: number;
    special_request: string;
    contact_name: string;
    contact_number: string;
    contact_email: string;
    street_address: string;
    city: string;
    province: string;
}

interface AppointmentType {
    appointment_id: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    purpose: string;
    appointment_date: string;
}

interface ServiceBookingType {
    service_booking_id: number;
    title: string;
    service_name: string;
    description: string;
    comment: string;
    date: string;
    return_date: string;
    start_time: string;
    end_time: string;
    total_amount: number;
    paid_amount: number;
    status: string;
    created_at: string;
}

// Function to print bookings report (opens in new tab, no pop-up blocker issues)
export function printBookings(bookings: BookingType[]) {
    // Generate full HTML content
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Bookings Report - Ramil's Creation</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * { box-sizing: border-box; }
        body { 
            font-family: "Segoe UI", Arial, sans-serif; 
            margin: 40px; 
            color: #333;
            background: #fff;
        }

        header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #222;
            padding-bottom: 10px;
            margin-bottom: 25px;
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .brand img {
            width: 60px;
            height: 60px;
            object-fit: contain;
        }

        .brand h2 {
            margin: 0;
            font-size: 22px;
            letter-spacing: 0.5px;
        }

        .report-info {
            text-align: right;
        }

        .report-info h1 {
            font-size: 24px;
            margin: 0;
        }

        .report-info p {
            font-size: 13px;
            color: #666;
            margin-top: 5px;
        }

        .summary {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
            margin-bottom: 15px;
            background: #f7f7f7;
            padding: 10px 15px;
            border-radius: 6px;
            border: 1px solid #ddd;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 13px;
            page-break-inside: auto;
        }

        th, td {
            border: 1px solid #ccc;
            padding: 10px 8px;
            text-align: left;
            vertical-align: top;
        }

        th {
            background-color: #f0f0f0;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 12px;
        }

        tr:nth-child(even) td {
            background-color: #fafafa;
        }

        tr:hover td {
            background-color: #f5faff;
        }

        tfoot td {
            border-top: 2px solid #666;
            font-weight: bold;
            background: #f2f2f2;
        }

        /* Printing Styles */
        @media print {
            body { 
                margin: 0.5in; 
                font-size: 12px;
            }
            header {
                border-bottom: 1px solid #000;
                margin-bottom: 10px;
            }
            table {
                page-break-after: auto;
            }
            tr {
                page-break-inside: avoid;
                page-break-after: auto;
            }
            thead {
                display: table-header-group;
            }
            tfoot {
                display: table-footer-group;
            }
            .no-print { display: none !important; }
        }
    </style>
</head>
<body>
    <header>
        <div class="brand">
            <img src="http://localhost:8000/storage/logo.png" alt="Ramil's Creation Logo">
            <h2>Ramil's Creation</h2>
        </div>
        <div class="report-info">
            <h1>Bookings Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString('en-US')}</p>
        </div>
    </header>

    <div class="summary">
        <div><strong>Report Type:</strong> All Bookings</div>
        <div><strong>Total Records:</strong> ${bookings.length}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Transaction #</th>
                <th>Event Name</th>
                <th>Event Date</th>
                <th>Event Type</th>
                <th>Guest Count</th>
                <th>Contact Name</th>
                <th>Contact Number</th>
                <th>Contact Email</th>
                <th>Location</th>
                <th>Special Request</th>
            </tr>
        </thead>
        <tbody>
            ${(() => {
                let rows = '';
                bookings.forEach((b) => {
                    rows += `
                        <tr>
                            <td>${b.transaction_number || ''}</td>
                            <td>${b.event_name || ''}</td>
                            <td>${b.event_date || ''}</td>
                            <td>${b.event_type || ''}</td>
                            <td>${b.guest_count || 0}</td>
                            <td>${b.contact_name || ''}</td>
                            <td>${b.contact_number || ''}</td>
                            <td>${b.contact_email || ''}</td>
                            <td>${(b.street_address || '') + ', ' + (b.city || '') + ', ' + (b.province || '')}</td>
                            <td>${b.special_request || 'N/A'}</td>
                        </tr>
                    `;
                });
                return rows;
            })()}
        </tbody>
    </table>

    <script>
        function initPrint() {
            window.print();
            setTimeout(() => window.close(), 1000);
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initPrint);
        } else {
            initPrint();
        }
    </script>
</body>
</html>
`;

    // Create blob and object URL for new tab
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    // Open in new tab (no features = no pop-up blocker trigger)
    const printWindow = window.open(url, '_blank');

    if (!printWindow) {
        // Rare fallback if open fails
        URL.revokeObjectURL(url);
        alert('Unable to open print tab. Please use Ctrl+P (Cmd+P on Mac) to print this page.');
        window.print(); // Fallback to current window print
        return;
    }

    // Focus the tab and clean up URL after a delay
    printWindow.focus();
    setTimeout(() => URL.revokeObjectURL(url), 1000); // Free memory after open
}

// Function to print service bookings report (opens in new tab, no pop-up blocker issues)
export function printServiceBookings(serviceBookings: ServiceBookingType[]) {
    // Generate full HTML content
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Service Bookings Report - Ramil's Creation</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * { box-sizing: border-box; }
        body { 
            font-family: "Segoe UI", Arial, sans-serif; 
            margin: 40px; 
            color: #333;
            background: #fff;
        }

        header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #222;
            padding-bottom: 10px;
            margin-bottom: 25px;
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .brand img {
            width: 60px;
            height: 60px;
            object-fit: contain;
        }

        .brand h2 {
            margin: 0;
            font-size: 22px;
            letter-spacing: 0.5px;
        }

        .report-info {
            text-align: right;
        }

        .report-info h1 {
            font-size: 24px;
            margin: 0;
        }

        .report-info p {
            font-size: 13px;
            color: #666;
            margin-top: 5px;
        }

        .summary {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
            margin-bottom: 15px;
            background: #f7f7f7;
            padding: 10px 15px;
            border-radius: 6px;
            border: 1px solid #ddd;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 13px;
            page-break-inside: auto;
        }

        th, td {
            border: 1px solid #ccc;
            padding: 10px 8px;
            text-align: left;
            vertical-align: top;
        }

        th {
            background-color: #f0f0f0;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 12px;
        }

        tr:nth-child(even) td {
            background-color: #fafafa;
        }

        tr:hover td {
            background-color: #f5faff;
        }

        tfoot td {
            border-top: 2px solid #666;
            font-weight: bold;
            background: #f2f2f2;
        }

        /* Printing Styles */
        @media print {
            body { 
                margin: 0.5in; 
                font-size: 12px;
            }
            header {
                border-bottom: 1px solid #000;
                margin-bottom: 10px;
            }
            table {
                page-break-after: auto;
            }
            tr {
                page-break-inside: avoid;
                page-break-after: auto;
            }
            thead {
                display: table-header-group;
            }
            tfoot {
                display: table-footer-group;
            }
            .no-print { display: none !important; }
        }
    </style>
</head>
<body>
    <header>
        <div class="brand">
            <img src="http://localhost:8000/storage/logo.png" alt="Ramil's Creation Logo">
            <h2>Ramil's Creation</h2>
        </div>
        <div class="report-info">
            <h1>Service Bookings Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString('en-US')}</p>
        </div>
    </header>

    <div class="summary">
        <div><strong>Report Type:</strong> All Service Bookings</div>
        <div><strong>Total Records:</strong> ${serviceBookings.length}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Service Name</th>
                <th>Description</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Return Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Total Amount</th>
                <th>Paid Amount</th>
                <th>Status</th>
                <th>Created At</th>
            </tr>
        </thead>
        <tbody>
            ${(() => {
                let rows = '';
                serviceBookings.forEach((sb) => {
                    rows += `
                        <tr>
                            <td>${sb.service_booking_id || ''}</td>
                            <td>${sb.title || ''}</td>
                            <td>${sb.service_name || ''}</td>
                            <td>${sb.description || ''}</td>
                            <td>${sb.comment || ''}</td>
                            <td>${sb.date || ''}</td>
                            <td>${sb.return_date || ''}</td>
                            <td>${sb.start_time || ''}</td>
                            <td>${sb.end_time || ''}</td>
                            <td>₱ ${sb.total_amount || 0}</td>
                            <td>₱ ${sb.paid_amount || 0}</td>
                            <td>${sb.status || ''}</td>
                            <td>${sb.created_at || ''}</td>
                        </tr>
                    `;
                });
                return rows;
            })()}
        </tbody>
    </table>

    <script>
        function initPrint() {
            window.print();
            setTimeout(() => window.close(), 1000);
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initPrint);
        } else {
            initPrint();
        }
    </script>
</body>
</html>
`;

    // Create blob and object URL for new tab
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    // Open in new tab (no features = no pop-up blocker trigger)
    const printWindow = window.open(url, '_blank');

    if (!printWindow) {
        // Rare fallback if open fails
        URL.revokeObjectURL(url);
        alert('Unable to open print tab. Please use Ctrl+P (Cmd+P on Mac) to print this page.');
        window.print(); // Fallback to current window print
        return;
    }

    // Focus the tab and clean up URL after a delay
    printWindow.focus();
    setTimeout(() => URL.revokeObjectURL(url), 1000); // Free memory after open
}

// Function to print appointments report (opens in new tab, no pop-up blocker issues)
export function printAppointments(appointments: AppointmentType[]) {
    // Generate full HTML content
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Appointments Report</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * { box-sizing: border-box; }
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px;
            line-height: 1.5;
            color: #333;
        }
        header {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            text-align: center;
            margin-bottom: 20px;
        }
        header img {
            width: 80px;
            height: 80px;
            object-fit: contain;
            margin-bottom: 10px;
        }
        h1 { 
            font-size: 24px;
            margin-bottom: 5px; 
            color: #222;
        }
        p { 
            text-align: center; 
            margin-bottom: 20px; 
            color: #666; 
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
            page-break-inside: avoid;
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
            word-wrap: break-word;
            font-size: 13px;
        }
        th { 
            background-color: #f2f2f2; 
            font-weight: bold; 
            position: sticky; 
            top: 0;
        }
        tr:nth-child(even) { background-color: #f9f9f9; }
        footer {
            text-align: center;
            font-size: 12px;
            color: #888;
            margin-top: 40px;
        }
        @media print { 
            body { margin: 0; padding: 10px; }
            table { font-size: 12px; }
            .no-print { display: none !important; }
            @page { margin: 0.5in; }
        }
    </style>
</head>
<body>
    <header>
        <img src="http://localhost:8000/storage/logo.png" alt="Ramil's Creation Logo">
        <h1>Ramil's Creation</h1>
        <h2 style="font-size:18px; color:#444; margin-top:5px;">Appointments Report</h2>
    </header>
    <p>Generated on: ${new Date().toLocaleDateString('en-US')}</p>
    <table>
        <thead>
            <tr>
                <th>Appointment ID</th>
                <th>Contact Name</th>
                <th>Contact Email</th>
                <th>Contact Phone</th>
                <th>Purpose</th>
                <th>Appointment Date</th>
            </tr>
        </thead>
        <tbody>
            ${(() => {
                let rows = '';
                appointments.forEach((a) => {
                    rows += `
                        <tr>
                            <td>${a.appointment_id || ''}</td>
                            <td>${a.contact_name || ''}</td>
                            <td>${a.contact_email || ''}</td>
                            <td>${a.contact_phone || ''}</td>
                            <td>${a.purpose || ''}</td>
                            <td>${a.appointment_date || ''}</td>
                        </tr>
                    `;
                });
                return rows;
            })()}
        </tbody>
    </table>
    <footer>
        <p>© ${new Date().getFullYear()} Ramil's Creation — All Rights Reserved.</p>
    </footer>
    <script>
        function initPrint() {
            window.print();
            setTimeout(function() {
                window.close();
            }, 1000);
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initPrint);
        } else {
            initPrint();
        }
        setTimeout(initPrint, 500);
    </script>
</body>
</html>
`;

    // Create blob and object URL for new tab
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    // Open in new tab (no features = no pop-up blocker trigger)
    const printWindow = window.open(url, '_blank');

    if (!printWindow) {
        // Rare fallback if open fails
        URL.revokeObjectURL(url);
        alert('Unable to open print tab. Please use Ctrl+P (Cmd+P on Mac) to print this page.');
        window.print(); // Fallback to current window print
        return;
    }

    // Focus the tab and clean up URL after a delay
    printWindow.focus();
    setTimeout(() => URL.revokeObjectURL(url), 1000); // Free memory after open
}
