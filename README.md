# 포켓몬슬립 식재료 계산기

- [포켓몬슬립 식재료 계산기](#포켓몬슬립-식재료-계산기)
  - [1. Description](#1-description)
  - [2. About Project](#2-about-project)
    - [2.1. Skills](#21-skills)
    - [2.2. Architecture](#22-architecture)
      - [2.2.1. System Architecture](#221-system-architecture)
      - [2.2.2. CI/CD Pipeline Architecture](#222-cicd-pipeline-architecture)
      - [2.2.3. ERD](#223-erd)
    - [2.3. Directory Structure](#23-directory-structure)
  - [3. Result](#3-result)
    - [3.1. Fuctions](#31-fuctions)
    - [3.2. Service Examples](#32-service-examples)


<br>

## 1. Description

> 2025.09. - 2025.10.

```
가진 식재료로 만들 수 있는 레시피 보기가 너무 어려워..
스프레드 시트로 보고는 있지만, 웹이랑 모바일에서 편하게 보면서 관리하고 싶다!
내 잠만보를 메가만보로 만들 때까지 최고로 먹이겠어!
```

- 🍎 '포켓몬 슬립' 게임의 `식재료` 및 `레시피` 정보를 관리하는 웹 서비스
- **식재료 수량**을 버튼/숫자로 **입력**하거나 **캡쳐 이미지를 업로드**하여 저장
- 현재 식재료 수량과 냄비 용량을 기반으로 보기 편한 **레시피 목록** 관리
- 개인 프로젝트

[서비스 바로가기](http://3.39.134.245/)



<br>

## 2. About Project

### 2.1. Skills
|🛠️|||
|:---|:---|:---|
|**Backend**        |Language   |<img src="https://img.shields.io/badge/Java 17-007396?logo=CoffeeScript&logoColor=white"/>|
|                   |Framework  |<img src="https://img.shields.io/badge/SpringBoot 3.5-6DB33F?logo=springboot&logoColor=white"/>|
|                   |ORM        |<img src="https://img.shields.io/badge/Spring Data JPA-6DB33F?logo=spring&logoColor=white"/>|
|                   |Authorization        |<img src="https://img.shields.io/badge/Spring Security-6DB33F?logo=springsecurity&logoColor=white"/> <img src="https://img.shields.io/badge/JSON Web Token-181717?logo=jsonwebtokens"/>|
|**Frontend**       |Language   |<img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white"/>|
|                   |Framework  |<img src="https://img.shields.io/badge/NextJS 15-E0234E?logo=next.js&logoColor=white"/>|
|                   |UI         |<img src="https://img.shields.io/badge/React 19-4c768d?logo=react"/> <img src="https://img.shields.io/badge/Tailwind CSS-06B6D4?logo=tailwindcss&logoColor=white"/>|
|**Infra / DevOps** |           |<img src="https://img.shields.io/badge/AWS EC2-FF9900?logo=fugacloud&logoColor=white"/> <img src="https://img.shields.io/badge/Nginx-009639?logo=nginx&logoColor=white"/> <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white"/> <img src="https://img.shields.io/badge/GitHub Actions-181717?logo=github&logoColor=white"/>|
|**DB**             |           |<img src="https://img.shields.io/badge/AWS RDS-FF9900?logo=onlyoffice&logoColor=white"/> <img src="https://img.shields.io/badge/MariaDB-003545?logo=mariadb&logoColor=white"/>|
|**Others**         |           |<img src="https://img.shields.io/badge/Google Cloud Vision API-4285F4?logo=googlecloud&logoColor=white"/>|



<br>

### 2.2. Architecture

#### 2.2.1. System Architecture

<img src=images/system_architecture2.png  width="60%"/>


#### 2.2.2. CI/CD Pipeline Architecture

<img src=images/cicd_architecture.png  width="80%"/>


#### 2.2.3. ERD

<img src=images/erd2.png  width="60%"/>



<br>

### 2.3. Directory Structure

```
├─ .github/workflows/cicd.yml         # Github Actions CI/CD Workflow
├─ 🗂️ backend/
│  ├─ build.gradle
│  ├─ Dockerfile
│  └─ 🗂️ src/
│     ├─ 🗂️ main/java/com/syun/posleep/
│     │  ├─ PosleepApplication.java
│     │  ├─ 🗂️ aspects/                         # 컨트롤러/서비스 공통 로직(AOP)
│     │  ├─ 🗂️ config/                          # 설정
│     │  ├─ 🗂️ domain/                          # JPA 엔티티
│     │  ├─ 🗂️ dto/                             # request/response DTO
│     │  ├─ 🗂️ query/                           # 조회 전용 Row DTO
│     │  ├─ 🗂️ repository/                      # JPA 리포지토리, native 쿼리
│     │  ├─ 🗂️ security/                        # 인증/보안
│     │  ├─ 🗂️ service/                         # 비즈니스 로직
│     │  └─ 🗂️ web/                             # REST 컨트롤러
│     ├─ 🗂️ main/resources/
│     │  ├─ application.properties              # 개발 환경변수
│     │  └─ application-prod.properties         # 운영 환경변수
│     └─ 🗂️ test/java/...
├─ 🗂️ frontend/
│  ├─ Dockerfile
│  ├─ next.config.ts
│  ├─ 🗂️ src/
│  │  ├─ 🗂️ app/
│  │  │  ├─ page.tsx                  # 홈 페이지
│  │  │  ├─ 🗂️ recipes/               # 레시피 목록 페이지
│  │  │  └─ 🗂️ ingredients/           # 식재료 목록 페이지
│  │  ├─ 🗂️ components/ui/            # UI 컴포넌트
│  │  ├─ 🗂️ types/                    # ApiResponse<T> 등 타입 정의
│  │  └─ utils/IngrredientIcon.ts     # 아이콘 이미지 매핑 util
│  └─ 🗂️ public/...                   # 이미지 파일
├─ 🗂️ infra/
│  ├─ docker-compose.yml          # Container 오케스트레이션 구성 파일
│  └─ nginx/nginx.conf            # / → 프론트, /api → 백엔드 리버스 프록시
├─ 🗂️ gradle/wrapper/...
└─ settings.gradle
```



<br>

## 3. Result

### 3.1. Fuctions
|화면      |기능       |상세|
|:-:|:-:|:-|
|🍎 식재료  |`조회`         |**식재료의 등록여부 및 보유수량을 조회한다**<br>‣ 기본 : `등록여부` filter & `(번호↓)` sort<br>‣ 현재 카테고리 & 목표설정된 레시피인 식재료 목표 수량을 표시<br>|
|         |`저장`         |**식재료의 등록여부 및 보유수량을 저장한다**|
|         |`업로드`       |**식재료 가방의 캡쳐 이미지를 업로드하여 식재료 수량을 업데이트한다**<br>‣ 이미지에 없는 식재료의 경우 수량 0으로 설정<br>‣ Google Cloud Vision API (OCR)|
|🥗 레시피  |`조회`         |**레시피 목록 및 냄비 정보를 조회한다**<br>‣ 기본 : `현재 카테고리` filter & `(목표여부↑,총필요수량↓,에너지↑)` sort<br>‣ 현재 식재료 수량 기준 `MAX(부족한 수량, 0)`으로 필요 수량 표시<br>‣ 식재료 보유수량 및 냄비용량에 따라 색깔 표시<br>‣ 요리명 / 분류 / 재료명으로 검색 가능|
|         |`냄비저장`     |**냄비용량 / 캠프여부 / 카테고리를 저장한다**|
|         |`저장`         |**레시피 목표여부 / 등록여부를 저장한다**|
|         |`요리실행`     |**해당 레시피에 대해 요리를 실행한다**<br>‣ 필요 수량을 만족한 경우에만 버튼 활성화<br>‣ 식재료 수량이 레시피만큼 감소|

<br>

### 3.2. Service Examples
| 🏠 홈 페이지 ( / ) |
|:-:|
|<img src=images/result/desktop_login.png  width="80%"/><br>로그인 화면|
|<img src=images/result/desktop_signup.png  width="80%"/><br>회원가입 화면|
|<img src=images/result/desktop_home.png  width="80%"/><br>홈 화면|

<br>

|🍎 식재료 화면 (/ingredients)|
|:-:|
|<img src=images/result/desktop_ingredients_description.png  width="80%"/><br>Desktop|
|<img src=images/result/mobile_ingredients.png  width="30%"/><br>Mobile|

<br>

|🥗 레시피 화면 (/recipes)|
|:-:|
|<img src=images/result/desktop_recipes_description.png  width="80%"/><br>Desktop|
|<img src=images/result/mobile_recipes.png  width="30%"/><br>Mobile<br>(카드 리스트)|


<br>
