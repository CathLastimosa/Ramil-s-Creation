import React from 'react';
import { Link } from '@inertiajs/react';
import ButtonPrimary from '@/components/home/ButtonPrimary';

const Calendar: React.FC = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); 
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); 
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const emptyDays = Array.from({ length: firstDayOfWeek });

    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="w-20 h-0.5 bg-red-600 mb-6"></div>
                            <h2 className="font-heading text-xl leading-tight font-bold text-gray-900 md:text-xl lg:text-5xl pr-24">
                                View Available Dates for Your Event
                            </h2>
                        </div>

                        {/* Description */}
                        <p className="font-body text-xl md:text-xl text-gray-600 leading-relaxed max-w-2xl">
                            Browse our calendar to check available dates for bookings, appointments, and personalized visits. Whether you're preparing for a wedding, debut, or simply visiting for a gown fitting or design consultation, our calendar helps you secure the perfect date.
                        </p>

                        {/* CTA Button */}
                        <div className="font-heading pt-4">
                            <ButtonPrimary href="/calendar">
                                        View Full Calendar
                            </ButtonPrimary>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="relative flex justify-center lg:justify-end">
                        <div className="relative">
                            <div className="relative w-full max-w-xl">
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-24 h-8 bg-red-600 rounded-t-full"></div>
                                
                                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 shadow-2xl border-4 border-white">
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                            {monthNames[month]} {year}
                                        </h3>
                                        <div className="grid grid-cols-7 gap-2 text-sm font-semibold text-gray-600">
                                            {weekDays.map((day) => (
                                                <div key={day} className="text-center py-2">{day}</div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-7 gap-2">
                                        {emptyDays.map((_, index) => (
                                            <div key={`empty-${index}`} className="h-12"></div>
                                        ))}
                                        
                                        {calendarDays.map((day) => {
                                            const isToday =
                                                day === today.getDate() &&
                                                month === today.getMonth() &&
                                                year === today.getFullYear();
                                            const isAvailable = day % 3 !== 0; 

                                            return (
                                                <div
                                                    key={day}
                                                    className={`h-12 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                                                        isToday
                                                            ? 'bg-red-600 text-white shadow-lg transform scale-110'
                                                            : isAvailable
                                                            ? 'bg-white text-gray-900 hover:bg-red-50 hover:shadow-md cursor-pointer'
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                >
                                                    {day}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Availability legend */}
                                    <div className="flex justify-center space-x-6 mt-6 pt-4 border-t border-gray-200">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                                            <span className="text-xs text-gray-600">Available</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                            <span className="text-xs text-gray-600">Booked</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Decorative elements */}
                                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-red-100 rounded-full opacity-50"></div>
                                <div className="absolute -top-4 -left-4 w-16 h-16 bg-red-200 rounded-full opacity-30"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Calendar;