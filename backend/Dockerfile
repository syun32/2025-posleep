# ---------- Build stage: Gradle (project located at /workspace/backend) ----------
FROM gradle:8.7.0-jdk17 AS build
WORKDIR /workspace

# Create project directory
RUN mkdir -p /workspace/backend

# Copy only Gradle build scripts first for better cache reuse
COPY backend/build.gradle /workspace/backend/

# Pre-fetch dependencies for caching
RUN gradle -p backend --no-daemon dependencies || true

# Copy actual source
COPY backend/src /workspace/backend/src

# Build the bootable jar
RUN gradle -p backend --no-daemon clean bootJar

# ---------- Runtime stage: slim JRE 17 ----------
FROM eclipse-temurin:17-jre-alpine AS runtime
ENV APP_HOME=/app     JAVA_OPTS=""     TZ=Asia/Seoul     SPRING_PROFILES_ACTIVE=prod

# Create non-root user
RUN addgroup -S app && adduser -S app -G app
WORKDIR ${APP_HOME}

# Copy jar from build stage
COPY --from=build /workspace/backend/build/libs/*.jar ${APP_HOME}/app.jar

# Optional: healthcheck (enable if Actuator is on)
# HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 CMD wget -qO- http://localhost:8080/actuator/health | grep -q '"status":"UP"' || exit 1

EXPOSE 8080

USER app
ENTRYPOINT ["sh","-c","java ${JAVA_OPTS} -jar /app/app.jar"]
