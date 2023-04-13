import { json, LoaderArgs } from "@remix-run/node";

export async function loader({ params }: LoaderArgs) {
  return json({
    success: true,
  });
}
