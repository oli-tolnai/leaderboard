"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'));
    app.useStaticAssets((0, path_1.join)(__dirname, '..'), {
        prefix: '/assets/',
    });
    app.enableCors({
        origin: true,
        credentials: true,
    });
    const port = process.env.PORT || 8080;
    await app.listen(port, '0.0.0.0');
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`Network access: http://192.168.1.130:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map