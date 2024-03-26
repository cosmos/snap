import { postNotification } from './post.ts';
import { getNotifications } from './get.ts';

type Context = {
  // deno-lint-ignore no-explicit-any
  req: any;
  // deno-lint-ignore no-explicit-any
  res: any;
  // deno-lint-ignore no-explicit-any
  log: (msg: any) => void;
  // deno-lint-ignore no-explicit-any
  error: (msg: any) => void;
};

export default async (context: Context) => {
  try {
    switch (context.req.method) {
      case "GET": {
        const res = await getNotifications(context);
        return context.res.json(res);
      }
      case "POST": {
        const res = await postNotification(context);
        return context.res.json(res);
      }
      default:
        throw new Error("Invalid HTTP method");
    }
  } catch (error) {
    context.error(error.message);
    return context.res.json({
      error: error.message,
      success: false
    }, 500);
  }
}