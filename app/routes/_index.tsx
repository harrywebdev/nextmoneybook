import type { V2_MetaFunction } from "@remix-run/node";

// import { useOptionalUser } from "~/utils";
import appConfig from "~/app-config";
import { requireUserId } from "~/session.server";
import { LoaderArgs, redirect } from "@remix-run/node";

export const meta: V2_MetaFunction = () => [{ title: appConfig.app.title }];

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  return redirect("/dashboard");
}
