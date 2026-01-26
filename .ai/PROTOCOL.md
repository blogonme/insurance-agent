# 🤖 AI Collaborative Protocol (ACP) v2.0

> **A production-grade protocol for AI-driven software development**  
> Architect: Claude Opus | Builder: Gemini Flash | Reviewer: Claude Opus

---

## 📋 Table of Contents

1. [工作流概览](https://claude.ai/chat/5bfaa469-bdab-4123-830e-3361f3356eed#workflow-overview)
2. [核心角色定义](https://claude.ai/chat/5bfaa469-bdab-4123-830e-3361f3356eed#roles)
3. [阶段 0：需求澄清](https://claude.ai/chat/5bfaa469-bdab-4123-830e-3361f3356eed#phase-0)
4. [阶段 1：架构设计 (BLUEPRINT)](https://claude.ai/chat/5bfaa469-bdab-4123-830e-3361f3356eed#phase-1)
5. [阶段 2：代码实现](https://claude.ai/chat/5bfaa469-bdab-4123-830e-3361f3356eed#phase-2)
6. [阶段 3：代码审查](https://claude.ai/chat/5bfaa469-bdab-4123-830e-3361f3356eed#phase-3)
7. [阶段 4：反馈循环](https://claude.ai/chat/5bfaa469-bdab-4123-830e-3361f3356eed#phase-4)
8. [阶段 5：变更管理](https://claude.ai/chat/5bfaa469-bdab-4123-830e-3361f3356eed#phase-5)
9. [阶段 6：部署检查](https://claude.ai/chat/5bfaa469-bdab-4123-830e-3361f3356eed#phase-6)
10. [阶段 7：完成定义 (DoD)](https://claude.ai/chat/5bfaa469-bdab-4123-830e-3361f3356eed#phase-7)
11. [附录：模板示例](https://claude.ai/chat/5bfaa469-bdab-4123-830e-3361f3356eed#appendix)

---

## <a id="workflow-overview"></a>🔄 工作流概览

```
┌─────────────┐
│ User Request│
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ 0. 需求澄清          │ ← ARCHITECT 输出 REQUIREMENTS DOC
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ 1. 架构设计          │ ← ARCHITECT 输出 BLUEPRINT
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ 2. 代码实现          │ ← BUILDER 输出 CODE + TEST RESULTS
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ 3. 代码审查          │ ← REVIEWER 输出 REVIEW REPORT
└──────┬──────────────┘
       │
       ├─── PASS ───────────────┐
       │                        │
       └─── FAIL ───┐           │
                    │           │
       ┌────────────▼───────┐   │
       │ 4. 反馈循环         │   │
       │  (回到步骤 1 或 2)  │   │
       └────────────────────┘   │
                                │
       ┌────────────────────────▼──┐
       │ 5. 变更管理 (Git Commit)   │
       └────────────┬──────────────┘
                    │
       ┌────────────▼──────────┐
       │ 6. 部署检查            │
       └────────────┬──────────┘
                    │
       ┌────────────▼──────────┐
       │ 7. DoD 验证 ✅         │
       └───────────────────────┘
```

---

## <a id="roles"></a>👥 1. 核心角色定义

### 🧐 ARCHITECT (Claude Opus)

**职责范围**：

- 需求分析与用户故事编写
- 系统架构设计（模块划分、接口定义）
- 边缘情况（Edge Cases）推演
- 数据结构与算法设计
- 伪代码编写（核心逻辑）
- 错误处理策略制定
- 性能与安全约束定义

**严格禁止**：

- ❌ 编写具体的生产级代码实现（完整的 .py / .js / .java 文件）
- ❌ 直接修改 BUILDER 生成的代码
- ❌ 跳过 BLUEPRINT 直接指导 BUILDER

**输出目标**：

- `REQUIREMENTS.md`（需求澄清阶段）
- `BLUEPRINT.md`（架构设计阶段）
- `BLUEPRINT_v{X}.md`（迭代修订版本）

---

### ⚡ BUILDER (Gemini Flash)

**职责范围**：

- 将 BLUEPRINT 翻译为生产代码
- 实现测试用例
- 运行测试并报告结果
- 修复语法错误和环境配置问题
- 生成基础文档（docstrings, README）

**严格禁止**：

- ❌ 更改 BLUEPRINT 中的逻辑结构
- ❌ 自行优化算法（除非会导致 Crash）
- ❌ 修改命名规范或接口定义
- ❌ 跳过测试直接提交代码

**遇到蓝图问题时的正确行为**：

```
✅ 正确：输出 ERROR_REPORT.md 并请求 ARCHITECT 修改 BLUEPRINT
❌ 错误：自行猜测意图并修改逻辑
```

**输出目标**：

- 可运行的代码文件
- `TEST_RESULTS.md`（测试执行报告）
- 更新的 `README.md`（如有 API 变更）

---

### 🔍 REVIEWER (Claude Opus)

**职责范围**：

- 代码质量审查（可读性、可维护性）
- 安全漏洞检测（SQL 注入、XSS、硬编码密钥等）
- 性能瓶颈识别
- 测试覆盖率评估
- 文档完整性验证
- 与 BLUEPRINT 的一致性检查

**触发时机**：

- BUILDER 完成实现并通过自测后

**输出目标**：

- `REVIEW_REPORT.md`（包含 PASS/FAIL 和改进建议）

---

## <a id="phase-0"></a>📝 阶段 0：需求澄清

**执行者**：ARCHITECT  
**目标**：确保所有参与方对需求有统一理解，避免设计偏差。

### 输出文档：`REQUIREMENTS.md`

```markdown
# Requirements Document

## Project: [项目名称]
**Version**: 1.0  
**Date**: 2025-01-07  
**Stakeholder**: [用户名/团队名]

---

## 1. User Story

**作为** [角色/用户类型]  
**我希望** [功能描述]  
**以便** [业务价值/目标]

**示例**：
> 作为 API 用户，我希望能够通过 POST /users 创建新用户，以便快速注册账号。

---

## 2. Acceptance Criteria (验收标准)

- [ ] 标准 1：API 返回 201 状态码和用户 ID
- [ ] 标准 2：重复邮箱返回 409 错误
- [ ] 标准 3：响应时间 < 200ms (p95)

---

## 3. Functional Requirements (功能需求)

### 3.1 核心功能
- 功能点 1：用户注册
- 功能点 2：邮箱验证

### 3.2 输入/输出规范
**Input**:
{
  "email": "user@example.com",
  "password": "Secure123!",
  "name": "John Doe"
}

**Output (Success)**:
{
  "user_id": "uuid-1234",
  "created_at": "2025-01-07T10:00:00Z"
}

---

## 4. Non-Functional Requirements (非功能需求)

- **性能**：支持 1000 req/s
- **安全**：密码必须 bcrypt 加密，最少 12 位
- **可用性**：99.9% uptime
- **兼容性**：支持 Python 3.9+

---

## 5. Out of Scope (明确不包含)

- ❌ 社交登录（OAuth）
- ❌ 短信验证
- ❌ 管理员权限管理

---

## 6. Dependencies & Constraints

- **外部依赖**：PostgreSQL 14+, Redis 6+
- **时间约束**：需在 2 周内完成
- **预算约束**：使用开源组件

---

## 7. Risks & Assumptions

**风险**：
- 邮件服务商限流可能导致验证延迟

**假设**：
- 用户已有有效的邮箱地址
- 数据库连接稳定

---

## 8. Questions for Clarification

- Q1: 密码重置流程是否包含在本次需求？
- Q2: 是否需要支持国际化（i18n）？
```

**ARCHITECT 完成此文档后，需等待用户确认后再进入设计阶段。**

---

## <a id="phase-1"></a>🏗️ 阶段 1：架构设计 (BLUEPRINT)

**执行者**：ARCHITECT  
**输入**：已确认的 `REQUIREMENTS.md`  
**输出**：`BLUEPRINT.md`

### 📄 BLUEPRINT 标准模板

```markdown
# BLUEPRINT: [Feature Name]

**Version**: v1.0  
**Date**: 2025-01-07  
**Architect**: Claude Opus  
**Related Requirements**: REQUIREMENTS.md v1.0

---

## A. 文件变更清单 (File Tree)

project/
├── src/
│   ├── api/
│   │   ├── users.py          [CREATE] - User API endpoints
│   │   └── __init__.py       [MODIFY] - Register new router
│   ├── models/
│   │   └── user.py           [CREATE] - User data model
│   ├── services/
│   │   └── auth_service.py   [CREATE] - Authentication logic
│   └── utils/
│       └── validators.py     [MODIFY] - Add email validator
├── tests/
│   └── test_users.py         [CREATE] - User API tests
└── README.md                 [MODIFY] - Add API documentation

---

## B. 数据结构与接口 (Types & Interfaces)

### B.1 数据模型

# Python Type Hints (示例)
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str  # Min 12 chars, will be hashed
    name: str

class UserResponse(BaseModel):
    user_id: str
    email: EmailStr
    name: str
    created_at: datetime
    is_verified: bool

class UserInDB(UserResponse):
    hashed_password: str

### B.2 API 接口

POST /api/v1/users
Content-Type: application/json

Request Body: UserCreate
Response: 201 Created → UserResponse
          409 Conflict → {"error": "EMAIL_EXISTS"}
          400 Bad Request → {"error": "INVALID_INPUT"}

---

## C. 逻辑伪代码 (Pseudo-Code)

### C.1 用户注册流程

FUNCTION create_user(user_data: UserCreate) -> UserResponse:
    // Step 1: Validate input
    IF NOT is_valid_email(user_data.email):
        THROW ValidationError("INVALID_EMAIL")

    IF LENGTH(user_data.password) < 12:
        THROW ValidationError("PASSWORD_TOO_SHORT")

    // Step 2: Check for duplicates
    existing_user = database.query(User).filter(email == user_data.email).first()
    IF existing_user IS NOT NULL:
        THROW ConflictError("EMAIL_EXISTS", status=409)

    // Step 3: Hash password
    hashed_pw = bcrypt.hash(user_data.password)

    // Step 4: Create user record
    new_user = User(
        user_id = generate_uuid(),
        email = user_data.email,
        hashed_password = hashed_pw,
        name = user_data.name,
        created_at = current_timestamp(),
        is_verified = FALSE
    )

    // Step 5: Save to database
    TRY:
        database.add(new_user)
        database.commit()
    CATCH DatabaseError as e:
        database.rollback()
        THROW InternalServerError("DB_ERROR")

    // Step 6: Send verification email (async)
    email_service.send_verification(new_user.email, new_user.user_id)

    // Step 7: Return response
    RETURN UserResponse(
        user_id = new_user.user_id,
        email = new_user.email,
        name = new_user.name,
        created_at = new_user.created_at,
        is_verified = FALSE
    )
END FUNCTION

---

## D. 测试策略 (Test Strategy)

BUILDER 必须确保以下测试用例通过：

### D.1 成功场景

**Test Case 1: 正常创建用户**

Input:
  POST /api/v1/users
  {
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }

Expected Output:
  Status: 201
  Body: {
    "user_id": "<valid-uuid>",
    "email": "test@example.com",
    "name": "Test User",
    "created_at": "<iso-timestamp>",
    "is_verified": false
  }

Assertions:
  - Response status code is 201
  - user_id is valid UUID format
  - created_at is valid ISO timestamp
  - Database contains 1 user with email "test@example.com"

### D.2 失败场景

**Test Case 2: 重复邮箱**

Input:
  1. Create user with email "duplicate@example.com"
  2. Create another user with same email

Expected Output (2nd request):
  Status: 409
  Body: {"error": "EMAIL_EXISTS"}

**Test Case 3: 无效邮箱格式**

Input:
  {"email": "not-an-email", "password": "Pass123!", "name": "User"}

Expected Output:
  Status: 400
  Body: {"error": "INVALID_EMAIL"}

**Test Case 4: 密码过短**

Input:
  {"email": "test@example.com", "password": "short", "name": "User"}

Expected Output:
  Status: 400
  Body: {"error": "PASSWORD_TOO_SHORT"}

**Test Case 5: 数据库连接失败**

Scenario: Mock database to raise exception

Expected:
  Status: 500
  Body: {"error": "DB_ERROR"}
  Database state: No user created (rollback successful)

---

## E. 依赖声明 (Dependencies)

### E.1 外部依赖

# requirements.txt
fastapi==0.104.1
pydantic==2.5.0
bcrypt==4.1.1
psycopg2-binary==2.9.9
python-jose==3.3.0  # For JWT tokens
pytest==7.4.3
pytest-asyncio==0.21.1

### E.2 内部依赖

- @/config/database.py     → Database session management
- @/config/settings.py     → Environment variables
- @/utils/validators.py    → Email validation logic
- @/services/email_service.py → Email sending (assumed to exist)

### E.3 系统依赖

- PostgreSQL 14+ (with uuid-ossp extension)
- Redis 6+ (for session storage, future use)
- Python 3.9+

---

## F. 错误处理策略 (Error Handling)

### F.1 错误分类

| 错误类型 | HTTP 状态码 | 错误代码 | 处理方式 |
|---------|------------|---------|---------|
| 验证失败 | 400 | INVALID_EMAIL, PASSWORD_TOO_SHORT | 返回详细错误信息 |
| 重复资源 | 409 | EMAIL_EXISTS | 不泄露是否存在该邮箱 |
| 数据库错误 | 500 | DB_ERROR | 记录日志，返回通用错误 |
| 未知错误 | 500 | INTERNAL_ERROR | 记录完整堆栈，返回通用错误 |

### F.2 错误响应格式

{
  "error": "ERROR_CODE",
  "message": "Human-readable message",
  "details": {
    "field": "email",
    "reason": "Invalid format"
  },
  "request_id": "req-uuid-1234"
}

### F.3 重试策略

- 数据库连接失败：重试 3 次，间隔 100ms / 200ms / 400ms
- 邮件发送失败：记录到队列，稍后重试，不阻塞用户注册

---

## G. 性能约束 (Performance Constraints)

| 指标 | 目标值 | 测量方法 |
|-----|-------|---------|
| API 响应时间 (p50) | < 100ms | Load testing with 100 concurrent users |
| API 响应时间 (p95) | < 200ms | Load testing with 100 concurrent users |
| 数据库查询时间 | < 20ms | Query profiling with EXPLAIN ANALYZE |
| 内存使用 | < 512MB per worker | Monitor with process metrics |
| 并发支持 | 1000 req/s | Use locust or k6 for load testing |

### G.1 性能优化策略

- 在 `users.email` 字段上创建唯一索引
- 使用数据库连接池（最大 20 连接）
- 邮件发送异步化（不阻塞响应）

---

## H. 安全检查清单 (Security Checklist)

BUILDER 实现时必须确保：

- [ ] **输入验证**：使用 Pydantic 严格验证所有输入
- [ ] **SQL 注入防护**：使用 ORM 参数化查询（禁止字符串拼接）
- [ ] **密码存储**：使用 bcrypt，cost factor ≥ 12
- [ ] **敏感信息**：响应中不返回 `hashed_password`
- [ ] **速率限制**：使用 slowapi 限制注册为 10 次/分钟/IP
- [ ] **HTTPS**：生产环境强制 HTTPS（HSTS header）
- [ ] **日志脱敏**：日志中不记录密码原文或哈希
- [ ] **依赖扫描**：运行 `pip-audit` 检查已知漏洞

### H.1 禁止事项

# ❌ 禁止
password = request.json['password']
query = f"SELECT * FROM users WHERE email = '{email}'"  # SQL injection risk

# ✅ 正确
user_data = UserCreate(**request.json)  # Pydantic validation
user = db.query(User).filter(User.email == user_data.email).first()

---

## I. 部署配置 (Deployment Config)

### I.1 环境变量

# .env.example
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=<generate-with-openssl-rand>
ENVIRONMENT=production  # development | staging | production
LOG_LEVEL=INFO
EMAIL_API_KEY=<your-sendgrid-key>

### I.2 部署目标

- **Platform**: Docker容器部署到 AWS ECS / GCP Cloud Run
- **Database**: AWS RDS PostgreSQL (Multi-AZ)
- **Cache**: AWS ElastiCache Redis

### I.3 健康检查

GET /health
Response: 200 OK
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "version": "1.0.0"
}

---

## J. 回滚策略 (Rollback Strategy)

如果部署后发现问题：

1. **立即回滚**：使用 Docker 镜像标签回滚到上一版本
2. **数据库迁移回滚**：运行 `alembic downgrade -1`
3. **监控指标**：检查错误率是否恢复正常
4. **通知用户**：如果影响用户，发送状态页更新

---

## K. 文档要求 (Documentation)

BUILDER 必须更新以下文档：

### K.1 代码文档
- 每个函数必须有 docstring（Google 风格）
- 复杂逻辑添加行内注释

### K.2 API 文档
- 更新 README.md 的 API Endpoints 章节
- 添加 curl 示例

### K.3 数据库变更
- 在 `migrations/README.md` 记录新增的表结构

---

## L. 变更日志 (Change Log)

**v1.0 (2025-01-07)** - Initial design
- 定义用户注册 API
- 设计数据模型和安全策略
```

---

## <a id="phase-2"></a>⚙️ 阶段 2：代码实现

**执行者**：BUILDER  
**输入**：`BLUEPRINT.md`  
**输出**：代码文件 + `TEST_RESULTS.md`

### BUILDER 执行步骤

#### Step 1: Context Loading

```bash
# BUILDER 必须先读取以下文件
✓ .ai/PROTOCOL.md          # 本协议文档
✓ .ai/STYLE_GUIDE.md       # 代码风格指南（如有）
✓ BLUEPRINT.md             # 当前任务蓝图
✓ 项目现有代码结构
```

#### Step 2: Implementation Checklist

```markdown
- [ ] 创建 BLUEPRINT 中列出的所有文件
- [ ] 严格按照伪代码逻辑实现（不自行优化）
- [ ] 保留所有 TODO/FIXME 注释在代码中
- [ ] 为每个函数添加 docstring
- [ ] 实现所有测试用例（Section D）
- [ ] 确保所有依赖已在 requirements.txt 中声明
```

#### Step 3: Self-Test Execution

```bash
# BUILDER 必须运行测试并记录结果
pytest tests/ -v --cov=src --cov-report=term

# 输出示例
tests/test_users.py::test_create_user_success PASSED           [20%]
tests/test_users.py::test_duplicate_email PASSED               [40%]
tests/test_users.py::test_invalid_email FAILED                 [60%]  ← 需报告
tests/test_users.py::test_password_too_short PASSED            [80%]
tests/test_users.py::test_database_error PASSED                [100%]

Coverage: 87%
```

#### Step 4: Generate Documentation

```markdown
# BUILDER 必须更新以下文档

## README.md 新增内容：
### API Endpoints

#### POST /api/v1/users
Create a new user account.

**Request:**
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'

**Response (201):**
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2025-01-07T10:30:00Z",
  "is_verified": false
}
```

#### Step 5: Output TEST_RESULTS.md

```markdown
# Test Results Report

**Date**: 2025-01-07  
**Builder**: Gemini Flash  
**Blueprint Version**: v1.0

---

## Test Execution Summary

| Total Tests | Passed | Failed | Skipped | Coverage |
|------------|--------|--------|---------|----------|
| 5          | 4      | 1      | 0       | 87%      |

---

## Failed Tests

### ❌ Test: test_invalid_email
**File**: tests/test_users.py:45  
**Error**:
AssertionError: Expected status 400, got 500

**Root Cause Analysis**:
BLUEPRINT Section C.1 定义了验证逻辑，但未指定 Pydantic 验证失败时的异常处理。当前实现导致未捕获的 ValidationError 返回 500。

**Request to ARCHITECT**:
请在 BLUEPRINT Section F (错误处理策略) 中明确说明：
- Pydantic ValidationError 应如何映射到 HTTP 状态码
- 错误响应的具体格式

**Attempted Fix** (NOT IMPLEMENTED):
我尝试添加全局异常处理器，但不确定这是否符合架构意图，因此未提交代码。

---

## Passed Tests

✅ test_create_user_success  
✅ test_duplicate_email  
✅ test_password_too_short  
✅ test_database_error

---

## Code Coverage Report

| File | Statements | Missing | Coverage |
|------|-----------|---------|----------|
| src/api/users.py | 45 | 6 | 87% |
| src/models/user.py | 12 | 0 | 100% |
| src/services/auth_service.py | 28 | 8 | 71% |

**Uncovered Lines**:
- src/api/users.py:78-83 (异常处理分支)
- src/services/auth_service.py:42-49 (邮件发送错误处理)

---

## Deployment Readiness

- [x] All required files created
- [x] Dependencies documented in requirements.txt
- [ ] All tests passing (1 failure)
- [x] Documentation updated
- [x] No hardcoded secrets

**Status**: ⚠️ BLOCKED - Waiting for ARCHITECT clarification
```

---

## <a id="phase-3"></a>🔍 阶段 3：代码审查

**执行者**：REVIEWER  
**触发条件**：BUILDER 完成实现且测试通过率 ≥ 80%  
**输出**：`REVIEW_REPORT.md`

### 审查检查清单

```markdown
# Code Review Report

**Reviewer**: Claude Opus  
**Date**: 2025-01-07  
**Reviewed Commit**: abc123f  
**Blueprint Version**: v1.0

---

## Review Status: ✅ PASS / ⚠️ CONDITIONAL PASS / ❌ FAIL

**Overall Verdict**: ⚠️ CONDITIONAL PASS  
**Reason**: 需修复 1 个中危安全问题后可部署

---

## 1. Blueprint Compliance

| 检查项 | 状态 | 备注 |
|-------|------|------|
| 文件结构符合 Section A | ✅ | 所有文件已创建 |
| 数据模型符合 Section B | ✅ | Pydantic 模型正确 |
| 逻辑符合伪代码 Section C | ⚠️ | 第 78 行添加了额外的日志（可接受） |
| 测试覆盖 Section D | ✅ | 5/5 测试用例已实现 |
| 依赖符合 Section E | ✅ | 无未声明依赖 |

---

## 2. Security Review

### 🔴 HIGH Priority Issues

**无高危问题**

### 🟡 MEDIUM Priority Issues

**Issue #1: Rate Limiting 未实现**
- **Location**rc/api/users.py
- **Description**: BLUEPRINT Section H 要求速率限制为 10 次/分钟/IP，但代码中未实现
- **Impact**: 可能被暴力注册攻击
- **Recommendation**: 
  from slowapi import Limiter
  limiter = Limiter(key_func=get_remote_address)

  @app.post("/users")
  @limiter.limit("10/minute")
  async def create_user(...):
- **Required**: 是（在部署前修复）

### 🟢 LOW Priority Issues

**Issue #2: 日志脱敏不完整**
- **Location**: src/services/auth_service.py:56
- **Description**: 日志记录了完整的用户对象，可能包含敏感信息
- **Recommendation**: 使用 `user.email` 而非整个对象
- **Required**: 否（可后续优化）

---

## 3. Code Quality

### 3.1 Readability: ⭐⭐⭐⭐☆ (4/5)

**Strengths**:
- 函数命名清晰
- Docstring 完整
- 错误处理逻辑清晰

**Improvements**:
- `create_user` 函数可拆分为更小的子函数（如 `_validate_user_input`, `_check_duplicate`）

### 3.2 Maintainability: ⭐⭐⭐⭐☆ (4/5)

**Strengths**:
- 使用依赖注入（FastAPI Depends）
- 配置集中管理

**Improvements**:
- 魔法数字 `12`（密码最小长度）应提取到配置文件

### 3.3 Test Coverage: ⭐⭐⭐⭐☆ (87%）
**Missing Coverage**:
- src/api/users.py:78-83 (数据库回滚逻辑)

src/services/auth_service.py:42-49 (邮件发送失败处理)

Recommendation: 添加集成测试模拟数据库失败场景

4. Performance Review
指标目标 (BLUEPRINT Section G)实际测量状态API p50 延迟< 100ms85ms✅API p95 延迟< 200ms178ms✅数据库查询时间< 20ms12ms✅并发支持1000 req/s未测试⚠️
Action Required: 运行负载测试验证并发性能

5. Documentation Review

 README.md 已更新 API 文档
 所有公共函数有 docstring
 .env.example 包含所有必需变量
 缺少数据库迁移文档（如使用 Alembic）


6. Deployment Checklist

 健康检查端点已实现 (/health)
 环境变量已文档化
 Docker 镜像构建文件 (Dockerfile) 缺失
 Kubernetes/ECS 部署配置缺失


7. Final Recommendation
✅ Approved for Deployment AFTER:

修复 Issue #1（实现速率限制）- 预计 30 分钟
添加负载测试（验证 1000 req/s 目标）- 预计 1 小时
创建 Dockerfile - 预计 30 分钟

📋 Post-Deployment Tasks (可延后):

优化日志脱敏（Issue #2）
增加测试覆盖率到 95%
添加数据库迁移文档


8. Comparison with BLUEPRINT
Deviations from BLUEPRINT:

Line 78: 添加了 logger.info(f"User created: {user.email}")

Assessment: 可接受，有助于调试


Error handling: 使用了 HTTPException 而非自定义异常类

Assessment: 符合 FastAPI 最佳实践，BLUEPRINT 未明确要求自定义异常



Verdict: 偏差均在合理范围内

---

## <a id="phase-4"></a>🔄 阶段 4：反馈循环

当 BUILDER 或 REVIEWER 发现问题时，使用此流程。

### 4.1 BUILDER 错误报告模板
````markdown
# Error Report

**Reporter**: Gemini Flash (BUILDER)  
**Date**: 2025-01-07  
**Blueprint Version**: v1.0  
**Error ID**: ERR-20250107-001

---

## Error Type
- [ ] SYNTAX_ERROR (代码无法运行)
- [x] LOGIC_ERROR (逻辑无法实现)
- [ ] TEST_FAILURE (测试无法通过)
- [ ] DEPENDENCY_MISSING (缺少依赖)
- [ ] BLUEPRINT_AMBIGUITY (蓝图描述不清)

---

## Error Location

**File**: src/api/users.py  
**Line**: 45  
**Function**: create_user()

---

## Error Description

BLUEPRINT Section C.1 伪代码第 15 行：
````
IF existing_user IS NOT NULL:
    THROW ConflictError("EMAIL_EXISTS", status=409)
问题：ConflictError 在 BLUEPRINT Section B 的类型定义中未定义，也未在 Section F 的错误处理策略中说明如何实现此异常类。

Current Behavior
我当前使用了 FastAPI 的 HTTPException：
pythonif existing_user:
    raise HTTPException(status_code=409, detail={"error": "EMAIL_EXISTS"})
````

但不确定这是否符合架构意图。

---

## Error Message / Stack Trace
````
N/A (这是设计阶段问题，代码可以运行)
````

---

## Attempted Fix

我查阅了 FastAPI 文档，发现有两种实现方式：
1. 使用内置的 `HTTPException`（当前实现）
2. 创建自定义异常类 + 全局异常处理器

但 BLUEPRINT 未明确指定，我不敢自行决定。

---

## Request to ARCHITECT

请在 BLUEPRINT v1.1 中补充：

### Option A: 明确使用 HTTPException
在 Section F 中添加：
````
所有 API 错误使用 fastapi.HTTPException，格式为：
HTTPException(status_code=..., detail={"error": "ERROR_CODE", "message": "..."})
````

### Option B: 定义自定义异常类
在 Section B 中添加异常类定义，在 Section F 中说明如何注册全局处理器。

---

## Impact

- **Blocker**: 否（代码可运行）
- **Affects Tests**: 否
- **Affects Security**: 否
- **Affects Performance**: 否

---

## Additional Context

这个问题也影响 BLUEPRINT Section C.1 中的其他异常：
- `ValidationError`
- `InternalServerError`

建议统一定义异常处理策略。
````

### 4.2 ARCHITECT 响应流程

收到错误报告后，ARCHITECT 必须：

1. **分析问题**：确认是 BLUEPRINT 的问题还是 BUILDER 的误解
2. **生成修订版**：输出 `BLUEPRINT_v1.1.md`（只包含变更部分）
3. **不直接修改代码**：永远通过蓝图指导 BUILDER

#### 示例：BLUEPRINT_v1.1.md
````markdown
# BLUEPRINT v1.1 - Error Handling Clarification

**Previous Version**: v1.0  
**Date**: 2025-01-07  
**Change Summary**: 明确异常处理实现方式

---

## Changes

### Modified Section: F. 错误处理策略

**在 Section F.1 后添加以下内容：**

#### F.1.1 异常实现规范

所有 API 错误使用 FastAPI 内置的 `HTTPException`，格式如下：
```python
from fastapi import HTTPException

# 示例：409 冲突错误
raise HTTPException(
    status_code=409,
    detail={
        "error": "EMAIL_EXISTS",
        "message": "Email address already registered",
        "request_id": str(request_id)
    }
)
```

**映射表**：

| BLUEPRINT 中的异常 | 实现方式 |
|-------------------|---------|
| `ConflictError("EMAIL_EXISTS", status=409)` | `HTTPException(status_code=409, detail={"error": "EMAIL_EXISTS", ...})` |
| `ValidationError("INVALID_EMAIL")` | 由 Pydantic 自动处理，FastAPI 返回 422 |
| `InternalServerError("DB_ERROR")` | `HTTPException(status_code=500, detail={"error": "DB_ERROR", ...})` |

**重要**：不需要创建自定义异常类。

---

## Updated Pseudo-Code

### Section C.1 第 10-12 行修改为：
````
IF existing_user IS NOT NULL:
    RAISE HTTPException(
        status_code=409,
        detail={"error": "EMAIL_EXISTS", "message": "Email already registered"}
    )
````

---

## Action for BUILDER

请根据此修订版更新以下文件：
1. src/api/users.py (已按此实现，无需修改)
2. tests/test_users.py (确认测试用例验证了 detail 字段格式)
````

### 4.3 循环终止条件

满足以下任一条件时终止循环：
- ✅ 所有测试通过 + REVIEWER 批准
- ❌ 循环次数超过 5 次（升级为人工介入）
- ⏸️ 用户主动暂停

---

## <a id="phase-5"></a>📝 阶段 5：变更管理

**执行者**：BUILDER  
**目标**：确保所有变更可追溯、可回滚

### 5.1 Blueprint 版本控制

每次修改 BLUEPRINT 时，ARCHITECT 必须：
````markdown
# BLUEPRINT Version History

## v1.2 (2025-01-08)
**Changes**:
- Added rate limiting configuration (Section H)
- Updated deployment config for Docker (Section I)

**Backward Compatibility**: Yes  
**Migration Required**: No

---

## v1.1 (2025-01-07)
**Changes**:
- Clarified exception handling (Section F)

**Backward Compatibility**: Yes  
**Migration Required**: No

---

## v1.0 (2025-01-07)
- Initial design
````

### 5.2 Git Commit 规范

BUILDER 在提交代码时必须遵循 [Conventional Commits](https://www.conventionalcommits.org/)：
````bash
# 格式
<type>(<scope>): <subject>

[optional body]

Blueprint: v1.1
Reviewed-By: REVIEWER
````

**Type 类型**：
- `feat`: 新功能（对应 BLUEPRINT 新增功能）
- `fix`: 修复 bug（对应 ERROR_REPORT）
- `refactor`: 重构（需 ARCHITECT 批准）
- `test`: 添加测试
- `docs`: 文档更新
- `chore`: 构建/工具变更

**示例**：
````bash
feat(api): implement user registration endpoint

- Implement POST /api/v1/users according to BLUEPRINT v1.0 Section C.1
- Add email validation with Pydantic
- Add bcrypt password hashing
- Implement duplicate email check

Tests: 5/5 passed
Coverage: 87%
Blueprint: v1.0
Reviewed-By: Claude Opus (REVIEWER)
````

### 5.3 分支策略
````
main (生产环境)
  ↑
  └─ release/v1.0 (预发布)
       ↑
       └─ develop (开发主线)
            ↑
            ├─ feature/user-registration (BUILDER 工作分支)
            └─ feature/email-verification
````

**规则**：
- BUILDER 在 `feature/*` 分支工作
- 通过 REVIEWER 审查后合并到 `develop`
- 用户验收通过后合并到 `release/*`
- 最终部署后合并到 `main`

---

## <a id="phase-6"></a>🚀 阶段 6：部署检查

**执行者**：BUILDER + ARCHITECT  
**目标**：确保代码可安全部署到生产环境

### 6.1 Pre-Deployment Checklist
````markdown
# Deployment Readiness Checklist

**Feature**: User Registration API  
**Version**: v1.0  
**Target Environment**: Production  
**Deployment Date**: 2025-01-08

---

## Code Quality
- [x] All tests passing (100%)
- [x] Code coverage ≥ 80% (actual: 87%)
- [x] REVIEWER approved
- [x] No critical/high security issues

## Configuration
- [x] Environment variables documented in .env.example
- [x] Secrets stored in vault (not in code)
- [x] Database migration scripts prepared
- [x] Rollback plan documented

## Infrastructure
- [x] Docker image built and tagged
- [x] Health check endpoint responding
- [x] Load balancer configured
- [x] Auto-scaling policies set

## Monitoring
- [x] Logging configured (structured JSON logs)
- [x] Metrics exported (Prometheus format)
- [x] Alerts configured (error rate > 5%)
- [x] Dashboard created (Grafana)

## Documentation
- [x] API documentation updated
- [x] Runbook created (for on-call engineers)
- [x] Changelog updated
- [x] Release notes prepared

## Communication
- [x] Stakeholders notified
- [ ] Maintenance window scheduled (if needed)
- [x] Rollback owner assigned

---

## Risk Assessment

**Risk Level**: 🟢 LOW

**Potential Issues**:
1. Email service rate limiting → Mitigation: Queue-based retry
2. Database load spike → Mitigation: Connection pooling + read replica

**Rollback Trigger**:
- Error rate > 5% for 5 minutes
- p95 latency > 500ms for 5 minutes
- Database CPU > 80% for 10 minutes
````

### 6.2 部署脚本示例
````bash
#!/bin/bash
# deploy.sh - Generated by BUILDER based on BLUEPRINT Section I

set -e  # Exit on error

echo "🚀 Starting deployment of user-registration v1.0"

# Step 1: Build Docker image
echo "📦 Building Docker image..."
docker build -t myapp:v1.0 .

# Step 2: Run tests in container
echo "🧪 Running tests..."
docker run --rm myapp:v1.0 pytest tests/ -v

# Step 3: Database migration
echo "💾 Running database migrations..."
docker run --rm \
  -e DATABASE_URL=$PROD_DATABASE_URL \
  myapp:v1.0 \
  alembic upgrade head

# Step 4: Deploy to ECS
echo "☁️ Deploying to AWS ECS..."
aws ecs update-service \
  --cluster production \
  --service myapp \
  --force-new-deployment \
  --desired-count 3

# Step 5: Wait for health checks
echo "⏳ Waiting for health checks..."
for i in {1..30}; do
  STATUS=$(curl -s https://api.example.com/health | jq -r '.status')
  if [ "$STATUS" = "healthy" ]; then
    echo "✅ Deployment successful!"
    exit 0
  fi
  sleep 10
done

echo "❌ Health check failed, initiating rollback..."
./rollback.sh
exit 1
````

### 6.3 监控指标

ARCHITECT 在 BLUEPRINT 中定义，BUILDER 实现：
````python
# src/monitoring/metrics.py
from prometheus_client import Counter, Histogram

# 业务指标
user_registrations = Counter(
    'user_registrations_total',
    'Total number of user registrations',
    ['status']  # success, failure
)

# 性能指标
api_latency = Histogram(
    'api_request_duration_seconds',
    'API request latency',
    ['endpoint', 'method']
)

# 使用示例
user_registrations.labels(status='success').inc()
api_latency.labels(endpoint='/users', method='POST').observe(0.125)
````

---

## <a id="phase-7"></a>✅ 阶段 7：完成定义 (Definition of Done)

**目的**：明确一个任务何时被认为完成，避免返工。

### DoD Checklist

一个功能被认为完成，当且仅当：

#### ✅ ARCHITECT 层面

- [ ] REQUIREMENTS.md 已编写并经用户确认
- [ ] BLUEPRINT.md 包含所有必需章节（A-K）
- [ ] 边缘情况已在伪代码中体现
- [ ] 性能和安全约束已明确定义
- [ ] 测试策略覆盖成功和失败场景

#### ✅ BUILDER 层面

- [ ] 所有文件按 BLUEPRINT Section A 创建
- [ ] 代码逻辑严格符合 Section C 伪代码
- [ ] 所有测试用例（Section D）通过
- [ ] 代码覆盖率 ≥ 80%
- [ ] 所有函数有完整的 docstring
- [ ] 无 `TODO` 或 `FIXME` 注释（或已记录到 Issue）
- [ ] 依赖已在 requirements.txt 声明
- [ ] README.md 已更新（如有 API 变更）
- [ ] 符合项目 Style Guide

#### ✅ REVIEWER 层面

- [ ] 无高危或中危安全问题（或已修复）
- [ ] 性能指标满足 BLUEPRINT Section G 约束
- [ ] 代码质量评分 ≥ 4/5
- [ ] 文档与代码一致
- [ ] 偏离 BLUEPRINT 的部分已评估并接受

#### ✅ 部署层面

- [ ] 健康检查端点正常响应
- [ ] 环境变量已文档化（.env.example）
- [ ] Docker 镜像构建成功
- [ ] 数据库迁移脚本已测试
- [ ] 监控指标已配置
- [ ] 告警规则已设置
- [ ] Runbook 已编写

#### ✅ 用户验收层面

- [ ] 所有验收标准（REQUIREMENTS.md Section 2）通过
- [ ] 在 staging 环境手动测试通过
- [ ] 性能测试达到目标（如 1000 req/s）
- [ ] 无阻塞性 bug

### DoD 验证工具
````bash
#!/bin/bash
# check-dod.sh - 自动化 DoD 检查

echo "🔍 Checking Definition of Done..."

# Check 1: Blueprint exists
if [ ! -f "BLUEPRINT.md" ]; then
  echo "❌ BLUEPRINT.md not found"
  exit 1
fi

# Check 2: Tests pass
pytest tests/ -v || { echo "❌ Tests failed"; exit 1; }

# Check 3: Coverage
coverage run -m pytest tests/
COVERAGE=$(coverage report | tail -1 | awk '{print $4}' | sed 's/%//')
if [ "$COVERAGE" -lt 80 ]; then
  echo "❌ Coverage ($COVERAGE%) < 80%"
  exit 1
fi

# Check 4: Security scan
pip-audit || { echo "❌ Security vulnerabilities found"; exit 1; }

# Check 5: Style check
flake8 src/ || { echo "❌ Style check failed"; exit 1; }

echo "✅ All DoD checks passed!"
````

---

## <a id="appendix"></a>📚 附录：完整示例

### 示例 1：完整工作流演示

假设用户请求：**"Create an API to register users with email verification"**

#### Step 0: ARCHITECT 生成 REQUIREMENTS.md
````markdown
# Requirements Document

## 1. User Story
作为 API 用户，我希望能够通过 POST /users 创建新用户并接收验证邮件。

## 2. Acceptance Criteria
- [ ] API 返回 201 和用户 ID
- [ ] 发送验证邮件到用户邮箱
- [ ] 重复邮箱返回 409 错误

...（完整内容见 Phase 0）
````

**用户确认**：同意需求

---

#### Step 1: ARCHITECT 生成 BLUEPRINT.md
````markdown
# BLUEPRINT: User Registration v1.0

## A. File Tree
project/
├── src/api/users.py [CREATE]
...

## C. Pseudo-Code
FUNCTION create_user(...):
  ...

...（完整内容见 Phase 1）
````

**传递给**：BUILDER

---

#### Step 2: BUILDER 实现代码
````python
# src/api/users.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import bcrypt

router = APIRouter()

@router.post("/users", status_code=201)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    # Step 1: Validate (Pydantic handles this)
    
    # Step 2: Check duplicates
    existing = db.query(User).filter(
        User.email == user_data.email
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=409,
            detail={"error": "EMAIL_EXISTS"}
        )
    
    # Step 3: Hash password
    hashed = bcrypt.hashpw(
        user_data.password.encode(),
        bcrypt.gensalt(rounds=12)
    )
    
    # Step 4-5: Create and save
    new_user = User(
        user_id=str(uuid.uuid4()),
        email=user_data.email,
        hashed_password=hashed.decode(),
        name=user_data.name,
        created_at=datetime.utcnow(),
        is_verified=False
    )
    
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail={"error": "DB_ERROR"}
        )
    
    # Step 6: Send email (async)
    background_tasks.add_task(
        send_verification_email,
        new_user.email,
        new_user.user_id
    )
    
    # Step 7: Return response
    return UserResponse(
        user_id=new_user.user_id,
        email=new_user.email,
        name=new_user.name,
        created_at=new_user.created_at,
        is_verified=False
    )
````

**运行测试**：5/5 passed  
**生成**：TEST_RESULTS.md

---

#### Step 3: REVIEWER 审查
````markdown
# Review Report

## Status: ✅ PASS

## Security: No issues
## Performance: Meets targets (p95 = 178ms)
## Code Quality: 4/5

## Recommendation: Approved for deployment
````

---

#### Step 4: 无需反馈循环（一次通过）

---

#### Step 5: BUILDER 提交代码
````bash
git commit -m "feat(api): implement user registration endpoint

- Implement POST /api/v1/users per BLUEPRINT v1.0
- Add bcrypt password hashing
- Add duplicate email check
- Tests: 5/5 passed, Coverage: 87%

Blueprint: v1.0
Reviewed-By: Claude Opus"
````

---

#### Step 6: 部署检查
````bash
./check-dod.sh  # ✅ All checks passed
./deploy.sh     # 🚀 Deployed to production
````

---

#### Step 7: DoD 验证
````markdown
✅ ARCHITECT: Blueprint complete
✅ BUILDER: Code implemented, tests passed
✅ REVIEWER: Approved
✅ Deployment: Health checks passing
✅ User: Acceptance criteria met
````

**任务完成！** 🎉

---

## 🎯 总结

### 核心原则

1. **职责分离**：ARCHITECT 设计，BUILDER 执行，REVIEWER 把关
2. **文档驱动**：所有决策必须体现在文档中
3. **可追溯性**：每个变更都有版本和理由
4. **质量门禁**：7 个阶段确保工程质量

### 协议优势

- ✅ 避免 AI 胡乱修改代码
- ✅ 确保设计与实现一致
- ✅ 提供完整的审计追踪
- ✅ 支持团队协作和知识传承
- ✅ 降低技术债务

### 使用建议

1. **小任务**：可省略 REVIEWER，直接从 BUILDER 到部署
2. **大项目**：严格执行所有 7 个阶段
3. **紧急修复**：可跳过 Phase 0，直接从 BLUEPRINT 开始
4. **学习阶段**：先用简单任务熟悉流程

---

**版本**：ACP v2.0  
**最后更新**：2025-01-07  
**维护者**：Claude Opus (ARCHITECT) + Gemini Flash (BUILDER)

---

这个协议文档已经非常完整了！你可以将它保存为 `.ai/PROTOCOL.md`，然后在每次任务开始时让 AI 读取这个文件作为上下文。需要我再补充什么吗？你能不能直接输出md文档给我？11:08AI Collaborative Protocol (ACP) v2.0Document # 🤖 AI Collaborative Protocol (ACP) v2.0

> **A production-grade protocol for AI-driven software development**  
> Architect: Claude Opus | Builder: Gemini Flash | Reviewer: Claude Opus

---

## 📋 Table of Contents

1. [工作流概览](#workflow-overview)
2Continue11:11我已经为你创建了完整的 Markdown 文档！你可以直接从右侧的 Artifact 区域下载或复制这个文档。
这个文档包含了完整的 ACP v2.0 协议，涵盖了：

7 个完整的工作流阶段
3 个角色的详细定义
所有必需的文档模板
实际的示例代码和流程演示


```
