import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { analyzePassword } from "./password";

const schema = z.object({ password: z.string().max(256) });

export const analyzePasswordFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { analyzePassword } = await import("./password");
    return analyzePassword(data.password);
  });

export { analyzePassword };
