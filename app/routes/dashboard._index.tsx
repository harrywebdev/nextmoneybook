import React from "react";
import { requireUserId } from "~/session.server";
import { json, LoaderArgs } from "@remix-run/node";
import Layout from "~/components/Layout";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request);

  return json({});
}

export default function DashboardIndexPage() {
  return (
    <Layout>
      <p>Fancy dashboard here</p>
    </Layout>
  );
}
