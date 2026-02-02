import { DatasetDetail } from "@/components/provider/DatasetDetail";

export default async function ProviderDatasetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DatasetDetail id={id} />;
}


