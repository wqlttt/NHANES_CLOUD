# GitHub更新操作指南

## 1. 常规更新（无本地修改）
```bash
# 进入项目目录
cd /root/NHANES_WEB

# 拉取最新代码
git pull origin master
```

## 2. 安全更新（有本地修改）
```bash
# 1. 查看当前状态
git status

# 2. 备份本地修改（如果需要）
git stash save "本地修改备份"

# 3. 拉取最新代码
git pull origin master

# 4. 恢复本地修改（如果需要）
git stash pop
```

## 3. 强制更新（放弃本地修改）
```bash
# 1. 重置所有本地修改
git reset --hard HEAD

# 2. 强制拉取最新代码
git pull origin master --force
```

## 4. 更新后的检查
```bash
# 1. 检查文件是否更新
git status

# 2. 查看最近的提交记录
git log --oneline -5

# 3. 检查具体文件变化
git diff HEAD^
```

## 5. 常见问题处理

### 5.1 合并冲突
如果遇到合并冲突，会看到类似提示：
```
CONFLICT (content): Merge conflict in [文件名]
```

解决步骤：
1. 打开冲突文件
2. 查找冲突标记 <<<<<<< HEAD
3. 手动解决冲突
4. 保存文件
5. git add [冲突文件]
6. git commit -m "解决合并冲突"

### 5.2 更新失败
如果pull失败，可以尝试：
```bash
# 1. 清理本地缓存
git clean -fd

# 2. 重新拉取
git pull origin master
```

### 5.3 分支落后
如果本地分支落后于远程：
```bash
# 1. 获取远程最新信息
git fetch origin

# 2. 重置到远程状态
git reset --hard origin/master
```

## 6. 更新后的服务重启
更新完代码后，需要重启服务：

```bash
# 1. 停止服务
sudo systemctl stop nginx
sudo supervisorctl stop nhanes-backend

# 2. 更新前端（如果需要）
cd /root/NHANES_WEB/frontend
npm install
npm run build

# 3. 更新后端（如果需要）
cd /root/NHANES_WEB/backend
source nhanes/bin/activate
pip install -r requirements.txt

# 4. 重启服务
sudo systemctl start nginx
sudo supervisorctl start nhanes-backend

# 5. 检查服务状态
sudo systemctl status nginx
sudo supervisorctl status nhanes-backend
```

