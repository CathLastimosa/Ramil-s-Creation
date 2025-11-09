'use client';

import { useState } from 'react';

// Mock data - replace with actual data from your API
const mockEventData = {
  packageId: 'PKG-09282025-001',
  bookingId: 'BK-09282025-001',
  guestCount: 150,
  customer: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, City, State 12345'
  },
  payment: {
    paymentId: 'PAY-09282025-001',
    downpayment: '$500.00',
    referenceNo: 'REF-123456789'
  },
  services: [
    { id: 1, name: 'Photography Package', description: 'Premium photo coverage' },
    { id: 2, name: 'Catering Service', description: 'Buffet style dining' },
    { id: 3, name: 'Venue Decoration', description: 'Floral and lighting setup' },
    { id: 4, name: 'Entertainment', description: 'Live band performance' },
    { id: 5, name: 'Transportation', description: 'VIP car service' }
  ]
};

export default function EventDetails() {
  const [eventData] = useState(mockEventData);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Package ID */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 bg-white/80 backdrop-blur-sm py-3 px-6 rounded-full inline-block shadow-lg">
          {eventData.packageId}
        </h2>
      </div>

      {/* Details and Downpayment Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Details Column */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Event Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-800">Booking ID:</span>
              <span className="font-medium text-gray-800">{eventData.bookingId}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-800">Number of Guests:</span>
              <span className="font-medium text-gray-800">{eventData.guestCount}</span>
            </div>
            <div className="flex items-center py-2 border-b border-gray-100">
              <span className="text-gray-800 mr-3">👤</span>
              <span className="flex-grow text-gray-800">{eventData.customer.name}</span>
            </div>
            <div className="flex items-center py-2 border-b border-gray-100">
              <span className="text-gray-800 mr-3">✉️</span>
              <span className="flex-grow text-gray-800">{eventData.customer.email}</span>
            </div>
            <div className="flex items-center py-2 border-b border-gray-100">
              <span className="text-gray-800 mr-3">📞</span>
              <span className="flex-grow text-gray-800">{eventData.customer.phone}</span>
            </div>
            <div className="flex items-center py-2">
              <span className="text-gray-800 mr-3">📍</span>
              <span className="flex-grow text-gray-800">{eventData.customer.address}</span>
            </div>
          </div>
        </div>

        {/* Downpayment Column */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Payment Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-800">Payment ID:</span>
              <span className="font-medium text-gray-800">{eventData.payment.paymentId}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-800">Downpayment:</span>
              <span className="font-medium text-green-600">{eventData.payment.downpayment}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-800">Reference No:</span>
              <span className="font-medium text-gray-800">{eventData.payment.referenceNo}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Services */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Selected Services</h3>
        <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
          {eventData.services.map((service) => (
            <div
              key={service.id}
              className="flex-shrink-0 w-64 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <h4 className="font-semibold text-gray-800 mb-2">{service.name}</h4>
              <p className="text-gray-800 text-sm">{service.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Button */}
      <div className="text-center">
        <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
          Message Ramil&apos;s Creation
        </button>
      </div>
    </div>
  );
}