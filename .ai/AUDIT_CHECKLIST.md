# 咖啡 ERP 系统审计详细清单

## 1. 后端检查 (Backend)

- [x] Controller-Service-Repository 分层模式
- [ ] 每一个 Entity 都有对应的 Repository (45 Entity vs 42 Repo) -> **FAIL**
- [ ] 逻辑全部下沉到 Service 层 (Controller 33 vs Service 28) -> **WARN**
- [x] 核心修改方法使用了 `@Transactional` -> **PASS**
- [ ] 所有关联查询都实现了多租户隔离 (ledger_set_id) -> **WARN**
- [ ] 所有敏感操作都有权限控制 -> **PASS**

## 2. 数据库检查 (Database)

- [ ] 字段约束符合多租户模型 (username UNIQUE) -> **FAIL**
- [ ] 外键级联删除策略一致性 -> **WARN**
- [ ] 常用查询字段(org_id/ledger_set_id, code, status) 索引 -> **WARN**
- [ ] 脚本迁移与 Entity 状态一致 -> **PASS** (部分 migration 脚本已同步)

## 3. 前端检查 (Frontend)

- [ ] 页面组件大小控制在 500 行以内 -> **FAIL** (SalesOrders 等超 1000 行)
- [ ] 类型安全性 (无 any) -> **FAIL** (208 usages)
- [x] 响应式设计 (Tailwind CSS) -> **PASS**
- [x] API 隔离层封装 -> **PASS**
- [ ] 错误处理统一拦截 -> **PASS**

## 4. 业务逻辑检查 (Business Logic)

- [x] 登录过程支持账套选择
- [x] 销售订单流程完整性
- [x] 采购收货库存联动
- [x] 生产投料扣减逻辑
- [ ] 会计期间锁定验证 -> **WARN**
- [x] BOM 管理功能

## 5. 安全性检查 (Security)

- [x] JWT 认证
- [x] 密码存储 Bcrypt
- [ ] 多租户完全隔离 (DAO 层自动添加租户过滤) -> **FAIL** (手动注入)
- [ ] 敏感配置硬编码扫描 ( application-gcp.yml 可能包含密钥) -> **WARN**
