 
import { fetchBusinessSummary } from "../../action/businessData/fetchBusinessSummary";
import Dashboard from "./Dashboard";

export default async function Page() {
  const result = await fetchBusinessSummary();

  return <Dashboard summary={result} />;
}