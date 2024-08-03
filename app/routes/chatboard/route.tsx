import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@vercel/remix";
import { Form, useLoaderData, useRevalidator } from "@remix-run/react";
import { useEffect } from "react";
import { useEventSource } from "remix-utils/sse/react";
import { getSession } from "~/session.server";
import { db } from "~/utils/db.server";
import { emitter } from "~/utils/emitter.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  if (!session.has("username")) {
    return redirect("/login");
  }

  const messages = await db.message.findMany({
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return json({ messages, username: session.get("username") });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  if (!session.has("username")) {
    return redirect("/login");
  }

  const formData = await request.formData();

  const values = Object.fromEntries(formData);

  if (!values["message"]) {
    return json({ message: "Could not send your message" });
  }

  const user = await db.user.findUnique({
    where: { username: session.get("username") },
  });

  if (!user) {
    return json({ message: "Could not send your message" });
  }

  await db.message.create({
    data: {
      message: values["message"].toString(),
      createdAt: new Date(),
      user: {
        connect: { id: user.id },
      },
    },
  });

  emitter.emit("chat");

  return json({ message: "Success" });
}

export default function Route() {
  const data = useEventSource("/chat");

  const { revalidate } = useRevalidator();

  useEffect(() => {
    revalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const { messages, username } = useLoaderData<typeof loader>();

  return (
    <main className="h-screen w-screen flex flex-col items-center overflow-y-auto">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
        Global Chat
      </h1>
      <Form action="/logout" method="POST">
        <button type="submit" className="bg-secondary p-2 rounded mb-4">
          Logout
        </button>
      </Form>
      <div className="w-9/12 h-full flex-grow flex flex-col gap-4 overflow-y-auto snap-y">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="w-full flex flex-row gap-4 align-items-start   snap-end"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              className={`size-12 ${
                msg.user.username === username ? `bg-secondary` : `bg-accent`
              } fill-background rounded flex-shrink-0 `}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
            <div className="flex flex-col gap-1 bg-foreground w-full">
              <div className="flex flex-row items-baseline gap-2">
                <p className="text-primary font-bold">{msg.user.username}</p>
                <p className="text-sm text-gray-500">
                  {new Date(msg.createdAt).toLocaleDateString()}
                </p>
              </div>

              <p>{msg.message}</p>
            </div>
          </div>
        ))}
      </div>
      <Form
        method="POST"
        className="p-4 my-4 flex flex-row items-center bg-foreground rounded-lg w-9/12"
      >
        <input
          name="message"
          placeholder="Type here..."
          type="text"
          autoComplete="off"
          className="w-full bg-foreground outline-none focus:ring-0"
        />
        <button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            className="size-6  stroke-accent transition ease-in duration-200 hover:stroke-primary"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
            />
          </svg>
        </button>
      </Form>
    </main>
  );
}
