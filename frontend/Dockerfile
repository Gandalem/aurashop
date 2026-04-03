# 기존: FROM node:18-alpine AS build
# 수정: Node 22 버전 사용
FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine

# 🌟 추가된 핵심 코드: 우리가 만든 설정 파일을 Nginx 기본 설정으로 덮어씌웁니다!
COPY default.conf /etc/nginx/conf.d/default.conf

# Vite의 기본 빌드 결과물 폴더는 'dist'인 경우가 많습니다.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]