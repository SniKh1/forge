# Python 开发规范

**版本**：v2.0
**更新日期**：2026-02-02
**适用范围**：Python 后端服务、数据处理、自动化脚本

---

## 一、技术栈选择

### 1.1 Python 版本

| 版本 | 状态 | 说明 |
|------|------|------|
| Python 3.13 | **首选** | 最新稳定版，JIT 编译器 |
| Python 3.12 | 推荐 | 类型参数语法、性能提升 |
| Python 3.11 | 维护中 | 遗留项目可用 |

### 1.2 Web 框架

| 框架 | 场景 | 特点 |
|------|------|------|
| FastAPI 0.115+ | API 首选 | 异步、类型提示、自动文档 |
| Django 5.1+ | 全栈应用 | ORM、Admin、生态完整 |
| Litestar | 高性能 API | 类型安全、插件系统 |
| Flask 3.x | 轻量服务 | 灵活、简单 |

### 1.3 包管理

| 工具 | 场景 |
|------|------|
| uv | **首选**，极速，Rust 实现 |
| Poetry 2.x | 依赖管理，锁文件 |
| pip + venv | 传统方式 |

### 1.4 数据库访问

| 工具 | 场景 |
|------|------|
| SQLAlchemy 2.x | ORM 首选，异步支持 |
| Tortoise ORM | 异步 ORM |
| Prisma | 类型安全 |

---

## 二、Python 3.12+ 新特性（必用）

### 2.1 类型参数语法 (PEP 695)

```python
# 新语法：type 语句定义类型别名
type Point = tuple[float, float]
type ConnectionOptions = dict[str, str]
type Address = tuple[str, int]

# 泛型类（新语法）
class Stack[T]:
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        return self._items.pop()

# 泛型函数（新语法）
def first[T](items: list[T]) -> T:
    return items[0]

# 带约束的类型参数
from collections.abc import Hashable, Sequence

type HashableSequence[T: Hashable] = Sequence[T]
type IntOrStrSequence[T: (int, str)] = Sequence[T]
```

### 2.2 改进的 F-string (Python 3.12)

```python
# 可以在 f-string 中重用相同引号
songs = ['Take me back to Eden', 'Alkaline']
result = f"Playlist: {", ".join(songs)}"

# 支持多行表达式
data = f"Result: {
    some_long_function_call(
        arg1, arg2, arg3
    )
}"

# 嵌套 f-string
matrix = [[1, 2], [3, 4]]
result = f"Matrix: {[f"[{', '.join(map(str, row))}]" for row in matrix]}"
```

### 2.3 Python 3.13 新特性

```python
# 改进的错误消息
# Python 3.13 提供更精确的错误位置指示

# 实验性 JIT 编译器（需启用）
# python -X jit script.py

# 改进的 REPL
# 支持多行编辑、彩色输出、更好的历史记录

# 移除 GIL（实验性，需特殊构建）
# 自由线程 Python 构建支持真正的多线程并行
```

---

## 三、项目结构

### 3.1 FastAPI 项目

```
src/
├── api/
│   └── v1/
├── core/
├── models/
├── schemas/
├── services/
└── utils/
```

### 3.2 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 模块 | snake_case | `user_service` |
| 类名 | PascalCase | `UserService` |
| 函数 | snake_case | `get_user` |
| 常量 | UPPER_SNAKE | `MAX_RETRY` |

---

## 四、类型提示

### 4.1 强制使用类型

```python
def get_user(user_id: int) -> User | None:
    ...
```

### 4.2 Pydantic 模型

```python
from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    email: str
```

---

## 五、异步编程

### 5.1 async/await

```python
async def fetch_data() -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.json()
```

---

## 六、错误处理

### 6.1 自定义异常

```python
class BusinessError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
```

### 6.2 FastAPI 异常处理

```python
@app.exception_handler(BusinessError)
async def handle_error(request, exc):
    return JSONResponse(
        status_code=400,
        content={"code": exc.code, "message": exc.message}
    )
```

---

## 七、测试规范

### 7.1 测试框架

| 工具 | 用途 |
|------|------|
| pytest | 首选测试框架 |
| pytest-asyncio | 异步测试 |
| httpx | API 测试 |

### 7.2 测试示例

```python
@pytest.mark.asyncio
async def test_get_user():
    async with AsyncClient(app=app) as client:
        response = await client.get("/users/1")
        assert response.status_code == 200
```

---

## 八、代码质量

### 8.1 工具链

| 工具 | 用途 |
|------|------|
| ruff | 代码检查 + 格式化 |
| mypy | 类型检查 |
| pre-commit | Git 钩子 |

---

## 九、相关 Skill

| Skill | 用途 |
|-------|------|
| backend-development | 后端 API 开发 |
| databases | 数据库操作 |

---

## 更新记录

- **v2.0** (2026-02-02) - Python 3.12/3.13 更新
  - 升级到 Python 3.13 作为首选版本
  - 新增类型参数语法 (PEP 695) 规范
  - 新增改进的 F-string 规范
  - 新增 Python 3.13 新特性（JIT、Free-threading）
  - 更新 Web 框架版本要求
  - 新增 Litestar 框架推荐

- **v1.0** (2026-02-02) - 初始版本
  - FastAPI 技术栈
  - 类型提示规范
  - 异步编程规范
  - 测试规范
  - 代码质量工具
