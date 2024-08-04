import { LoaderFunctionArgs } from "@vercel/remix";
import { eventStream } from "remix-utils/sse/server";
import { emitter } from "~/utils/emitter.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return eventStream(
    request.signal,
    (send) => {
      const handle = () => {
        send({ data: String(Date.now()) + "\n\n" });
      };

      emitter.addListener("chat", handle);

      return () => {
        console.log("emitter removed");
        emitter.removeListener("chat", handle);
      };
    },
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    }
  );
}
