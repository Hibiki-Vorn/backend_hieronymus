FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# 安装 TypeScript
RUN npm install -g typescript

# 复制源码与配置
COPY tsconfig.json ./
COPY src ./src
COPY .env ./

# 预编译 TypeScript -> dist
RUN tsc

EXPOSE 3000

# 默认命令（可被 docker-compose 覆盖）
CMD ["node", "dist/index.js"]
