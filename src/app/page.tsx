import { getDashboardData } from "./actions";
import DashboardContainer from "./DashboardContainer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const dashboardData = await getDashboardData();

  return (
    <DashboardContainer initialData={dashboardData} />
  );
}