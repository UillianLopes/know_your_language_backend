import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: 'local.knowyourlanguage.com',
  port: 5432,
  username: 'postgres',
  password: 'Postgres999',
  database: 'know_your_language',
  entities: ['src/entities/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migration',
  seeds: ['src/seeders/*.seeder.ts'],
};

const devDataSource = new DataSource(options);

export default devDataSource;
