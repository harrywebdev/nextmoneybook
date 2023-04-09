import type { V2_MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

import { useOptionalUser } from "~/utils";
import appConfig from "~/app-config";

export const meta: V2_MetaFunction = () => [{ title: appConfig.app.title }];

export default function Index() {
  const user = useOptionalUser();
  return (
    <div className="mx-auto mt-16 max-w-7xl text-center">
      <Link to="/dashboard" className="text-xl text-blue-600 underline">
        Dashboard
      </Link>
    </div>
  );
}
