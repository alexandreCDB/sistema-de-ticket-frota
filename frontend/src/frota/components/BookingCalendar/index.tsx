import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { BookingWithVehicle } from '../../types';

interface BookingCalendarProps {
  bookings: BookingWithVehicle[];
}

export const BookingCalendar = ({ bookings }: BookingCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getBookingsForDay = (date: Date) => {
    return bookings.filter(b => {
      const start = new Date(b.start_time);
      const end = new Date(b.end_time || b.start_time);
      return date >= start && date <= end;
    });
  };

  const getDayClassName = (date: Date) => {
    const bookingsForDay = getBookingsForDay(date);
    if (bookingsForDay.length > 0) {
      return 'booked-day';
    }
    return '';
  };

  const renderTooltip = (date: Date) => {
    const bookingsForDay = getBookingsForDay(date);
    if (bookingsForDay.length === 0) return null;

    return (
      <div className="tooltip">
        {bookingsForDay.map(b => (
          <div key={b.id}>
            <p><strong>Tipo:</strong> {b.type === 'checkout' ? 'Retirada' : 'Agendamento'}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <DatePicker
      inline
      highlightDates={bookings.map(b => new Date(b.start_time))}
      dayClassName={getDayClassName}
      renderDayContents={(dayOfMonth, date) => (
        <span onMouseEnter={() => setSelectedDate(date)} onMouseLeave={() => setSelectedDate(null)}>
          {dayOfMonth}
          {selectedDate && getBookingsForDay(date).length > 0 && renderTooltip(date)}
        </span>
      )}
    />
  );
};