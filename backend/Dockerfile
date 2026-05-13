# syntax=docker/dockerfile:1.7

# ── Build stage ───────────────────────────────────
FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn -B clean package -DskipTests \
    && mkdir -p target/extracted \
    && java -Djarmode=layertools -jar target/*.jar extract --destination target/extracted

# ── Runtime stage ─────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

RUN addgroup -S app && adduser -S -G app app \
    && apk add --no-cache curl tini

WORKDIR /app

ARG EXTRACTED=/app
COPY --from=builder /app/target/extracted/dependencies/         ${EXTRACTED}/
COPY --from=builder /app/target/extracted/spring-boot-loader/   ${EXTRACTED}/
COPY --from=builder /app/target/extracted/snapshot-dependencies/ ${EXTRACTED}/
COPY --from=builder /app/target/extracted/application/          ${EXTRACTED}/

USER app

EXPOSE 8080

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -Djava.security.egd=file:/dev/./urandom"

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -fsS http://localhost:${PORT:-8080}/actuator/health/liveness || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["sh", "-c", "exec java $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher"]
