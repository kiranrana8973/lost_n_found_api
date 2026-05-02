"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const seed_module_1 = require("./seed.module");
const seed_service_1 = require("./seed.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(seed_module_1.SeedModule);
    const seedService = app.get(seed_service_1.SeedService);
    const arg = process.argv[2];
    if (arg === '-i') {
        await seedService.importData();
    }
    else if (arg === '-d') {
        await seedService.destroyData();
    }
    else {
        console.log('Please use -i to import or -d to delete data');
    }
    await app.close();
    process.exit(0);
}
bootstrap().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.command.js.map