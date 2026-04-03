# 기존: FROM node:18-alpine AS build
# 수정: Node 22 버전 사용
FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine
# Vite의 기본 빌드 결과물 폴더는 'dist'인 경우가 많습니다.
# 만약 빌드 후 화면이 안 뜨면 아래 경로를 'dist'로 바꿔보세요.
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]