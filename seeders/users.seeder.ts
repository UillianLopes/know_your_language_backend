import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Seed } from '@kyl/entities/seed.entity';
import { User } from '@kyl/entities/user.entity';
import { EAuthProvider } from '@kyl/enums/auth-provider.enum';

const USERS: Partial<User>[] = [
  {
    name: 'Uillian Lopes',
    email: 'uilliansl+admin@outlook.com',
    provider: EAuthProvider.self,
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$uFkn/1HSvTi1lD85QlFr5Q$/fwoa5HSHrHWCQ6HWwn8Zc79prsCkl5PDvD5ovVjtyQ',
  },
];

export default class UsersSeeder1687700404 implements Seeder {
  readonly name = 'UsersSeeder1687700404';
  readonly timestamp = 1687700404;
  async run(dataSource: DataSource): Promise<any> {
    try {
      const seedRepository = dataSource.getRepository(Seed);

      let seed = await seedRepository.findOneBy({
        name: this.name,
      });

      if (seed) {
        console.log(`THE SEED ${this.name} IS ALREADY APPLIED`);
        return;
      }

      const userRepository = dataSource.getRepository(User);
      await dataSource.transaction(async (manager) => {
        const users = USERS.map((user) => userRepository.create(user));
        await manager.save(users);
        seed = seedRepository.create({
          name: this.name,
          timestamp: this.timestamp,
        });
        await manager.save(seed);
      });

      console.log(`THE SEED ${this.name} WAS SUCCESSFULLY EXECUTED`);
    } catch (err) {
      console.log(`FAILED TO RUN: ${this.name}`);
      return false;
    }
  }
}
