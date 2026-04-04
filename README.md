# AURA Shop

이 프로젝트는 Java 21, Spring Boot, React, MySQL, Redis를 사용하여 구축된 풀스택 웹 애플리케이션입니다.

## 🛠 기술 스택 (Tech Stack)

### Backend
- **Language**: Java 21
- **Framework**: Spring Boot
- **Database**: MySQL
- **Cache / Session**: Redis
- **Build Tool**: Gradle

### Frontend
- **Library**: React
- **Package Manager**: npm/yarn

### Infrastructure / Deployment
- **Containerization**: Docker, Docker Compose

---

## 🚀 로컬 실행 가이드 (Local Installation Guide)

### 필수 조건 (Prerequisites)
- Docker 및 Docker Compose 가 설치되어 있어야 합니다.
- (선택) 로컬 개발을 위해 Node.js 및 Java 21 환경이 설정되어 있으면 좋습니다.

### 1. 저장소 클론 (Clone the Repository)
```bash
git clone <repository-url>
cd AURA
```

### 2. 환경 변수 설정 (Environment Variables)
데이터베이스와 Redis 연결 정보를 설정하기 위해 프로젝트 루트, 백엔드(`src/main/resources/`) 및 프론트엔드(`frontend/`)에 필요한 환경 변수 파일(`.env`, `application.yml` 등)을 세팅해야 합니다.

### 3. Docker를 이용한 배포 및 실행 (Run with Docker)
이 애플리케이션은 편의성을 위해 Docker Compose로 쉽게 올릴 수 있도록 구성되어 있습니다. DB, Redis, Backend, Frontend 를 포괄하여 한 번에 빌드하고 백그라운드에서 실행하려면 아래 명령어를 사용합니다.

```bash
docker-compose up -d --build
```
> 도커 이미지가 빌드되고 모든 컨테이너가 실행된 후, 알맞은 포트 (예: 프론트엔드 http://localhost:3000, 백엔드 API http://localhost:8080)로 접속하여 정상 동작 유무를 확인합니다.

---

## ☁️ 클라우드 배포 시 주의사항 (Cloud Deployment Considerations)

Docker를 기반으로 GCP, AWS, Azure 등의 실 서비스 클라우드에 배포할 때 다음 사항을 반드시 지켜주세요.

### 1. 보안 및 크레덴셜 (Security & Secrets)
- **DB 비밀번호, API 키, 인증서 등 민감한 정보는 절대로 Github(소스 코드)나 `docker-compose.yml` 파일에 평문으로 커밋하지 마세요.**
- 대신 클라우드 제공자의 환경 변수 관리 서비스 (예: AWS Secrets Manager, GitHub Secrets) 나 `.env` 파일을 활용해 런타임에 주입하도록 설정하세요.

### 2. 데이터 영속성 (Data Persistence)
- 로컬에서는 도커 볼륨에 데이터를 남기기도 하지만, 클라우드 운영 환경(Production)에서 MySQL과 Redis 같은 데이터 저장소는 컨테이너 내부나 일반 도커 볼륨으로 띄우는 것보다 **관리형 서비스(Managed Service, 예: AWS RDS, ElastiCache)를 사용하는 것을 강력히 권장**합니다. 성능 및 데이터 안전성 보장에 훨씬 유리합니다.
- 꼭 Docker로 디비를 직접 띄울 예정이라면, 컨테이너 종료/삭제 시 데이터가 날아가지 않도록 클라우드의 외부 디스크 볼륨(EBS 등)을 도커 볼륨에 마운트해야 합니다.

### 3. 접근 제어 및 네트워크 분리 (Network Security)
- 외부 네트워크에서는 프론트엔드 서버(일반적으로 80, 443 포트)와 백엔드 API 엔드포인트만 접근 가능해야 합니다.
- **MySQL(3306)과 Redis(6379)** 포트는 인터넷(외부망)에서 바로 접근할 수 없도록 클라우드 방화벽(Security Group, VPC 설정)을 막아두고, 백엔드 서버(내부망)에서만 접근을 허용해야 합니다.

### 4. 로그 관리 (Logging)
- Docker 컨테이너의 표준 출력 로그는 컨테이너가 삭제되면 유실됩니다. 클라우드의 중앙 집중식 로깅 시스템(AWS CloudWatch 로그, Datadog 등)으로 컨테이너의 로그를 수집하여 보내야 운영 중 문제 파악이 용이합니다.

### 5. HTTPS 및 리버스 프록시 적용
- 실제 운영에서는 클라우드의 로드 밸런서(ALB 등)나 Nginx 컨테이너를 도입해 **SSL(HTTPS) 인증서**를 달아줘야 보안상 안전합니다.
