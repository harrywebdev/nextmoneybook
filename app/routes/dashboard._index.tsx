import React from "react";
import { Link } from "@remix-run/react";
import { requireUserId } from "~/session.server";
import { json, LoaderArgs } from "@remix-run/node";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request);

  return json({});
}

export default function DashboardIndexPage() {
  return (
    <div className="mx-auto mt-16 max-w-7xl text-center">
      <Link
        to="/dashboard"
        className="text-xl text-blue-600 underline"
        data-testid={"dashboard-link"}
      >
        Dashboard
      </Link>
    </div>
  );
}
