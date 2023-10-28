import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import UsersSeeder1687700404 from './seeders/users.seeder';
import WordsPtBr1687698213 from './seeders/words-pt-br.seeder';
import WordsEnUs1687705796 from './seeders/words-en-us.seeder';
import PromptsSeeder1690164786 from './seeders/prompts.seeder';
import * as process from 'process';
import { config } from 'dotenv';

const nodeEnv = process.env?.NODE_ENV ?? 'dev';

const paths = {
  dev: 'environments/dev.env',
  prod: 'environments/prod.env',
};

config({
  path: paths[nodeEnv],
});

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/entities/*.entity.ts'],
  migrations: ['migrations/*.ts'],
  migrationsTableName: 'migration',
  seeds: [
    UsersSeeder1687700404,
    WordsPtBr1687698213,
    WordsEnUs1687705796,
    PromptsSeeder1690164786,
  ],
};

const devDataSource = new DataSource(options);

export default devDataSource;
