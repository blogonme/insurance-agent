# BLUEPRINT: 双模式领料管理系统 (Material Requisition System)

**Version**: v1.0  
**Date**: 2026-01-15  
**Architect**: Claude Opus  
**Related Requirements**: 用户口头需求确认

---

## A. 文件变更清单 (File Tree)

```
backend/src/main/java/com/mattress/erp/
├── entity/
│   ├── MaterialRequisition.java        [CREATE] - 领料单主表实体
│   └── MaterialRequisitionLine.java    [CREATE] - 领料单明细实体
├── repository/
│   ├── MaterialRequisitionRepository.java     [CREATE]
│   └── MaterialRequisitionLineRepository.java [CREATE]
├── dto/
│   ├── MaterialRequisitionDTO.java     [CREATE]
│   └── MaterialRequisitionLineDTO.java [CREATE]
├── service/
│   └── MaterialRequisitionService.java [CREATE] - 核心业务逻辑
├── controller/
│   └── MaterialRequisitionController.java [CREATE] - REST API
└── entity/
    └── ProductionOrder.java            [MODIFY] - 增加领料关联字段

frontend/src/
├── components/
│   ├── MaterialRequisitionList.tsx          [CREATE] - 领料单列表
│   ├── CreateManualRequisitionDialog.tsx    [CREATE] - 手工领料申请
│   ├── ProductionRequisitionDialog.tsx      [CREATE] - 生产领料明细
│   └── IssueConfirmDialog.tsx               [CREATE] - 仓库出库确认
├── pages/
│   └── Warehouse.tsx                        [MODIFY] - 增加领料管理Tab
└── services/
    └── api.ts                               [MODIFY] - 增加领料API
```

---

## B. 数据结构与接口 (Types & Interfaces)

### B.1 数据库表结构

```sql
-- 领料单主表
CREATE TABLE material_requisitions (
    id SERIAL PRIMARY KEY,
    ledger_set_id INTEGER REFERENCES ledger_sets(id),
    requisition_no VARCHAR(50) NOT NULL UNIQUE,
    requisition_type VARCHAR(20) NOT NULL,  -- 'production' | 'manual'
    source_type VARCHAR(30),                 -- 'PRODUCTION_ORDER' | 'MANUAL'
    source_id INTEGER,                       -- 关联的生产工单ID (可为null)
    department VARCHAR(100),
    requester_id INTEGER REFERENCES users(id),
    warehouse_id INTEGER REFERENCES warehouses(id),
    status VARCHAR(20) DEFAULT 'draft',     -- draft|pending|submitted|approved|issued|rejected|cancelled
    planned_date DATE,
    actual_date TIMESTAMP,
    issued_by INTEGER REFERENCES users(id),
    notes TEXT,
    workflow_instance_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 领料单明细表
CREATE TABLE material_requisition_lines (
    id SERIAL PRIMARY KEY,
    requisition_id INTEGER REFERENCES material_requisitions(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) NOT NULL,
    planned_qty DECIMAL(15,4) NOT NULL,
    actual_qty DECIMAL(15,4) DEFAULT 0,
    batch_id INTEGER REFERENCES inventory_batches(id),
    uom_id INTEGER REFERENCES uom(id),
    notes VARCHAR(500),
    UNIQUE(requisition_id, item_id)
);
```

### B.2 Java 实体类接口

```java
// MaterialRequisition.java
@Entity
@Table(name = "material_requisitions")
public class MaterialRequisition {
    @Id @GeneratedValue
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    private LedgerSet ledgerSet;

    @Column(nullable = false, unique = true)
    private String requisitionNo;          // 单号: MR-yyyyMMdd-001

    @Column(nullable = false)
    private String requisitionType;        // "production" | "manual"

    private String sourceType;             // "PRODUCTION_ORDER" | "MANUAL"
    private Integer sourceId;
    private String department;

    @ManyToOne(fetch = FetchType.LAZY)
    private User requester;

    @ManyToOne(fetch = FetchType.EAGER)
    private Warehouse warehouse;

    @Column(length = 20)
    private String status = "draft";

    private LocalDate plannedDate;
    private LocalDateTime actualDate;

    @ManyToOne(fetch = FetchType.LAZY)
    private User issuedBy;

    private String notes;
    private Integer workflowInstanceId;

    @OneToMany(mappedBy = "requisition", cascade = CascadeType.ALL)
    private List<MaterialRequisitionLine> lines;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

// MaterialRequisitionLine.java
@Entity
@Table(name = "material_requisition_lines")
public class MaterialRequisitionLine {
    @Id @GeneratedValue
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    private MaterialRequisition requisition;

    @ManyToOne(fetch = FetchType.EAGER)
    private Item item;

    @Column(precision = 15, scale = 4, nullable = false)
    private BigDecimal plannedQty;

    @Column(precision = 15, scale = 4)
    private BigDecimal actualQty = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    private InventoryBatch batch;

    @ManyToOne(fetch = FetchType.EAGER)
    private Uom uom;

    private String notes;
}
```

### B.3 ProductionOrder 修改

```java
// 新增字段
@Column(name = "material_requisition_id")
private Integer materialRequisitionId;

@Column(name = "material_status", length = 20)
private String materialStatus = "none";  // none|pending|partial|complete
```

### B.4 API 接口定义

```
# 查询接口
GET  /api/material-requisitions                          # 列表(支持分页/筛选)
GET  /api/material-requisitions/{id}                     # 详情
GET  /api/material-requisitions/pending                  # 待处理(仓库待办)
GET  /api/material-requisitions/production/{orderId}     # 按生产工单查询

# 创建接口
POST /api/material-requisitions                          # 创建手工领料单
POST /api/material-requisitions/from-production/{orderId}# 从生产工单生成

# 状态变更接口
POST /api/material-requisitions/{id}/submit              # 提交审批(手工)
POST /api/material-requisitions/{id}/approve             # 审批通过
POST /api/material-requisitions/{id}/reject              # 驳回
POST /api/material-requisitions/{id}/issue               # 仓库出库
POST /api/material-requisitions/{id}/cancel              # 取消

# 修改接口
PUT  /api/material-requisitions/{id}                     # 更新领料单
PUT  /api/material-requisitions/{id}/lines               # 仓库填写实际数量
```

---

## C. 逻辑伪代码 (Pseudo-Code)

### C.1 从生产工单生成领料单

```
FUNCTION createFromProductionOrder(productionOrderId: Integer) -> MaterialRequisition:
    // Step 1: 获取生产工单和BOM
    order = productionOrderRepository.findById(productionOrderId)
    IF order IS NULL:
        THROW NotFoundException("生产工单不存在")

    IF order.bom IS NULL:
        THROW BusinessException("生产工单未关联BOM")

    IF order.materialRequisitionId IS NOT NULL:
        THROW BusinessException("该工单已生成领料单")

    // Step 2: 创建领料单头
    req = new MaterialRequisition()
    req.requisitionNo = generateRequisitionNo()  // MR-yyyyMMdd-001
    req.requisitionType = "production"
    req.sourceType = "PRODUCTION_ORDER"
    req.sourceId = productionOrderId
    req.warehouse = order.warehouse OR getDefaultWarehouse()
    req.status = "pending"  // 生产领料直接进入待仓库处理
    req.requester = getCurrentUser()
    req.plannedDate = LocalDate.now()

    // Step 3: 根据BOM计算领料明细
    FOR EACH bomLine IN order.bom.lines:
        line = new MaterialRequisitionLine()
        line.item = bomLine.component
        line.plannedQty = bomLine.quantity * order.plannedQty
        line.uom = bomLine.uom OR bomLine.component.uom
        req.lines.add(line)
    END FOR

    // Step 4: 保存
    savedReq = materialRequisitionRepository.save(req)

    // Step 5: 更新生产工单
    order.materialRequisitionId = savedReq.id
    order.materialStatus = "pending"
    productionOrderRepository.save(order)

    RETURN savedReq
END FUNCTION
```

### C.2 仓库出库确认

```
FUNCTION issue(reqId: Integer, lineActuals: List<LineActualDTO>) -> MaterialRequisition:
    // Step 1: 验证
    req = findById(reqId)
    IF req.status NOT IN ["pending", "approved"]:
        THROW BusinessException("当前状态不允许出库")

    // Step 2: 处理每行明细
    hasPartial = FALSE
    FOR EACH actualDTO IN lineActuals:
        line = findLineById(actualDTO.lineId)

        // 验证库存 (WARNING模式,不阻止)
        currentStock = inventoryService.getStock(line.item, req.warehouse)
        IF actualDTO.actualQty > currentStock:
            // 记录警告但不阻止
            LOG.warn("物料 {} 库存不足: 需求={}, 现有={}",
                     line.item.code, actualDTO.actualQty, currentStock)
        END IF

        line.actualQty = actualDTO.actualQty

        // 检查是否部分出库
        IF actualDTO.actualQty < line.plannedQty:
            hasPartial = TRUE
        END IF

        // Step 3: 扣减库存
        IF actualDTO.actualQty > 0:
            inventoryService.deduct(
                item = line.item,
                warehouse = req.warehouse,
                quantity = actualDTO.actualQty,
                referenceType = "MATERIAL_REQUISITION",
                referenceId = reqId
            )
        END IF
    END FOR

    // Step 4: 更新状态
    req.status = "issued"
    req.actualDate = LocalDateTime.now()
    req.issuedBy = getCurrentUser()

    // Step 5: 更新生产工单领料状态 (如果是生产领料)
    IF req.requisitionType == "production" AND req.sourceId IS NOT NULL:
        order = productionOrderRepository.findById(req.sourceId)
        order.materialStatus = hasPartial ? "partial" : "complete"
        productionOrderRepository.save(order)
    END IF

    RETURN save(req)
END FUNCTION
```

### C.3 手工领料单审批流程

```
FUNCTION submitForApproval(reqId: Integer) -> MaterialRequisition:
    req = findById(reqId)
    IF req.requisitionType != "manual":
        THROW BusinessException("仅手工领料单需要提交审批")
    IF req.status != "draft":
        THROW BusinessException("只有草稿状态可以提交")
    IF req.lines IS EMPTY:
        THROW BusinessException("领料单必须包含明细")

    // 启动工作流
    instance = workflowEngine.start("MATERIAL_REQUISITION", reqId)
    IF instance IS NOT NULL:
        req.workflowInstanceId = instance.id
    END IF

    req.status = "submitted"
    RETURN save(req)
END FUNCTION

FUNCTION approve(reqId: Integer) -> MaterialRequisition:
    req = findById(reqId)
    IF req.status != "submitted":
        THROW BusinessException("只有已提交状态可以审批")

    // 执行工作流步骤
    IF req.workflowInstanceId IS NOT NULL:
        workflowEngine.executeStep(req.workflowInstanceId, "APPROVE", null)
    END IF

    req.status = "approved"
    RETURN save(req)
END FUNCTION
```

---

## D. 测试策略 (Test Strategy)

BUILDER 必须确保以下测试场景通过：

### D.1 BOM 生产领料测试

```
Test Case 1: 从生产工单生成领料单
  前置: 存在生产工单ID=1, BOM包含2个物料(A:10个, B:5个), plannedQty=2
  操作: POST /api/material-requisitions/from-production/1
  预期:
    - 返回201, 领料单号格式 MR-yyyyMMdd-xxx
    - lines包含2行: A计划20个, B计划10个
    - status = "pending"
    - 生产工单.materialStatus = "pending"

Test Case 2: 仓库确认出库
  前置: 领料单ID=1, status=pending, 物料A计划20个
  操作: POST /api/material-requisitions/1/issue
         Body: {lines: [{lineId:1, actualQty:18}]}
  预期:
    - 返回200, status = "issued"
    - 物料A actualQty = 18
    - 库存减少18
    - 生产工单.materialStatus = "partial" (因18<20)

Test Case 3: 库存不足警告
  前置: 物料A库存=5, 领料计划20
  操作: 出库确认actualQty=10
  预期:
    - 操作成功 (不拒绝)
    - 日志记录警告信息
    - 库存变为负数 (-5)
```

### D.2 手工领料审批测试

```
Test Case 4: 创建手工领料单
  操作: POST /api/material-requisitions
         Body: {requisitionType:"manual", department:"生产部", lines:[...]}
  预期: 返回201, status="draft"

Test Case 5: 提交审批
  前置: 手工领料单ID=2, status=draft
  操作: POST /api/material-requisitions/2/submit
  预期: status = "submitted", workflowInstanceId IS NOT NULL

Test Case 6: 审批通过
  前置: ID=2, status=submitted, 当前用户有审批权限
  操作: POST /api/material-requisitions/2/approve
  预期: status = "approved"

Test Case 7: 仓库出库
  前置: ID=2, status=approved
  操作: POST /api/material-requisitions/2/issue
  预期: status = "issued", 库存扣减
```

---

## E. 依赖声明 (Dependencies)

### E.1 内部依赖

```
@/entity/LedgerSet.java           → 账套管理
@/entity/User.java                → 用户信息
@/entity/Warehouse.java           → 仓库信息
@/entity/Item.java                → 物料信息
@/entity/ProductionOrder.java     → 生产工单 [MODIFY]
@/entity/BomHeader.java           → BOM头
@/entity/BomLine.java             → BOM明细
@/service/InventoryService.java   → 库存操作
@/service/WorkflowEngine.java     → 工作流引擎
@/security/SecurityUtils.java     → 当前用户获取
```

### E.2 前端依赖

```
@/services/api.ts                 → API封装 [MODIFY]
@/components/ui/*                 → ShadCN组件库
```

---

## F. 错误处理策略 (Error Handling)

| 错误场景         | HTTP 状态 | 错误码                | 处理方式                    |
| ---------------- | --------- | --------------------- | --------------------------- |
| 生产工单不存在   | 404       | NOT_FOUND             | 返回明确提示                |
| 工单已生成领料单 | 400       | DUPLICATE_REQUISITION | 阻止重复生成                |
| 状态不允许操作   | 400       | INVALID_STATUS        | 提示当前状态                |
| 库存不足         | 200       | -                     | **警告但不阻止** (日志记录) |
| 无审批权限       | 403       | FORBIDDEN             | 提示无权限                  |

---

## G. 安全检查清单 (Security Checklist)

BUILDER 实现时必须确保：

- [ ] **权限验证**: 仓库出库需仓库管理员角色
- [ ] **账套隔离**: 所有查询加 ledgerSetId 过滤
- [ ] **审批权限**: 工作流步骤验证用户权限
- [ ] **日志审计**: 关键操作记录操作人和时间
- [ ] **数据验证**: 所有数量字段 >= 0

---

## H. 工作流配置

### H.1 工作流定义 (需初始化)

```
entityType: MATERIAL_REQUISITION
steps:
  1. draft → submitted      (SELF - 申请人提交)
  2. submitted → approved   (ROLE:MANAGER - 部门主管审批)
  3. approved → issued      (ROLE:WAREHOUSE_ADMIN - 仓库出库)
```

> 注: BOM 生产领料(requisitionType=production)不启用工作流,直接 status=pending 待仓库处理

---

## I. 变更日志 (Change Log)

**v1.0 (2026-01-15)** - Initial Design

- 定义双模式领料系统架构
- BOM 生产领料: 自动计算 → 仓库确认
- 手工领料: 提交 → 审批 → 出库
- 库存不足采用警告模式
- 支持部分出库
