import { LoaderFunctionArgs } from "@vercel/remix";
import { eventStream } from "remix-utils/sse/server";
import { interval } from "remix-utils/timers";
import { emitter } from "~/utils/emitter.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return eventStream(request.signal, (send) => {
    async function run() {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const _ of interval(1000, { signal: request.signal })) {
        send({ event: "time", data: new Date().toISOString() });
      }
    }

    run();

    const handle = () => {
      send({ data: String(Date.now()) });
    };

    emitter.addListener("chat", handle);

    return () => {
      console.log("emitter removed");
      emitter.removeListener("chat", handle);
    };
  });
}
