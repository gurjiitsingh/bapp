import React from 'react'
import VehicleStockReturnTable from './VehicleStockReturnTable'
import { getVehicles } from '@/app/(universal)/action/distribution/getVehicles'

export default async function page() {

      const vehicles = await getVehicles()
  return (
  <VehicleStockReturnTable
  vehicles={vehicles}
/>
  )
}
