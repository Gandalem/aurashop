# 1단계: 빌드 스테이지
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
# 소스 복사 (docker-compose가 있는 위치 기준)
COPY . .
# 실행 권한 부여 및 빌드 (테스트는 제외하여 속도 향상)
RUN chmod +x ./gradlew
RUN ./gradlew clean build -x test

# 2단계: 실행 스테이지
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# 빌드된 jar 파일만 가져오기
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]