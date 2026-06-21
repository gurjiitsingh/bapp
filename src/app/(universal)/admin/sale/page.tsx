import { getDailySales } from '../../action/sale/getDailySales';
import SalesClient from './components/SaleClient';



export default async function SalesPage() {
  const dailySales = await getDailySales();

  return <SalesClient dailySales={dailySales} />;
}