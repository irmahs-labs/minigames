import type * as z from "zod/mini";

/**
 * A text frame received over a game's socket, as a message of the given
 * schema, or null if it is not one: a page left open across a deploy gets
 * an error, not a crash.
 */
export const parseMessage = <T>(
  schema: z.ZodMiniType<T>,
  frame: string
): T | null => {
  try {
    const result = schema.safeParse(JSON.parse(frame));

    return result.success ? result.data : null;
  } catch {
    return null;
  }
};
