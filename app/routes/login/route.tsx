import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, Link, json, useActionData } from "@remix-run/react";
import { commitSession, getSession } from "~/session.server";
import { validateUser } from "./login";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  if (session.has("username")) {
    return redirect("/");
  }

  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const values = Object.fromEntries(formData);

  const username = values["username"];
  const password = values["password"];

  if (!username || !password) {
    return json({
      message: "Invalid Request. A username and password is needed.",
      ok: false,
    });
  }

  const validated = await validateUser(
    username.toString(),
    password.toString()
  );

  if (!validated) {
    return json({ message: "Could not authenticate.", ok: false });
  }

  const session = await getSession(request.headers.get("Cookie"));
  session.set("username", username.toString());

  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function Route() {
  const data = useActionData<typeof action>();
  return (
    <main className="h-screen flex flex-col justify-center items-center">
      <div className="bg-foreground p-16 rounded-lg">
        <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-accent to-secondary">
          Login
        </h1>
        <Form method="POST" className="flex flex-col">
          <label htmlFor="Username" className="pt-4 text-lg">
            Username
          </label>
          <input
            name="username"
            type="text"
            required
            className="px-1 active:text-text  rounded"
          />
          <label htmlFor="Username" className="pt-2 text-lg">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            className="mb-4 px-1 active:text-text rounded"
          />
          <button
            type="submit"
            className="bg-primary rounded text-lg font-bold transition ease-in duration-200 hover:-translate-y-1"
          >
            Submit
          </button>
        </Form>
        {!data?.ok && (
          <p className="text-secondary font-bold text-center pt-4">
            {data?.message}
          </p>
        )}
        <p className="pt-4">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-primary underline">
            Sign up!
          </Link>
        </p>
      </div>
    </main>
  );
}
