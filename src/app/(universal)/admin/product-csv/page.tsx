'use client'

import { useState } from 'react'
import { ProductType } from '@/lib/types/productType'
import { fetchAllProducts } from '../../action/products/dbOperation'



export default function ProductCSVExportPage() {
  const [loading, setLoading] = useState(false)

  const exportProductsToCSV = async () => {
    setLoading(true)

    try {
      const products: ProductType[] = await fetchAllProducts()

      const headers = ['ArtikelNr', 'Artikelname', 'Preis']
      const rows = products.map((p) => [
        p.id ?? '', // Use id as ArtikelNr
        (p.name ?? '').replace(/;/g, ','), // Clean semicolons in name
        formatPrice(p.price),
      ])

      const csvContent = [headers, ...rows]
        .map((row) => row.join(';'))
        .join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'products-winorder.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Error exporting CSV:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: any): string => {
    const parsed = parseFloat(price)
    return isNaN(parsed) ? '0.00' : parsed.toFixed(2)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Export Products for WinOrder</h1>
      <button
        onClick={exportProductsToCSV}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Exporting...' : 'Download CSV'}
      </button>
    </div>
  )
}
