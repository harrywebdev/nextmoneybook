import React from "react";
import { Link } from "@remix-run/react";
import { requireUserId } from "~/session.server";
import { json, LoaderArgs } from "@remix-run/node";
import Navbar from "~/components/Navbar";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request);

  return json({});
}

export default function DashboardIndexPage() {
  return (
    <>
      <Navbar />
    </>
  );
}
