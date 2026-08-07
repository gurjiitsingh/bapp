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

  name?: string; // vehicle name
  locationCode?: string;

  movementType?: string;

  createdBy?: string;
  createdAt?: any;
};

type Props = {
  initialRows?: Row[];
};

const movementTypes = [
  'SALE',
  'TRANSFER',
  'RETURN',
  'LOAD',
  'ALL',
];

export default function StockMovementReportTable({
  initialRows = [],
}: Props) {
  const [rows, setRows] =
    useState<Row[]>(initialRows);

  const [loading, setLoading] =
    useState(false);

  const [movementType, setMovementType] =
    useState('SALE');

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

  const [locationCode, setLocationCode] =
    useState('');

  const [customerId, setCustomerId] =
    useState('');

  async function loadRows() {
    setLoading(true);

    try {
      const params =
        new URLSearchParams();

      if (fromDate) {
        params.append('from', fromDate);
      }

      if (toDate) {
        params.append('to', toDate);
      }

      if (
        movementType &&
        movementType !== 'ALL'
      ) {
        params.append(
          'movementType',
          movementType
        );
      }

      if (locationCode.trim()) {
        params.append(
          'locationCode',
          locationCode.trim()
        );
      }

      if (customerId.trim()) {
        params.append(
          'customerId',
          customerId.trim()
        );
      }

      const res = await fetch(
        `/api/reports/stock-movements?${params.toString()}`,
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
      console.error(
        'Load report error:',
        err
      );

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
  }, [
    fromDate,
    toDate,
    movementType,
    locationCode,
    customerId,
  ]);

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
        row.name,
        row.locationCode,
        row.movementType,
        row.createdBy,
        row.batchId,
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
      {/* Filters */}
      <div className='rounded-xl border bg-white p-4 shadow-sm'>
        <div className='grid gap-4 md:grid-cols-6'>
          <div>
            <label className='mb-1 block text-sm font-medium'>
              From
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
              To
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
              Type
            </label>

            <select
              value={movementType}
              onChange={(e) =>
                setMovementType(
                  e.target.value
                )
              }
              className='h-10 w-full rounded-md border border-gray-300 bg-white px-3'
            >
              {movementTypes.map((t) => (
                <option
                  key={t}
                  value={t}
                >
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium'>
              Vehicle / Location
            </label>

            <Input
              value={locationCode}
              onChange={(e) =>
                setLocationCode(
                  e.target.value
                )
              }
              placeholder='PB08-6734'
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium'>
              Customer ID
            </label>

            <Input
              value={customerId}
              onChange={(e) =>
                setCustomerId(
                  e.target.value
                )
              }
              placeholder='CUST001'
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

        <div className='mt-4'>
          <label className='mb-1 block text-sm font-medium'>
            Search
          </label>

          <Input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder='Product, customer, vehicle, batch...'
          />
        </div>
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-xl border bg-white shadow-sm'>
        <Table>
          <TableHeader className='bg-zinc-100'>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className='text-right'>
                Qty
              </TableHead>
              <TableHead>User</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className='py-10 text-center'
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className='py-10 text-center text-gray-500'
                >
                  No transactions found
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
                        ).toLocaleString(
                          'en-IN'
                        )
                      : '-'}
                  </TableCell>

                  <TableCell className='font-medium text-blue-700'>
                    {row.batchId || '-'}
                  </TableCell>

                  <TableCell>
                    {row.productName}
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
                    {row.name || '-'}
                  </TableCell>

                  <TableCell>
                    {row.locationCode ||
                      '-'}
                  </TableCell>

                  <TableCell>
                    <span className='rounded-full bg-gray-100 px-2 py-1 text-xs font-medium'>
                      {row.movementType}
                    </span>
                  </TableCell>

                  <TableCell className='text-right font-semibold'>
                    {row.quantity}
                  </TableCell>

                  <TableCell>
                    {row.createdBy || '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Footer */}
        <div className='flex flex-col gap-2 border-t bg-gray-50 px-4 py-3 text-sm md:flex-row md:items-center md:justify-between'>
          <span className='text-gray-600'>
            Total Transactions:{' '}
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

          {loading && (
            <span className='text-blue-600'>
              Loading...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}