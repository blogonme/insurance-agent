# BLUEPRINT: Mobile Announcement Feature (公告栏)

**Version**: v1.0  
**Date**: 2026-01-15  
**Architect**: Claude Opus  
**Related Requirements**: User Request (公告栏)

---

## A. 功能概述

实现移动端首页的 **公告栏** 功能，支持：

1. 管理员向**所有人**、**指定用户组**、**指定用户**发送公告。
2. 用户在移动端首页查看收到的公告列表。
3. 用户阅读公告后，系统标记为**已读**。
4. 可查看公告详情及阅读状态统计（发送方视角）。

---

## B. 文件变更清单 (File Tree)

```
backend/src/main/java/com/mattress/erp/
├── entity/
│   ├── Announcement.java               [CREATE] - 公告主表
│   └── AnnouncementRecipient.java      [CREATE] - 公告接收人表
├── dto/
│   ├── AnnouncementDTO.java            [CREATE] - 公告 DTO
│   └── CreateAnnouncementDTO.java      [CREATE] - 创建公告请求
├── repository/
│   ├── AnnouncementRepository.java     [CREATE] - 公告 Repo
│   └── AnnouncementRecipientRepository.java [CREATE] - 接收人 Repo
├── service/
│   └── AnnouncementService.java        [CREATE] - 公告业务逻辑
└── controller/
    └── AnnouncementController.java     [CREATE] - 公告 API

frontend/src/
├── services/
│   └── api.ts                          [MODIFY] - 添加 announcementApi
├── pages/mobile/
│   ├── MobileHome.tsx                  [MODIFY] - 添加公告栏入口
│   └── MobileAnnouncements.tsx         [CREATE] - 公告列表页
├── pages/Settings/
│   └── AnnouncementManagement.tsx      [CREATE] - 后台公告管理页(可选)
└── components/mobile/
    └── AnnouncementCard.tsx            [CREATE] - 公告卡片组件
```

---

## C. 数据结构与接口 (Types & Interfaces)

### C.1 数据库模型

```sql
-- Announcement (公告主表)
CREATE TABLE announcement (
    id SERIAL PRIMARY KEY,
    ledger_set_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'NORMAL',  -- NORMAL, IMPORTANT, URGENT
    target_type VARCHAR(20) NOT NULL,       -- ALL, GROUP, USER
    target_ids TEXT,                         -- 逗号分隔的 group_id 或 user_id
    sender_id INTEGER NOT NULL,
    sender_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,                    -- 可选的过期时间
    is_active BOOLEAN DEFAULT TRUE
);

-- AnnouncementRecipient (公告接收人表)
CREATE TABLE announcement_recipient (
    id SERIAL PRIMARY KEY,
    announcement_id INTEGER NOT NULL REFERENCES announcement(id),
    recipient_id INTEGER NOT NULL,           -- user_id
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_recipient_user ON announcement_recipient(recipient_id, is_read);
CREATE INDEX idx_announcement_ledger ON announcement(ledger_set_id, is_active);
```

### C.2 Java Entity

```java
// Announcement.java
@Entity
@Table(name = "announcement")
@Data
public class Announcement {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer ledgerSetId;
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String priority;    // NORMAL, IMPORTANT, URGENT
    private String targetType;  // ALL, GROUP, USER
    private String targetIds;   // Comma-separated IDs

    private Integer senderId;
    private String senderName;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Boolean isActive;
}

// AnnouncementRecipient.java
@Entity
@Table(name = "announcement_recipient")
@Data
public class AnnouncementRecipient {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer announcementId;
    private Integer recipientId;
    private Boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
```

### C.3 DTO

```java
// CreateAnnouncementDTO.java
@Data
public class CreateAnnouncementDTO {
    private String title;
    private String content;
    private String priority;     // NORMAL, IMPORTANT, URGENT
    private String targetType;   // ALL, GROUP, USER
    private List<Integer> targetIds;  // group IDs or user IDs
    private LocalDateTime expiresAt;
}

// AnnouncementDTO.java (返回给前端)
@Data
public class AnnouncementDTO {
    private Integer id;
    private String title;
    private String content;
    private String priority;
    private String senderName;
    private LocalDateTime createdAt;
    private Boolean isRead;         // 当前用户是否已读
    private Integer totalRecipients; // 总接收人数 (仅发送方可见)
    private Integer readCount;       // 已读人数 (仅发送方可见)
}
```

### C.4 API 接口

```
# 用户端 API

GET /api/announcements/my
  → 获取当前用户收到的公告列表 (未过期 & isActive)
  Response: List<AnnouncementDTO>

GET /api/announcements/{id}
  → 获取公告详情，并标记为已读
  Response: AnnouncementDTO

PUT /api/announcements/{id}/read
  → 标记公告为已读
  Response: 200 OK

# 管理端 API (可选)

POST /api/announcements
  → 创建新公告
  Request: CreateAnnouncementDTO
  Response: Announcement

GET /api/announcements/sent
  → 获取我发送的公告列表（带阅读统计）
  Response: List<AnnouncementDTO>

DELETE /api/announcements/{id}
  → 删除公告（逻辑删除）
  Response: 200 OK
```

---

## D. 逻辑伪代码 (Pseudo-Code)

### D.1 发送公告

```
FUNCTION createAnnouncement(dto: CreateAnnouncementDTO) -> Announcement:
    currentUser = SecurityUtils.getCurrentUser()
    ledgerSetId = SecurityUtils.getCurrentLedgerSetId()

    // Step 1: 创建公告记录
    announcement = new Announcement()
    announcement.ledgerSetId = ledgerSetId
    announcement.title = dto.title
    announcement.content = dto.content
    announcement.priority = dto.priority
    announcement.targetType = dto.targetType
    announcement.targetIds = dto.targetIds.join(",")
    announcement.senderId = currentUser.id
    announcement.senderName = currentUser.displayName
    announcement.createdAt = now()
    announcement.expiresAt = dto.expiresAt
    announcement.isActive = true

    SAVE(announcement)

    // Step 2: 创建接收人记录
    recipientUserIds = []

    IF dto.targetType == "ALL":
        recipientUserIds = userRepository.findAllByLedgerSetId(ledgerSetId)
                            .map(u -> u.id)
    ELSE IF dto.targetType == "GROUP":
        FOR EACH groupId IN dto.targetIds:
            usersInGroup = userGroupRepository.findUserIdsByGroupId(groupId)
            recipientUserIds.addAll(usersInGroup)
    ELSE IF dto.targetType == "USER":
        recipientUserIds = dto.targetIds

    // 去重
    recipientUserIds = recipientUserIds.distinct()

    // 批量创建接收人记录
    FOR EACH userId IN recipientUserIds:
        recipient = new AnnouncementRecipient()
        recipient.announcementId = announcement.id
        recipient.recipientId = userId
        recipient.isRead = false
        recipient.createdAt = now()
        SAVE(recipient)

    // Step 3: 发送推送通知 (可选)
    pushNotificationService.sendBulk(
        recipientUserIds,
        title = "新公告: " + announcement.title,
        body = truncate(announcement.content, 50),
        url = "/mobile/announcements/" + announcement.id
    )

    RETURN announcement
END FUNCTION
```

### D.2 获取我的公告

```
FUNCTION getMyAnnouncements() -> List<AnnouncementDTO>:
    currentUserId = SecurityUtils.getCurrentUserId()
    ledgerSetId = SecurityUtils.getCurrentLedgerSetId()
    now = currentTimestamp()

    // 查询我作为接收人的公告，且未过期
    recipients = announcementRecipientRepository
        .findByRecipientIdOrderByCreatedAtDesc(currentUserId)

    result = []
    FOR EACH recipient IN recipients:
        announcement = announcementRepository.findById(recipient.announcementId)

        // 过滤：必须同一账套、未过期、活跃
        IF announcement.ledgerSetId != ledgerSetId:
            CONTINUE
        IF announcement.isActive != true:
            CONTINUE
        IF announcement.expiresAt != null AND announcement.expiresAt < now:
            CONTINUE

        dto = mapToDTO(announcement, recipient.isRead)
        result.add(dto)

    RETURN result
END FUNCTION
```

### D.3 标记已读

```
FUNCTION markAsRead(announcementId: Integer) -> void:
    currentUserId = SecurityUtils.getCurrentUserId()

    recipient = announcementRecipientRepository
        .findByAnnouncementIdAndRecipientId(announcementId, currentUserId)

    IF recipient == null:
        THROW NotFoundException("您不是该公告的接收人")

    IF recipient.isRead == false:
        recipient.isRead = true
        recipient.readAt = now()
        SAVE(recipient)
END FUNCTION
```

---

## E. 前端实现

### E.1 移动端首页入口

```tsx
// MobileHome.tsx - 在 Stats 区域下方添加公告栏入口
<section className="space-y-3">
  <div className="flex justify-between items-center px-1">
    <h2 className="font-bold text-lg">📢 最新公告</h2>
    <Link to="/mobile/announcements" className="text-xs text-primary">
      查看全部 →
    </Link>
  </div>

  {/* 最多显示 3 条最新公告 */}
  {announcements.slice(0, 3).map((a) => (
    <AnnouncementCard key={a.id} announcement={a} />
  ))}

  {announcements.length === 0 && (
    <p className="text-center text-muted-foreground text-sm py-4">暂无公告</p>
  )}
</section>
```

### E.2 公告卡片组件

```tsx
// AnnouncementCard.tsx
interface AnnouncementCardProps {
  announcement: {
    id: number;
    title: string;
    content: string;
    priority: string;
    senderName: string;
    createdAt: string;
    isRead: boolean;
  };
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
}) => {
  const priorityColors = {
    URGENT: "bg-red-100 text-red-600",
    IMPORTANT: "bg-orange-100 text-orange-600",
    NORMAL: "bg-blue-100 text-blue-600",
  };

  return (
    <Link
      to={`/mobile/announcements/${announcement.id}`}
      className={`block bg-white p-4 rounded-2xl border shadow-sm transition-all ${
        announcement.isRead ? "opacity-70" : "border-primary/30"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            priorityColors[announcement.priority]
          }`}
        >
          {announcement.priority === "URGENT"
            ? "紧急"
            : announcement.priority === "IMPORTANT"
            ? "重要"
            : "普通"}
        </span>
        {!announcement.isRead && (
          <span className="w-2 h-2 bg-primary rounded-full" />
        )}
      </div>

      <h4 className="font-bold text-base mb-1 truncate">
        {announcement.title}
      </h4>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
        {announcement.content}
      </p>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>发布人: {announcement.senderName}</span>
        <span>{formatDate(announcement.createdAt)}</span>
      </div>
    </Link>
  );
};
```

### E.3 公告列表页

```tsx
// MobileAnnouncements.tsx
const MobileAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    announcementApi.getMy().then((res) => {
      setAnnouncements(res.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">全部公告</h1>

      {loading ? (
        <LoadingSpinner />
      ) : announcements.length === 0 ? (
        <EmptyState message="暂无公告" />
      ) : (
        announcements.map((a) => (
          <AnnouncementCard key={a.id} announcement={a} />
        ))
      )}
    </div>
  );
};
```

---

## F. 测试策略

### F.1 成功场景

| 测试用例           | 输入                              | 期望结果                 |
| ------------------ | --------------------------------- | ------------------------ |
| 发送公告给所有人   | targetType=ALL                    | 所有用户收到公告         |
| 发送公告给用户组   | targetType=GROUP, targetIds=[1,2] | 组内用户收到公告         |
| 发送公告给指定用户 | targetType=USER, targetIds=[5]    | 仅用户 5 收到            |
| 用户查看公告列表   | GET /my                           | 返回未过期公告           |
| 用户标记已读       | PUT /{id}/read                    | isRead=true, readAt 有值 |

### F.2 边缘情况

| 测试用例     | 输入             | 期望结果         |
| ------------ | ---------------- | ---------------- |
| 公告已过期   | expiresAt < now  | 不在列表中显示   |
| 重复标记已读 | 已是已读状态     | 不报错，保持原状 |
| 无权限查看   | 非接收人访问详情 | 404 Not Found    |

---

## G. 安全检查清单

- [ ] 只有同一 `ledgerSetId` 的用户能看到公告
- [ ] 创建公告需验证 `targetIds` 中的用户/组是否存在
- [ ] 删除公告使用逻辑删除 (`isActive = false`)
- [ ] 阅读统计不泄露其他用户信息

---

## H. 部署配置

### H.1 数据库迁移

```sql
-- 需要在部署时执行
ALTER TABLE ... ADD COLUMN ... (if needed)
```

### H.2 路由配置

```tsx
// App.tsx - 添加路由
{ path: '/mobile/announcements', element: <MobileAnnouncements /> }
{ path: '/mobile/announcements/:id', element: <MobileAnnouncementDetail /> }
```

---

## I. 变更日志

**v1.0 (2026-01-15)** - Initial design

- 定义公告数据模型
- 设计 API 接口
- 规划前端组件
