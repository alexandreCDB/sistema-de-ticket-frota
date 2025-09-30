import React, { useState } from 'react';
import { HistoryItem } from '../HistoryItem';
import { Pagination } from '../Pagination';
import { BookingWithVehicle } from '../../types';

interface HistoryListProps {
  bookings: BookingWithVehicle[];
}

export const HistoryList: React.FC<HistoryListProps> = ({ bookings }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalItems = bookings.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = bookings.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="history-list">
      {currentItems.map((booking) => (
        <HistoryItem key={booking.id} booking={booking} />
      ))}

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
