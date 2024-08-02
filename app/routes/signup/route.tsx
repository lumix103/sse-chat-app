import { Prisma } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, json, redirect, useActionData } from "@remix-run/react";
import { createUser } from "./signup";
import { getSession } from "~/session.server";

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

  if (!values["username"] || !values["password"]) {
    return json({
      message: "Invalid Request. Username and password is required",
      ok: false,
    });
  }

  try {
    createUser(values["username"].toString(), values["password"].toString());
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return json({ message: "This username is already taken!", ok: false });
      }
    }
    return json({ message: "An unknown error occurred", ok: false });
  }

  return redirect("/login");
}

export default function Route() {
  const data = useActionData<typeof action>();
  return (
    <main className="h-screen flex flex-col justify-center items-center">
      <div className="bg-foreground p-16 rounded-lg">
        <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-accent to-secondary">
          Sign Up
        </h1>
        <Form method="POST" className="flex flex-col">
          <label htmlFor="Username" className="pt-4 text-lg">
            Username
          </label>
          <input
            name="username"
            type="text"
            required
            className="px-1 text-background rounded"
          />
          <label htmlFor="Username" className="pt-2 text-lg">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            className="mb-4 px-1 text-background rounded"
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
          Already have an account?{" "}
          <Link to="/login" className="text-primary underline">
            Login!
          </Link>
        </p>
      </div>
    </main>
  );
}
