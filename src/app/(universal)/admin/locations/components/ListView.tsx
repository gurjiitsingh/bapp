"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import TableRows from "./TableRows";
import { fetchLocations } from "@/app/(universal)/action/location/dbOperation";
import { locationType } from "@/lib/types/locationType";

const LocationsListView = () => {
  const [locations, setLocations] = useState<locationType[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const result = await fetchLocations();
        setLocations(result);
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      }
    }

    load();
  }, []);

  return (
    <div className="mt-2">
      <h3 className="text-2xl mb-4 font-semibold">
        Delivery Locations
      </h3>

      <div className="bg-white dark:bg-zinc-900 rounded-lg p-1">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 dark:bg-zinc-800 text-slate-700 dark:text-white">
              <TableHead>Locality</TableHead>
              <TableHead className="hidden md:table-cell">City</TableHead>
              <TableHead className="hidden md:table-cell">State</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Min Spend</TableHead>
              <TableHead>Distance</TableHead>
              <TableHead className="hidden md:table-cell">
                Notes
              </TableHead>
              <TableHead className="text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {locations?.map(loc => (
              <TableRows key={loc.id} location={loc} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LocationsListView;
