/*
 * Minimal Zod-compatible validator tailored for the API needs in this project.
 * It implements only the pieces of the Zod API that we rely on (string, number coercion,
 * enum, object, optional, trim, min, regex, url, int, nonnegative, transform, safeParse,
 * and error flattening).
 */

type Issue = {
  path: string[];
  message: string;
};

class SimpleZodError extends Error {
  issues: Issue[];

  constructor(issues: Issue[]) {
    super('Validation failed');
    this.issues = issues;
  }

  flatten() {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of this.issues) {
      const key = issue.path[0] ?? '_root';
      if (!fieldErrors[key]) {
        fieldErrors[key] = [];
      }
      fieldErrors[key]!.push(issue.message);
    }
    return { fieldErrors };
  }
}

type SafeParseSuccess<T> = { success: true; data: T };
type SafeParseError = { success: false; error: SimpleZodError };

const INVALID = Symbol('invalid');

type ParseContext = {
  issues: Issue[];
};

abstract class BaseSchema<T> {
  abstract _parse(value: unknown, path: string[], ctx: ParseContext): T | typeof INVALID;

  safeParse(value: unknown): SafeParseSuccess<T> | SafeParseError {
    const ctx: ParseContext = { issues: [] };
    const parsed = this._parse(value, [], ctx);
    if (ctx.issues.length > 0) {
      return { success: false, error: new SimpleZodError(ctx.issues) };
    }
    return { success: true, data: parsed as T };
  }
}

type StringConfig<T> = {
  trim?: boolean;
  minLength?: { value: number; message?: string };
  optional?: boolean;
  regex?: { pattern: RegExp; message?: string };
  urlMessage?: string;
  transform?: (value: string) => T;
};

class StringSchema<T = string> extends BaseSchema<T extends string ? string : T> {
  private config: StringConfig<T>;

  constructor(config: StringConfig<T> = {}) {
    super();
    this.config = config;
  }

  trim() {
    return new StringSchema<T>({ ...this.config, trim: true });
  }

  min(value: number, message?: string) {
    return new StringSchema<T>({ ...this.config, minLength: { value, message } });
  }

  optional() {
    return new StringSchema<T>({ ...this.config, optional: true });
  }

  regex(pattern: RegExp, params?: { message?: string }) {
    return new StringSchema<T>({ ...this.config, regex: { pattern, message: params?.message } });
  }

  transform<U>(fn: (value: string) => U) {
    return new StringSchema<U>({ ...this.config, transform: fn });
  }

  url(message?: string) {
    return new StringSchema<T>({ ...this.config, urlMessage: message });
  }

  _parse(value: unknown, path: string[], ctx: ParseContext) {
    if (value === undefined || value === null) {
      if (this.config.optional) {
        return undefined as T;
      }
      ctx.issues.push({ path, message: 'Required field.' });
      return INVALID;
    }

    if (typeof value !== 'string') {
      ctx.issues.push({ path, message: 'Expected a string.' });
      return INVALID;
    }

    let result = this.config.trim ? value.trim() : value;

    if (this.config.minLength && result.length < this.config.minLength.value) {
      ctx.issues.push({
        path,
        message: this.config.minLength.message || `Must be at least ${this.config.minLength.value} characters.`,
      });
      return INVALID;
    }

    if (this.config.regex && !this.config.regex.pattern.test(result)) {
      ctx.issues.push({ path, message: this.config.regex.message || 'Invalid format.' });
      return INVALID;
    }

    if (this.config.urlMessage) {
      try {
        // eslint-disable-next-line no-new
        new URL(result);
      } catch {
        ctx.issues.push({ path, message: this.config.urlMessage });
        return INVALID;
      }
    }

    if (this.config.transform) {
      try {
        return this.config.transform(result);
      } catch (error) {
        ctx.issues.push({ path, message: (error as Error).message || 'Invalid value.' });
        return INVALID;
      }
    }

    return result as unknown as T;
  }
}

type NumberConfig = {
  coerce?: boolean;
  invalidTypeMessage?: string;
  intMessage?: string;
  nonnegativeMessage?: string;
};

class NumberSchema extends BaseSchema<number> {
  private config: NumberConfig;

  constructor(config: NumberConfig = {}) {
    super();
    this.config = config;
  }

  int(message?: string) {
    return new NumberSchema({ ...this.config, intMessage: message });
  }

  nonnegative(params?: { message?: string }) {
    return new NumberSchema({ ...this.config, nonnegativeMessage: params?.message });
  }

  _parse(value: unknown, path: string[], ctx: ParseContext) {
    let numericValue: number;

    if (this.config.coerce) {
      numericValue = Number(value);
    } else if (typeof value === 'number') {
      numericValue = value;
    } else {
      ctx.issues.push({ path, message: this.config.invalidTypeMessage || 'Expected a number.' });
      return INVALID;
    }

    if (!Number.isFinite(numericValue)) {
      ctx.issues.push({ path, message: this.config.invalidTypeMessage || 'Expected a number.' });
      return INVALID;
    }

    if (this.config.intMessage && !Number.isInteger(numericValue)) {
      ctx.issues.push({ path, message: this.config.intMessage });
      return INVALID;
    }

    if (this.config.nonnegativeMessage && numericValue < 0) {
      ctx.issues.push({ path, message: this.config.nonnegativeMessage });
      return INVALID;
    }

    return numericValue;
  }
}

type EnumOptions = {
  errorMap?: () => { message: string };
};

class EnumSchema<T extends string> extends BaseSchema<T> {
  private readonly options: EnumOptions;
  private readonly values: readonly T[];

  constructor(values: readonly T[], options: EnumOptions = {}) {
    super();
    this.values = values;
    this.options = options;
  }

  _parse(value: unknown, path: string[], ctx: ParseContext) {
    if (typeof value !== 'string' || !this.values.includes(value as T)) {
      const message = this.options.errorMap?.().message || 'Invalid value.';
      ctx.issues.push({ path, message });
      return INVALID;
    }

    return value as T;
  }
}

class ObjectSchema<T extends Record<string, any>> extends BaseSchema<T> {
  private readonly shape: { [K in keyof T]: BaseSchema<T[K]> };

  constructor(shape: { [K in keyof T]: BaseSchema<T[K]> }) {
    super();
    this.shape = shape;
  }

  _parse(value: unknown, path: string[], ctx: ParseContext) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      ctx.issues.push({ path, message: 'Expected an object.' });
      return INVALID;
    }

    const result: Record<string, unknown> = {};
    for (const key of Object.keys(this.shape) as (keyof T)[]) {
      const childSchema = this.shape[key];
      const childValue = (value as Record<string, unknown>)[key as string];
      const parsed = childSchema._parse(childValue, [...path, key as string], ctx);
      if (parsed !== INVALID) {
        result[key as string] = parsed;
      }
    }

    return result as T;
  }
}

export const z = {
  string: () => new StringSchema(),
  object: <T extends Record<string, any>>(shape: { [K in keyof T]: BaseSchema<T[K]> }) => new ObjectSchema<T>(shape),
  enum: <T extends string>(values: readonly T[], options?: EnumOptions) => new EnumSchema<T>(values, options),
  coerce: {
    number: (options?: { invalid_type_error?: string }) => new NumberSchema({
      coerce: true,
      invalidTypeMessage: options?.invalid_type_error,
    }),
  },
};

export type inferSafe<T extends BaseSchema<any>> = T extends BaseSchema<infer R> ? R : never;
export type ZodSafeParseReturn<T> = SafeParseSuccess<T> | SafeParseError;
export type ZodError = SimpleZodError;
