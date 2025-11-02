import type { QueryResult, QueryResultRow, VercelPool } from '@vercel/postgres';

type Primitive = string | number | boolean | null | undefined;

type SqlTag = VercelPool & (<O extends QueryResultRow>(strings: TemplateStringsArray, ...values: Primitive[]) => Promise<QueryResult<O>>);

type SqlArrayHelper = {
  array<T extends Primitive>(values: T[], type: string): Primitive;
};

declare const sql: SqlTag & SqlArrayHelper;

export declare function withDb<T>(callback: (sql: typeof sql) => Promise<T>): Promise<T>;

export { sql };
