FROM node:20-alpine

WORKDIR /app

# 复制依赖
COPY package*.json ./
RUN npm install

# 安装 TypeScript 编译器
RUN npm install -g typescript ts-node

# 复制源代码
COPY ./src ./src

# 暴露端口
EXPOSE 3000

# 启动 TS 后端
CMD ["ts-node", "src/index.ts"]
