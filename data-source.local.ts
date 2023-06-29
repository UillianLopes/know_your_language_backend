import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { config } from 'dotenv';
const envConfig = config({
  path: 'environments/.env',
});

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: envConfig.parsed.DB_HOST,
  port: parseInt(envConfig.parsed.DB_PORT),
  username: envConfig.parsed.DB_USERNAME,
  password: envConfig.parsed.DB_PASSWORD,
  database: envConfig.parsed.DB_NAME,
  entities: ['src/entities/*.entity.ts'],
  migrations: ['migrations/*.ts'],
  migrationsTableName: 'migration',
  seeds: [UsersSeeder1687700404, WordsPtBr1687698213, WordsPtBr1687698213],
};

const devDataSource = new DataSource(options);

export default devDataSource;
