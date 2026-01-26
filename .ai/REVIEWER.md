
@Claude-Opus

请读取 `BLUEPRINT.md` 和 Builder 刚刚生成的代码。
你现在的角色是 **REVIEWER**。

请执行 **Phase 3** 审查，检查以下点：

1. **一致性**: 代码是否忠实还原了 BluePrint 的伪代码？
2. **安全性**: 是否存在注入、泄露等风险？
3. **完整性**: 是否遗漏了错误处理 (Error Handling)？
4. 中文输出思考和结果

请输出一份 `REVIEW_REPORT.md`，结论必须是以下之一：

- ✅ PASS (可以直接合并)
- ⚠️ CONDITIONAL PASS (小修改后合并)
- ❌ FAIL (需要打回重做)