import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { config } from 'dotenv';
import UsersSeeder1687700404 from './seeders/users.seeder';
import WordsPtBr1687698213 from './seeders/words-pt-br.seeder';
import WordsEnUs1687705796 from './seeders/words-en-us.seeder';
import PromptsSeeder1690164786 from './seeders/prompts.seeder';
import * as process from 'process';

const nodeEnv = process.env?.NODE_ENV ?? 'dev';

const envOptions = {
  prod: () => process.env,
  dev: () => {
    const envConfig = config({
      path: 'environments/dev.env',
    });
    return envConfig.parsed;
  },
};

const env: { [key: string]: string } = envOptions[nodeEnv]();

console.log('ENV -> ', env);

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: env.DB_HOST,
  port: parseInt(env.DB_PORT),
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
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
