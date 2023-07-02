import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { config } from 'dotenv';
import UsersSeeder1687700404 from './seeders/users.seeder';
import WordsPtBr1687698213 from './seeders/words-pt-br.seeder';
import WordsEnUs1687705796 from './seeders/words-en-us.seeder';

const envConfig = config({
  path: 'environments/dev.env',
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
  seeds: [UsersSeeder1687700404, WordsPtBr1687698213, WordsEnUs1687705796],
};

const devDataSource = new DataSource(options);

export default devDataSource;
