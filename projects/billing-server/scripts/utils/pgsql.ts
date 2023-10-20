import { Client, ClientConfig, QueryResult } from 'pg';
import { Sql } from './sql';

type PgsqlFn = (context: PostgreSqlContext) => Promise<void | boolean> | void | boolean;
export class PostgreSql extends Sql<ClientConfig> {
  override async on(fn: PgsqlFn): Promise<void> {
    const client = await connect(this.config);
    await fn(new PostgreSqlContext(client));
    await end(client);
  }

  static override async on(config: ClientConfig, fn: PgsqlFn): Promise<void> {
    const postgres = new PostgreSql(config);
    await postgres.on(fn);
  }
}

class PostgreSqlContext {
  constructor(private readonly client: Client) {}

  async query(message: string, queryString: string): Promise<QueryResult> {
    const rv = await query(message, this.client, queryString);
    return rv;
  }
}

async function connectInternal(config: ClientConfig): Promise<Client> {
  return new Promise<Client>((resolve, reject) => {
    const client = new Client(config);
    console.log('Connecting...');
    client.connect((error) => {
      if (error) {
        reject(error);
      } else {
        resolve(client);
        console.log('Connected');
      }
    });
  });
}

async function connect(config: ClientConfig): Promise<Client> {
  let lastError: unknown | undefined;
  for (let i = 0; i < 30; i++) {
    try {
      return await connectInternal(config);
    } catch (error) {
      lastError = error;
      await new Promise<void>((resolve) => setTimeout(resolve, 2000));
    }
  }
  if (lastError) {
    throw lastError;
  } else {
    throw new Error('Could not connect to ');
  }
}

async function query(message: string, client: Client, queryString: string): Promise<QueryResult> {
  console.log(message);
  const rv = await client.query(queryString);
  return rv;
}

async function end(client: Client): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    client.end((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
