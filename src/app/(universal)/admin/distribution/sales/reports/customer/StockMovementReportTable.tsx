'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Row = {
  id: string;

  batchId?: string;

  productName?: string;
  quantity?: number;

  customerName?: string;
  customerId?: string;

  name?: string;
  locationCode?: string;

  createdBy?: string;
  createdAt?: any;
};

type Props = {
  initialRows?: Row[];
};

export default function StockMovementReportTable({
  initialRows = [],
}: Props) {
  const [rows, setRows] =
    useState<Row[]>(initialRows);

  const [loading, setLoading] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const [fromDate, setFromDate] =
    useState(
      new Date()
        .toISOString()
        .split('T')[0]
    );

  const [toDate, setToDate] =
    useState(
      new Date()
        .toISOString()
        .split('T')[0]
    );

  async function loadRows() {
    setLoading(true);

    try {
      const params =
        new URLSearchParams();

      params.append('from', fromDate);
      params.append('to', toDate);

      const res = await fetch(
        `/api/reports/customer-sales?${params.toString()}`,
        {
          method: 'GET',
          cache: 'no-store',
        }
      );

      if (!res.ok) {
        throw new Error(
          'Failed to load report'
        );
      }

      const json = await res.json();

      setRows(json.data ?? []);
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  const firstLoad = useRef(true);

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }

    loadRows();
  }, [fromDate, toDate]);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) {
      return rows;
    }

    const q = search.trim().toLowerCase();

    return rows.filter((row) =>
      [
        row.productName,
        row.customerName,
        row.customerId,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(q)
        )
    );
  }, [rows, search]);

  const totalQuantity = useMemo(
    () =>
      filteredRows.reduce(
        (sum, row) =>
          sum +
          Number(row.quantity || 0),
        0
      ),
    [filteredRows]
  );

  return (
    <div className='space-y-4'>
      {/* Simple Filters */}
      <div className='rounded-xl border bg-white p-4 shadow-sm'>
        <div className='grid gap-4 md:grid-cols-4'>
          <div>
            <label className='mb-1 block text-sm font-medium'>
              From Date
            </label>

            <Input
              type='date'
              value={fromDate}
              onChange={(e) =>
                setFromDate(e.target.value)
              }
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium'>
              To Date
            </label>

            <Input
              type='date'
              value={toDate}
              onChange={(e) =>
                setToDate(e.target.value)
              }
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium'>
              Search
            </label>

            <Input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder='Customer or product'
            />
          </div>

          <div className='flex items-end'>
            <Button
              className='w-full'
              onClick={loadRows}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-xl border bg-white shadow-sm'>
        <Table>
          <TableHeader className='bg-zinc-100'>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className='text-right'>
                Qty
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='py-10 text-center'
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='py-10 text-center text-gray-500'
                >
                  No sales found
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row) => (
                <TableRow
                  key={row.id}
                  className='odd:bg-white even:bg-zinc-50 hover:bg-blue-50'
                >
                  <TableCell className='whitespace-nowrap'>
                    {row.createdAt
                      ? new Date(
                          row.createdAt
                        ).toLocaleDateString(
                          'en-IN'
                        )
                      : '-'}
                  </TableCell>

                  <TableCell className='font-medium text-blue-700'>
                    {row.batchId || '-'}
                  </TableCell>

                  <TableCell>
                    <div className='flex flex-col'>
                      <span className='font-medium'>
                        {row.customerName ||
                          '-'}
                      </span>

                      <span className='text-xs text-gray-500'>
                        {row.customerId ||
                          ''}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {row.productName}
                  </TableCell>

                  <TableCell className='text-right font-semibold'>
                    {row.quantity}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Footer */}
        <div className='flex flex-col gap-2 border-t bg-gray-50 px-4 py-3 text-sm md:flex-row md:items-center md:justify-between'>
          <span className='text-gray-600'>
            Total Rows:{' '}
            <span className='font-semibold'>
              {filteredRows.length}
            </span>
          </span>

          <span className='text-gray-600'>
            Total Quantity:{' '}
            <span className='font-semibold'>
              {totalQuantity}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}