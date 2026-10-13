Ventoy 是一个开源的 U 盘启动盘工具，和 Rufus 的思路完全不一样：Rufus 每做一次盘都要重新写入、写入前还得格式化；而 Ventoy 只需要往 U 盘里装一次，之后想加什么系统，把 ISO 文件直接拷进去就能启动，不用反复格式化。下面是完整的使用流程。

## 准备工作

- 一个 **8GB 以上**的 U 盘（建议 16GB 或更大；首次安装会清空全部数据，重要文件先备份）
- 要用的系统镜像（ISO），例如 Windows、Ubuntu、PE 工具箱等，从哪下载都行
- 一台 Windows 电脑（Ventoy 也有 Linux 版，用法类似）

## 使用步骤

### 第 1 步：安装 Ventoy 到 U 盘

从官网下载压缩包，解压后双击运行 `Ventoy2Disk.exe`。插入 U 盘，在「设备」下拉框里确认选中的是正确的 U 盘，点击「安装」。

![](images/guides/ventoy/ventoy-01.jpg)

安装界面上的选项保持默认即可，几秒钟就能装完：

| 选项 | 推荐值 | 说明 |
| --- | --- | --- |
| 分区类型 | GPT | 新电脑（UEFI 启动）选这个 |
| 文件系统 | exFAT | 单个文件超过 4GB 也能放，通用性最好 |
| 预留空间 | 不勾选 | 无需为旧数据预留 |

> **提示**：安装会清空 U 盘全部数据，但**只需要做这一次**。以后往 U 盘里加减系统镜像，都不用再重复安装。

![](images/guides/ventoy/ventoy-02.jpg)

![](images/guides/ventoy/ventoy-03.jpg)

![](images/guides/ventoy/ventoy-04.jpg)

### 第 2 步：把 ISO 文件拷进 U 盘

安装完成后，U 盘会多出一个大容量分区。打开它，把下载好的 ISO 文件直接复制进去就行——想放几个放几个，Windows、Ubuntu、PE 工具箱可以共存在同一块 U 盘里，互不影响。

![](images/guides/ventoy/ventoy-05.jpg)

![](images/guides/ventoy/ventoy-06.jpg)

### 第 3 步：用 U 盘启动，选择要装的系统

把 U 盘插到目标电脑上，开机时按启动菜单键（多数品牌是 F12、F9 或 Esc），选择从 U 盘启动。Ventoy 会自动列出 U 盘里所有的 ISO 文件，用方向键选中一个，回车即可开始启动。

![](images/guides/ventoy/ventoy-07.jpg)

## 常见问题

1. **能一直当普通 U 盘用吗？** 可以。装好 Ventoy 后 U 盘照样能存文件，当启动盘和当普通 U 盘两不误。
2. **怎么升级 Ventoy 版本？** 重新打开 `Ventoy2Disk.exe`，点击「升级」即可，U 盘里的镜像和数据都不会丢。
3. **想换回普通 U 盘？** 在同一个界面点「安装」→ 选择「清除 Ventoy」，或者直接格式化一次。
4. **ISO 太多不好找？** 可以把镜像按文件夹分类（比如 `Windows/`、`Linux/`），启动菜单里同样能识别。

---

更多细节请参考 [Ventoy 官方文档](https://www.ventoy.net/cn/doc_start.html)。
