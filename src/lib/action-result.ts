export type ActionResult<T = void> = {
  success: boolean;
  message: string;
  data?: T;
  fieldErrors?: Record<string, string[]>;
};

export function successResult<T>(message: string, data?: T): ActionResult<T> {
  return { success: true, message, data };
}

export function errorResult<T>(
  message: string,
  fieldErrors?: Record<string, string[]>,
): ActionResult<T> {
  return { success: false, message, fieldErrors };
}
