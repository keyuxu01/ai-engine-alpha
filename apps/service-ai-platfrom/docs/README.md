# Service AI Platform

## 项目结构

```
src/
├── main.ts                    # 应用入口
├── app.module.ts              # 根模块
├── common/                    # 公共模块
│   └── filter/                # 全局异常过滤器
│       ├── index.ts           # 导出入口
│       ├── http-exception.filter.ts
│       └── zod-validation-exception.filter.ts
├── modules/                   # 业务模块
│   ├── example/               # 示例模块
│   └── user/                  # 用户模块
├── services/                  # 服务层（待实现）
│   └── index.ts
└── gateways/                  # 网关层（待实现）
    └── index.ts
```

## 核心技术栈

- **NestJS** - Node.js 框架
- **nestjs-zod** - Zod 集成 (验证 & 序列化)
- **Zod** - TypeScript-first schema validation
- **Swagger** - API 文档

## 全局配置

### 验证 (ZodValidationPipe)

通过 `APP_PIPE` 在 `app.module.ts` 中全局注册，所有请求都会经过 Zod schema 验证。

### 序列化 (ZodSerializerInterceptor)

通过 `APP_INTERCEPTOR` 在 `app.module.ts` 中全局注册，所有响应会自动根据 DTO 进行序列化。

### 异常过滤

在 `main.ts` 中注册了两个全局异常过滤器：

- `ZodValidationExceptionFilter` - 捕获 Zod 验证错误
- `HttpExceptionFilter` - 捕获 HTTP 异常（包括序列化错误）
