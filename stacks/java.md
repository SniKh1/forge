# Java 后端开发规范

**版本**：v2.0
**更新日期**：2026-02-02
**适用范围**：Java 后端服务、Spring Boot 应用、微服务架构

---

## 一、技术栈选择

### 1.1 Java 版本

| 版本 | 状态 | 说明 |
|------|------|------|
| Java 21 LTS | **首选** | 长期支持至 2031 年 |
| Java 17 LTS | 维护中 | 遗留项目可用 |
| Java 24+ | 前沿 | 新特性预览 |

### 1.2 框架选择

| 框架 | 场景 | 版本要求 |
|------|------|----------|
| Spring Boot 3.3+ | 首选框架 | Java 21+ |
| Spring Cloud 2024.x | 微服务架构 | 配合 Boot 3.3+ |
| Quarkus 3.x | 云原生/GraalVM | 高性能需求 |
| Micronaut 4.x | 轻量级微服务 | 启动速度优先 |

### 1.3 构建工具

| 工具 | 场景 |
|------|------|
| Gradle 8.x (Kotlin DSL) | 首选，灵活性高 |
| Maven 3.9+ | 传统项目，生态成熟 |

### 1.4 数据库访问

| 技术 | 场景 |
|------|------|
| Spring Data JPA 3.x | ORM 首选 |
| MyBatis-Plus 3.5+ | 复杂 SQL |
| JOOQ 3.19+ | 类型安全 SQL |

---

## 二、Java 21 新特性（必用）

### 2.1 虚拟线程 (Virtual Threads)

轻量级线程，解决传统线程的扩展性问题：

```java
// 创建虚拟线程
Thread.startVirtualThread(() -> {
    System.out.println("Running in virtual thread");
});

// 使用 ExecutorService
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10_000).forEach(i -> {
        executor.submit(() -> {
            Thread.sleep(Duration.ofSeconds(1));
            return i;
        });
    });
}

// Spring Boot 配置启用虚拟线程
// application.yml
spring:
  threads:
    virtual:
      enabled: true
```

### 2.2 模式匹配 for switch (Pattern Matching)

```java
// 类型模式匹配
static String format(Object obj) {
    return switch (obj) {
        case Integer i -> String.format("int %d", i);
        case Long l    -> String.format("long %d", l);
        case Double d  -> String.format("double %f", d);
        case String s  -> String.format("String %s", s);
        case null      -> "null";
        default        -> obj.toString();
    };
}

// 带守卫条件的模式匹配
static String classify(Number n) {
    return switch (n) {
        case Integer i when i > 0 -> "positive integer";
        case Integer i when i < 0 -> "negative integer";
        case Integer i            -> "zero";
        case Double d when d > 0  -> "positive double";
        default                   -> "other number";
    };
}
```

### 2.3 记录模式 (Record Patterns)

```java
record Point(int x, int y) {}
record Rectangle(Point topLeft, Point bottomRight) {}

// 解构记录
static void printSum(Object obj) {
    if (obj instanceof Point(int x, int y)) {
        System.out.println(x + y);
    }
}

// 嵌套记录模式
static void printArea(Object obj) {
    if (obj instanceof Rectangle(
            Point(int x1, int y1),
            Point(int x2, int y2))) {
        System.out.println(Math.abs((x2 - x1) * (y2 - y1)));
    }
}

// 在 switch 中使用
static String describe(Object obj) {
    return switch (obj) {
        case Point(int x, int y) -> "Point at (%d, %d)".formatted(x, y);
        case Rectangle(Point tl, Point br) -> "Rectangle from %s to %s".formatted(tl, br);
        default -> "Unknown shape";
    };
}
```

### 2.4 序列集合 (Sequenced Collections)

```java
// 新接口：SequencedCollection, SequencedSet, SequencedMap
List<String> list = new ArrayList<>();
list.addFirst("first");  // 新方法
list.addLast("last");    // 新方法
String first = list.getFirst();
String last = list.getLast();
List<String> reversed = list.reversed();  // 反转视图

// SequencedMap
LinkedHashMap<String, Integer> map = new LinkedHashMap<>();
map.putFirst("a", 1);
map.putLast("z", 26);
Map.Entry<String, Integer> firstEntry = map.firstEntry();
Map.Entry<String, Integer> lastEntry = map.lastEntry();
```

---

## 三、项目结构

### 3.1 分层架构

```
src/main/java/com/example/
├── controller/     # API 层
├── service/        # 业务逻辑
├── repository/     # 数据访问
├── entity/         # 实体类
├── dto/            # 数据传输对象
├── config/         # 配置类
├── exception/      # 异常处理
└── util/           # 工具类
```

### 3.2 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 类名 | PascalCase | `UserService` |
| 方法 | camelCase | `getUserById` |
| 常量 | UPPER_SNAKE | `MAX_RETRY` |
| 包名 | 全小写 | `com.example` |

---

## 四、API 设计规范

### 4.1 RESTful 规范

| 方法 | 用途 | 示例 |
|------|------|------|
| GET | 查询 | `/users/{id}` |
| POST | 创建 | `/users` |
| PUT | 全量更新 | `/users/{id}` |
| PATCH | 部分更新 | `/users/{id}` |
| DELETE | 删除 | `/users/{id}` |

### 4.2 统一响应格式

```java
public record ApiResponse<T>(
    boolean success,
    T data,
    String message,
    String code
) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null, "200");
    }

    public static <T> ApiResponse<T> error(String message, String code) {
        return new ApiResponse<>(false, null, message, code);
    }
}
```

---

## 五、异常处理

### 5.1 全局异常处理

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ApiResponse<?> handleBusiness(BusinessException e) {
        return ApiResponse.error(e.getMessage(), e.getCode());
    }
}
```

### 5.2 自定义异常

```java
public class BusinessException extends RuntimeException {
    private final String code;

    public BusinessException(String code, String message) {
        super(message);
    }
}
```

---

## 六、数据校验

### 6.1 参数校验

```java
public record CreateUserRequest(
    @NotBlank String username,
    @Email String email,
    @Size(min = 8) String password
) {}
```

---

## 七、安全规范

### 7.1 SQL 注入防护

- 使用参数化查询
- 禁止字符串拼接 SQL

### 7.2 密码安全

- 使用 BCrypt 加密
- 禁止明文存储

---

## 八、测试规范

### 8.1 测试分层

| 类型 | 覆盖率 |
|------|--------|
| 单元测试 | 80%+ |
| 集成测试 | 关键路径 |
| E2E 测试 | 核心流程 |

### 8.2 测试工具

| 工具 | 用途 |
|------|------|
| JUnit 5 | 单元测试 |
| Mockito | Mock 框架 |
| Testcontainers | 集成测试 |

---

## 九、相关 Skill

| Skill | 用途 |
|-------|------|
| backend-development | 后端 API 开发 |
| databases | 数据库操作 |
| better-auth | 认证授权 |

---

## 更新记录

- **v2.0** (2026-02-02) - Java 21 LTS 更新
  - 升级到 Java 21 LTS 作为首选版本
  - 新增虚拟线程 (Virtual Threads) 规范
  - 新增模式匹配 for switch 规范
  - 新增记录模式 (Record Patterns) 规范
  - 新增序列集合 (Sequenced Collections) 规范
  - 更新 Spring Boot 到 3.3+
  - 更新构建工具版本要求

- **v1.0** (2026-02-02) - 初始版本
  - Spring Boot 3.x 技术栈
  - API 设计规范
  - 异常处理规范
  - 安全规范
  - 测试规范
