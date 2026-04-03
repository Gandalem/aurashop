# 1단계: 빌드 스테이지
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN chmod +x ./gradlew
# 아까 성공했던 그 명령어를 그대로 넣습니다.
RUN ./gradlew clean bootJar -x test

# 2단계: 실행 스테이지
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# [중요] 방금 확인한 정확한 경로로 복사합니다.
COPY --from=build /app/build/libs/app.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]