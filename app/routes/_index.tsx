import { LoaderFunctionArgs, redirect } from "@vercel/remix";
import { Link } from "@remix-run/react";
import { getSession } from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.has("username")) {
    return redirect("/chatboard");
  }

  return null;
}

export default function Index() {
  return (
    <main className="h-screen flex flex-col justify-center items-center gap-10">
      <h1 className="text-3xl md:text-5xl font-bold text-center">
        A Chat App built with
        <br />
        <span className="bg-gradient-to-r text-transparent from-primary to-secondary bg-clip-text">
          Server Side Events
        </span>
      </h1>
      <p className="text-center">Create an account to start chatting.</p>
      <div className="flex flex-row justify-center items-center gap-6 text-lg">
        <Link
          to="/signup"
          className="bg-secondary p-4 rounded-lg transition ease-in-out duration-200 hover:-translate-y-1 hover:font-bold"
        >
          Sign Up
        </Link>
        <Link
          to="/login"
          className="relative bg-primary p-4 rounded-lg text-background font-bold transition ease-in-out duration-200 hover:-translate-y-1 hover:before:content-[''] hover:before:absolute before:opacity-0 before:transition before:ease-in-out before:duration-200 before:delay-1000 hover:before:delay-0 hover:before:opacity-100 hover:before:inset-0 hover:before:-z-10 hover:before:bg-primary hover:before:blur-xl hover:before:rounded-full"
        >
          Login
        </Link>
      </div>
    </main>
  );
}
