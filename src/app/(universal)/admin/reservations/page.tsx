'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { getReservations, deleteReservation } from '@/app/(universal)/action/reservations/dbOperations';
import { MdDeleteForever } from 'react-icons/md';
import { useLanguage } from '@/store/LanguageContext';

interface Reservation {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  numberOfPersons: string;
  reservationDate: string;
  reservationTime: string;
  createdAt: string;
}

const RESERVATIONS_PER_PAGE = 10;

export default function ReservationListPage() {
  const { TEXT } = useLanguage();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    const data = await getReservations();
    setReservations(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm(TEXT.confirm_delete_reservation)) {
      await deleteReservation(id);
      fetchData();
    }
  };

  const totalPages = Math.ceil(reservations.length / RESERVATIONS_PER_PAGE);
  const startIndex = (currentPage - 1) * RESERVATIONS_PER_PAGE;
  const currentData = reservations.slice(startIndex, startIndex + RESERVATIONS_PER_PAGE);

  return (
    <div className="mt-4">
      <div className="overflow-x-auto bg-white dark:bg-zinc-900 shadow rounded-xl border border-gray-200 dark:border-zinc-700">
        <Table className="min-w-[1000px] text-sm text-left text-gray-700 dark:text-zinc-200">
          <TableHeader className="bg-gray-100 dark:bg-zinc-800">
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>{TEXT.name}</TableHead>
              <TableHead>{TEXT.email}</TableHead>
              <TableHead>{TEXT.phone}</TableHead>
              <TableHead>{TEXT.date}</TableHead>
              <TableHead>{TEXT.time}</TableHead>
              <TableHead>{TEXT.guests}</TableHead>
              <TableHead>{TEXT.message}</TableHead>
              <TableHead>{TEXT.created}</TableHead>
              <TableHead>{TEXT.action}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-4">
                  {TEXT.loading}
                </TableCell>
              </TableRow>
            ) : currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-4">
                  {TEXT.no_reservations}
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((rsv, i) => (
                <TableRow
                  key={rsv.id}
                  className="hover:bg-amber-50 dark:hover:bg-zinc-700 transition duration-200"
                >
                  <TableCell>{startIndex + i + 1}</TableCell>
                  <TableCell>{rsv.firstName} {rsv.lastName}</TableCell>
                  <TableCell>{rsv.email}</TableCell>
                  <TableCell>{rsv.phone}</TableCell>
                  <TableCell>{rsv.reservationDate}</TableCell>
                  <TableCell>{rsv.reservationTime}</TableCell>
                  <TableCell>{rsv.numberOfPersons}</TableCell>
                  <TableCell>{rsv.message}</TableCell>
                  <TableCell className="text-gray-500 dark:text-gray-400">
                    {new Date(rsv.createdAt).toLocaleString('de-DE', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleDelete(rsv.id)}
                      className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition"
                      aria-label={TEXT.delete_reservation}
                    >
                      <MdDeleteForever size={18} className="text-white" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-50"
        >
          ⬅️ {TEXT.pagination_newer}
        </button>

        <button
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={startIndex + RESERVATIONS_PER_PAGE >= reservations.length}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-50"
        >
          {TEXT.pagination_older} ➡️
        </button>
      </div>
    </div>
  );
}
