# ACP v2.0 角色分配与使用指南

> **适用于**: Claude Code + Anthropic Console + 多模型协作环境  
> **协议版本**: ACP v2.0  
> **最后更新**: 2025-01-07

🧠 阶段一：架构与规划 (The Architect)模型: Claude 3 Opus场景: 你有一个模糊的想法，需要变成可执行的文档。👉 发送指令:Markdown@Claude-Opus
**ACTIVATE: ARCHITECT MODE**

请读取 `.ai/PROTOCOL.md`。
当前任务目标：[简单描述你的需求，例如：为咖啡店系统增加库存预警功能]

请执行 **Phase 1**：
1. 分析需求。
2. 编写逻辑伪代码 (Pseudo-code)。
3. 定义数据接口。
4. 输出为 Markdown 格式的 **BLUEPRINT**。

**注意**：严禁直接写实现代码，只写逻辑蓝图。
⚡ 阶段二：代码构建 (The Builder)模型: Gemini 1.5 Flash场景: 蓝图已经写好，需要快速生成大量代码。👉 发送指令:Markdown@Gemini-Flash
**ACTIVATE: BUILDER MODE**

请读取 `.ai/PROTOCOL.md` 和刚才生成的 `BLUEPRINT`。
当前任务目标：将蓝图“编译”为代码。

请执行 **Phase 2**：
1. **Context**: 理解 BluePrint 中的伪代码和 `.ai/STYLE_GUIDE.md`。
2. **Implement**: 严格翻译伪代码为目标语言（Python/TS等）。
   - 🚫 禁止修改逻辑。
   - 🚫 禁止自我发挥优化算法。
   - ✅ 保持所有 TODO 注释。
3. **Output**: 直接输出完整的代码文件内容。

🛡️ 阶段三：质量审查 (The Reviewer)模型: Claude 3 Opus场景: 代码生成了，但不确定能不能用，有没有 Bug。👉 发送指令:Markdown@Claude-Opus

**ACTIVATE: REVIEWER MODE**

请读取 `BLUEPRINT` 和 Builder 生成的代码。
当前任务目标：验收代码质量。

请执行 **Phase 3**：
1. **Match Check**: 代码是否忠实还原了伪代码的逻辑？
2. **Safety Check**: 有没有明显的安全漏洞？
3. **Verdict**: 给出 `PASS` 或 `FAIL`。如果是 FAIL，请指出具体偏离了蓝图的哪一部分。

🛠️ 紧急干预 (Rescue Commands)当模型“不听话”时，使用这些简短有力的指令将其拉回正轨。现象问题诊断🔧 修正指令 (Copy This)Opus 开始写代码了大脑试图干双手的活，浪费 Token 且易出错。⛔ STOP. You are the ARCHITECT. Do not write implementation code. Only output Pseudo-code in the Blueprint.Flash 改了逻辑Flash 产生了幻觉，觉得自己能优化逻辑。⛔ STOP. You are the BUILDER. Strict adherence to the Blueprint is required. Do not change the logic. Re-write exactly as specified.Flash 偷懒省略代码输出 // ...rest of code⛔ Do not be lazy. Output the FULL content of the file. I need to copy-paste it.Opus 无论如何都无法理解需求上下文太乱🧹 Clear Context. Let's start over. Read .ai/PROTOCOL.md again.---

## 📋 目录

1. [快速开始](#quick-start)
2. [角色切换指南](#role-switching)
3. [场景化 Prompt 模板](#scenario-prompts)
4. [工作流最佳实践](#best-practices)
5. [常见问题排查](#troubleshooting)

---

## <a id="quick-start"></a>🚀 快速开始

### 前置准备

1. **在项目根目录创建 `.ai/` 文件夹**
   ```bash
   mkdir -p .ai
   ```

2. **保存协议文档**
   ```bash
   # 将 ACP v2.0 协议保存为
   .ai/PROTOCOL.md
   
   # 可选：保存代码风格指南
   .ai/STYLE_GUIDE.md
   ```

3. **配置模型访问**
   - Claude Opus: 架构设计 + 代码审查
   - Gemini Flash: 代码实现
   - (可选) Claude Sonnet: 快速迭代场景

---

## <a id="role-switching"></a>🔄 角色切换指南

### 基础工作流

```
用户需求 → ARCHITECT (Opus) → BUILDER (Flash) → REVIEWER (Opus) → 部署
```

### 模型选择建议

| 角色 | 推荐模型 | 备用模型 | 原因 |
|-----|---------|---------|------|
| ARCHITECT | Claude Opus | Claude Sonnet 4 | 复杂推理、架构设计能力强 |
| BUILDER | Gemini Flash | Claude Haiku | 编码速度快、成本低 |
| REVIEWER | Claude Opus | Claude Sonnet 4 | 安全审查、代码质量把控 |

---

## <a id="scenario-prompts"></a>📝 场景化 Prompt 模板

### 场景 0: 需求澄清阶段 (可选)

**适用情况**: 需求不清晰，需要先和用户确认

**使用模型**: Claude Opus

```markdown
@Claude-Opus

你好，我是项目的产品经理。请阅读以下文件：
- `.ai/PROTOCOL.md`

你现在的角色是 **ARCHITECT**，正在执行 **Phase 0: 需求澄清**。

我的初步需求是：
[用户粗略描述需求，例如：我想做一个用户注册系统]

请按照 PROTOCOL 中的 `REQUIREMENTS.md` 模板，帮我：
1. 编写完整的用户故事（User Story）
2. 列出验收标准（Acceptance Criteria）
3. 识别功能需求和非功能需求
4. 明确哪些不在本次范围内（Out of Scope）
5. 提出需要我澄清的问题（Questions for Clarification）

输出格式：严格按照 Phase 0 的 REQUIREMENTS.md 模板。
语言：用中文输出，但代码示例用英文。
```

**预期输出**: 完整的 `REQUIREMENTS.md` 文档

---

### 场景 1: 架构设计阶段 (核心)

**适用情况**: 需求已明确，开始设计

**使用模型**: Claude Opus

```markdown
@Claude-Opus

请阅读以下文件：
- `.ai/PROTOCOL.md`
- `REQUIREMENTS.md` (如果有的话)

你现在的角色是 **ARCHITECT**，正在执行 **Phase 1: 架构设计**。

我的需求是：
[详细的需求描述，或者引用已确认的 REQUIREMENTS.md]

请严格按照 PROTOCOL 中的 **BLUEPRINT 模板** 输出设计文档，必须包含：

**必须章节 (A-L)**:
- A. 文件变更清单 (File Tree)
- B. 数据结构与接口 (Types & Interfaces)
- C. 逻辑伪代码 (Pseudo-Code) ← 这是最重要的部分
- D. 测试策略 (Test Strategy)
- E. 依赖声明 (Dependencies)
- F. 错误处理策略 (Error Handling)
- G. 性能约束 (Performance Constraints)
- H. 安全检查清单 (Security Checklist)
- I. 部署配置 (Deployment Config)
- J. 回滚策略 (Rollback Strategy)
- K. 文档要求 (Documentation)
- L. 变更日志 (Change Log)

**重要规则**:
1. ❌ 不要编写具体的生产代码实现（如完整的 .py 文件）
2. ✅ 只写伪代码（Pseudo-Code），让 BUILDER 去翻译
3. ✅ 明确定义所有接口和数据结构
4. ✅ 考虑边缘情况（Edge Cases）

输出格式：Markdown 文档，可以直接保存为 `BLUEPRINT.md`
语言：用中文描述，代码和接口定义用英文
```

**预期输出**: 完整的 `BLUEPRINT.md` 文档（约 500-2000 行）

**检查清单**:
- [ ] 伪代码是否清晰？能否让 BUILDER 直接翻译？
- [ ] 测试用例是否覆盖成功和失败场景？
- [ ] 错误处理是否明确定义？
- [ ] 性能指标是否量化？

---

### 场景 2: 代码实现阶段 (核心)

**适用情况**: BLUEPRINT 已完成，开始编码

**使用模型**: Gemini Flash (推荐) 或 Claude Haiku

#### 方式 A: 在 Claude Code CLI 中执行

```bash
# 在项目目录下
claude-code --model gemini-flash
```

然后在 Claude Code 的对话中输入：

```markdown
请阅读以下文件：
- `.ai/PROTOCOL.md`
- `BLUEPRINT.md` (刚才 Claude 生成的)
- 项目现有代码结构

你现在的角色是 **BUILDER**，正在执行 **Phase 2: 代码实现**。

请严格按照 PROTOCOL 中的 **BUILDER 执行步骤** 进行：

**Step 1: Context Loading**
确认已读取所有必要文件。

**Step 2: Implementation**
按照 BLUEPRINT Section C 的伪代码逻辑编写代码。
重要：
- ❌ 不要自作主张修改逻辑
- ❌ 不要"优化"算法（除非会导致 Crash）
- ✅ 严格翻译伪代码
- ✅ 保留所有 TODO/FIXME 注释

**Step 3: Self-Test**
实现所有 BLUEPRINT Section D 的测试用例，并运行测试。

**Step 4: Documentation**
更新 README.md（如有 API 变更）。

**Step 5: Report**
输出 `TEST_RESULTS.md`，包括：
- 测试执行摘要
- 失败的测试（如有）
- 代码覆盖率报告
- 对 ARCHITECT 的问题（如有）

**如果遇到 BLUEPRINT 有问题**：
❌ 不要自己猜测意图
✅ 输出 `ERROR_REPORT.md` 并请求 ARCHITECT 修改

用中文总结回复，但代码用英文。
```

#### 方式 B: 在 Anthropic Console / API 中执行

```markdown
@Gemini-Flash

[同上的 Prompt...]

额外要求：
- 一次性生成所有文件的代码
- 如果代码太长，分多个回复输出
- 每个文件前用注释标注文件路径
```

**预期输出**: 
1. 所有代码文件的完整实现
2. `TEST_RESULTS.md` 报告

---

### 场景 3: 代码审查阶段

**适用情况**: BUILDER 完成实现，需要质量把关

**使用模型**: Claude Opus

```markdown
@Claude-Opus

请阅读以下文件：
- `.ai/PROTOCOL.md`
- `BLUEPRINT.md`
- BUILDER 生成的所有代码文件
- `TEST_RESULTS.md`

你现在的角色是 **REVIEWER**，正在执行 **Phase 3: 代码审查**。

请按照 PROTOCOL 中的 **审查检查清单** 进行全面审查：

**审查维度**:
1. Blueprint Compliance（是否符合蓝图）
2. Security Review（安全审查）
3. Code Quality（代码质量）
4. Performance Review（性能评估）
5. Documentation Review（文档完整性）
6. Deployment Checklist（部署就绪度）

**输出格式**: 
按照 PROTOCOL 的 `REVIEW_REPORT.md` 模板输出，必须包含：
- Overall Verdict: ✅ PASS / ⚠️ CONDITIONAL PASS / ❌ FAIL
- 具体问题列表（按优先级分类）
- 改进建议
- 是否批准部署

语言：用中文，但代码建议用英文。
```

**预期输出**: `REVIEW_REPORT.md` 文档

---

### 场景 4: 反馈循环（如有问题）

**适用情况**: BUILDER 或 REVIEWER 发现了 BLUEPRINT 的问题

**使用模型**: Claude Opus

```markdown
@Claude-Opus

你是 **ARCHITECT**。

BUILDER 报告了以下问题：
[粘贴 ERROR_REPORT.md 的内容]

请分析问题，并输出 **BLUEPRINT 的修订版**（如 `BLUEPRINT_v1.1.md`）。

要求：
1. 只输出变更的部分（不要重复整个文档）
2. 明确标注版本号和变更摘要
3. 更新相关的章节（如 Section C, F 等）
4. ❌ 不要直接修改代码

输出格式：
# BLUEPRINT v1.1 - [变更摘要]

## Changes
### Modified Section: [章节名]
[具体变更内容]

## Action for BUILDER
[指导 BUILDER 如何修改]
```

**预期输出**: `BLUEPRINT_v1.1.md` 修订文档

然后，回到 **场景 2**，让 BUILDER 根据新蓝图重新实现。

---

### 场景 5: 快速迭代（可选）

**适用情况**: 小改动、bug 修复，不需要完整流程

**使用模型**: Claude Sonnet 4

```markdown
@Claude-Sonnet

这是一个快速修复任务，不需要完整的 BLUEPRINT。

背景：
- 现有代码：[文件路径]
- 问题：[描述 bug 或需求]

请直接：
1. 分析问题
2. 提供修复代码
3. 说明测试方法

不需要生成 BLUEPRINT，但请确保：
- 符合现有代码风格
- 不破坏现有功能
- 添加必要的注释
```

---

## <a id="best-practices"></a>💡 工作流最佳实践

### 1. 文件组织

```
project/
├── .ai/
│   ├── PROTOCOL.md           # ACP v2.0 协议（必需）
│   ├── STYLE_GUIDE.md        # 代码风格指南（可选）
│   └── sessions/             # 保存每次会话的文档
│       ├── 2025-01-07_user-registration/
│       │   ├── REQUIREMENTS.md
│       │   ├── BLUEPRINT.md
│       │   ├── BLUEPRINT_v1.1.md
│       │   ├── TEST_RESULTS.md
│       │   ├── REVIEW_REPORT.md
│       │   └── ERROR_REPORT.md
│       └── 2025-01-08_email-verification/
│           └── ...
├── src/
│   └── [你的代码]
└── tests/
    └── [测试代码]
```

### 2. 版本控制策略

```bash
# 创建功能分支
git checkout -b feature/user-registration

# BUILDER 提交代码时使用规范格式
git commit -m "feat(api): implement user registration endpoint

- Implement POST /api/v1/users per BLUEPRINT v1.0
- Add bcrypt password hashing
- Tests: 5/5 passed, Coverage: 87%

Blueprint: v1.0
Reviewed-By: Claude Opus"
```

### 3. 多轮对话技巧

**在 Claude Code 中**:
```bash
# 保持上下文连续性
# 不要关闭会话，所有 AI 都能看到完整历史

User: [场景 1 Prompt - 给 ARCHITECT]
Opus: [输出 BLUEPRINT]

User: [场景 2 Prompt - 切换到 BUILDER]
      请实现上面的 BLUEPRINT
Flash: [输出代码]

User: [场景 3 Prompt - 切换回 REVIEWER]
      请审查 Flash 生成的代码
Opus: [输出 REVIEW REPORT]
```

**在 Web UI 中**:
- 每个阶段开一个新对话
- 通过复制粘贴传递文档
- 或使用项目文件系统共享文档

### 4. 何时跳过某些阶段

| 场景 | 可省略阶段 | 保留阶段 |
|-----|-----------|---------|
| 小功能添加 | Phase 0 (需求澄清) | 1,2,3 |
| Bug 修复 | Phase 0, 1 (直接描述修复) | 2,3 |
| 紧急热修复 | Phase 0, 3 (审查) | 1,2 |
| 大型重构 | 无，全部执行 | 0,1,2,3,4,5,6,7 |

### 5. 成本优化建议

| 阶段 | 推荐模型 | 预估 Token 消耗 | 成本等级 |
|-----|---------|----------------|---------|
| Phase 0 (需求) | Opus | ~2K | 💰 |
| Phase 1 (设计) | Opus | ~5K | 💰💰 |
| Phase 2 (编码) | Flash | ~10K | 💵 |
| Phase 3 (审查) | Opus | ~8K | 💰💰 |

**节省策略**:
- 小任务用 Sonnet 替代 Opus（架构阶段）
- 重复任务可以复用 BLUEPRINT 模板
- 使用 Flash 做大部分编码工作

---

## <a id="troubleshooting"></a>🔧 常见问题排查

### Q1: ARCHITECT 输出了完整代码而非伪代码

**问题**: Opus 没有遵守"禁止写代码"的规则

**解决**:
```markdown
@Claude-Opus

⚠️ 你刚才输出了完整的 Python 代码，这违反了 ARCHITECT 的职责。

请重新按照 PROTOCOL 的要求：
- 只写伪代码（Pseudo-Code）
- 不要写具体的 Python/JS 实现
- 使用类似这样的格式：
  FUNCTION create_user(data):
      IF data is invalid:
          THROW error
      RETURN result
  END FUNCTION

请重新生成 BLUEPRINT Section C。
```

---

### Q2: BUILDER 修改了逻辑

**问题**: Flash 自作主张优化了算法

**解决**:
```markdown
@Gemini-Flash

⚠️ 你修改了 BLUEPRINT 中的逻辑，这违反了 BUILDER 的职责。

BLUEPRINT Section C.1 第 15 行定义的逻辑是：
[粘贴伪代码]

但你实现的代码是：
[粘贴 Flash 的代码]

请严格按照伪代码重新实现。如果你认为伪代码有问题，
应该输出 ERROR_REPORT.md 请求 ARCHITECT 修改，而不是自己改。
```

---

### Q3: 测试失败但不知道原因

**问题**: BUILDER 无法定位问题

**解决**:
1. 让 BUILDER 输出详细的 `ERROR_REPORT.md`
2. 将报告给 ARCHITECT 分析
3. ARCHITECT 输出修订版 BLUEPRINT
4. BUILDER 根据新蓝图重新实现

**循环次数限制**: 超过 5 次循环，考虑人工介入

---

### Q4: 如何处理大型项目

**问题**: 项目太大，单个 BLUEPRINT 太长

**解决**: 模块化拆分
```
.ai/sessions/project-name/
├── module1_user_management/
│   ├── REQUIREMENTS.md
│   ├── BLUEPRINT.md
│   └── ...
├── module2_payment/
│   ├── REQUIREMENTS.md
│   ├── BLUEPRINT.md
│   └── ...
└── integration_tests/
    └── BLUEPRINT.md
```

每个模块独立走完整流程，最后用一个集成测试模块串联。

---

### Q5: REVIEWER 总是 FAIL 怎么办

**问题**: 审查标准太严格

**解决**: 调整 DoD 标准
```markdown
@Claude-Opus (REVIEWER)

当前项目是 MVP 阶段，请使用宽松的审查标准：
- 代码覆盖率 ≥ 60%（而非 80%）
- 允许 TODO 注释存在
- 性能指标可以放宽到 p95 < 500ms

但以下是硬性要求（不可放宽）：
- 无高危安全漏洞
- 无 SQL 注入风险
- 密码必须加密存储

请重新审查。
```

---

## 🎯 总结

### 核心原则
1. **职责分离**: ARCHITECT 设计、BUILDER 执行、REVIEWER 把关
2. **文档驱动**: 所有决策体现在文档中
3. **可追溯性**: 每个变更都有版本和理由
4. **迭代优化**: 通过反馈循环不断改进

### 成功标准
- ✅ BLUEPRINT 清晰到 BUILDER 可以直接翻译
- ✅ BUILDER 严格遵守蓝图不自作主张
- ✅ REVIEWER 发现的问题能快速修复
- ✅ 最终代码通过所有测试和审查

### 下一步
1. 保存 `.ai/PROTOCOL.md` 到项目
2. 尝试一个小任务练习流程
3. 根据实际情况调整模板
4. 分享经验给团队

---

**版本**: v1.0  
**协议兼容**: ACP v2.0  
**最后更新**: 2025-01-07  
**维护者**: Human + Claude