import { z } from "zod";

export const zodResolver = (schema: z.ZodSchema<any>) => async (data: any) => {
  try {
    const values = schema.parse(data);
    return { values, errors: {} };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.reduce((acc: any, current: any) => {
        const path = current.path.join(".");
        acc[path] = {
          message: current.message,
          type: "validation",
        };
        return acc;
      }, {});
      return { values: {}, errors };
    }
    return { values: {}, errors: { root: { message: error.message || "Validation failed" } } };
  }
};
