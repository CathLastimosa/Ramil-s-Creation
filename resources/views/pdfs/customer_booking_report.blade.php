<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Customer Booking Report</title>
   <style>
      body {
         font-family: DejaVu Sans, sans-serif;
         margin: 20px;
         font-size: 12px;
      }
      .header {
         text-align: center;
         margin-bottom: 20px;
      }
      .section {
         margin-bottom: 20px;
      }
      table {
         width: 100%;
         border-collapse: collapse;
         margin-top: 10px;
      }
      th, td {
         border: 1px solid #000;
         padding: 8px;
         text-align: left;
      }
      .footer {
         text-align: center;
         font-size: 10px;
         margin-top: 30px;
      }
   </style>
</head>
<body>

   <!-- HEADER -->
   <div class="header">
      <h2>Customer Booking Report</h2>
      <p>{{ now()->format('F d, Y h:i A') }}</p>
   </div>

   <!-- CUSTOMER INFO -->
   <div class="section">
      <h3>Customer Information</h3>
      <p><strong>Name:</strong> {{ $booking->contact_name }}</p>
      <p><strong>Email:</strong> {{ $booking->contact_email }}</p>
      <p><strong>Phone:</strong> {{ $booking->contact_number }}</p>
      <p><strong>Address:</strong> {{ $booking->street_address }}, {{ $booking->city }}, {{ $booking->province }} {{ $booking->address_zip }}</p>
   </div>

   <!-- BOOKING INFO -->
   <div class="section">
      <h3>Booking Information</h3>
      <table>
         <tr>
            <th>Transaction Number</th>
            <td>{{ $booking->transaction_number }}</td>
         </tr>
         <tr>
            <th>Event Name</th>
            <td>{{ $booking->event_name }}</td>
         </tr>
         <tr>
            <th>Event Type</th>
            <td>{{ $booking->event_type }}</td>
         </tr>
         <tr>
            <th>Event Date</th>
            <td>{{ $booking->event_date }}</td>
         </tr>
         <tr>
            <th>Time</th>
            <td>{{ $booking->event_time_from }} - {{ $booking->event_time_to }}</td>
         </tr>
         <tr>
            <th>Guest Count</th>
            <td>{{ $booking->guest_count }}</td>
         </tr>
         <tr>
            <th>Status</th>
            <td>{{ ucfirst($booking->status) }}</td>
         </tr>
      </table>
   </div>

      <!-- PACKAGE -->
    <div class="section">
        <h3>Package</h3>
        @if($booking->packages->count() > 0)
            @php
                $package = $booking->packages->first();
            @endphp
            <p><strong>{{ $package->package_name }}</strong> - {{ $package->package_price }}</p>
        @else
            <p>No package selected.</p>
        @endif
    </div>
    
   <!-- SERVICES -->
   <div class="section">
      <h3>Selected Services</h3>
      @if($booking->services->count() > 0)
         <ul>
            @foreach($booking->services as $service)
               <li>{{ $service->service_name }} - {{ $service->description }}</li>
            @endforeach
         </ul>
      @else
         <p>No services selected.</p>
      @endif
   </div>

   </div>
   <!-- PAYMENT -->
   <div class="section">
      <h3>Payment Information</h3>
      @if($booking->payment)
         <table>
            <tr>
               <th>Paid Amount</th>
               <td>{{ $booking->payment->amount }}</td>
            </tr>
            <tr>
               <th>Payment Method</th>
               <td>{{ ucfirst($booking->payment->payment_method) }}</td>
            </tr>
         </table>
      @else
         <p>No payment record found.</p>
      @endif
   </div>

   <!-- FOOTER -->
   <div class="footer">
      <p>Thank you for booking with us!</p>
      <p>Ramil’s Creation Event Management System</p>
   </div>

</body>
</html>
