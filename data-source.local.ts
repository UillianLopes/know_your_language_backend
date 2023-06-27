import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { config } from 'dotenv';

const env = config({
  path: 'environments/.env',
});

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: env.parsed.DB_HOST,
  port: parseInt(env.parsed.DB_PORT),
  username: env.parsed.DB_USERNAME,
  password: env.parsed.DB_PASSWORD,
  database: env.parsed.DB_NAME,
  entities: ['src/entities/*.entity.ts'],
  migrations: ['migrations/*.ts'],
  migrationsTableName: 'migration',
  seeds: ['seeders/*.ts'],
};

const devDataSource = new DataSource(options);

export default devDataSource;
