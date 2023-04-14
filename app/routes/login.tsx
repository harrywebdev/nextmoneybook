import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import * as React from "react";

import { createUserSession, getUserId } from "~/session.server";
import { safeRedirect } from "~/utils";
import { z } from "zod";
import { getUserById, verifyLogin } from "~/models/user.server";

const token = z.object({
  user: z.string(),
  password: z.string(),
});

function extractToken(
  t: string | null
): { user: string; password: string } | null {
  if (!t) {
    return null;
  }

  try {
    return token.parse(JSON.parse(Buffer.from(t, "base64").toString()));
  } catch (e) {
    return null;
  }
}

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/");

  const requestUrl = new URL(request.url);
  const token = extractToken(requestUrl.searchParams.get("token"));
  const redirectTo = safeRedirect(
    requestUrl.searchParams.get("redirectTo"),
    "/dashboard"
  );

  if (token) {
    // try to verify the token right away
    const userById = await getUserById(token.user);

    if (userById) {
      const user = await verifyLogin(userById?.email || "", token.password);
      if (user) {
        return createUserSession({
          request,
          userId: user.id,
          remember: false,
          redirectTo,
        });
      } else {
        throw redirect("/login?redirectTo=" + redirectTo);
      }
    }
  }

  return json({ token: null });
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/dashboard");

  if (!password) {
    return json({ errors: { password: "Invalid password" } }, { status: 400 });
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { email: null, password: "Password is required" } },
      { status: 400 }
    );
  }

  const user = await verifyLogin("admin@remix.run", password);

  if (!user) {
    return json(
      { errors: { email: "Invalid email or password", password: null } },
      { status: 400 }
    );
  }

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo,
  });
}

export const meta: V2_MetaFunction = () => [{ title: "Login" }];

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  const actionData = useActionData<typeof action>();
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                ref={passwordRef}
                defaultValue={""}
                name="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {actionData?.errors?.password && (
                <div className="pt-1 text-red-700" id="password-error">
                  {actionData.errors.password}
                </div>
              )}
            </div>
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button
            type="submit"
            className="w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Log in
          </button>
        </Form>
      </div>
    </div>
  );
}
