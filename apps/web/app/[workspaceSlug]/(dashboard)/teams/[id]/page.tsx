"use client";

import { use } from "react";
import { TeamDetailPage } from "@multica/views/teams";

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <TeamDetailPage teamId={id} />;
}
