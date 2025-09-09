package com.syun.posleep.aspects;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Aspect
@Component
public class ApiLoggingAspect {

    @Pointcut("execution(* com.syun.posleep.web..*(..))")
    public void controller() {
    }
    @Pointcut("execution(* com.syun.posleep.service..*(..))")
    public void service(){}

    @Around("controller()")
    public Object logRequest(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest req = currentRequest();
        String method = (req != null ? req.getMethod() : "NULL");
        String uri = (req != null ? req.getRequestURI() : "NULL");
        String params = (req != null ? formQueryParams(req) : "{}");

        log.info("[{}]\tRequest Called\t>>> '{}', params={}", method, uri, params);
        try {
            Object result = joinPoint.proceed();
            log.info("[{}]\tRequest Success\t<<< '{}'", method, uri);
            return result;
        } catch (Throwable e) {
            log.error("!!! [{}]\tRequest Failed\t<<< '{}', Exception={}", method, uri, e);
            throw e;
        }
    }

    @Around("service()")
    public Object logService(ProceedingJoinPoint joinPoint) throws Throwable {
        String className = joinPoint.getSignature().getDeclaringType().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        String fullName = className + "." + methodName;

        log.info("[{}] Method Called\t>>> '{}'", className, fullName);
        try {
            Object result = joinPoint.proceed();
            log.info("[{}] Method Success\t>>> '{}'", className, fullName);
            return result;
        } catch (Throwable e) {
            log.error("!!! [{}] Method Failed\t>>> '{}', Exception={}", className, fullName, e);
            throw e;
        }
    }

    /* ====== Helper ====== */
    private HttpServletRequest currentRequest() {
        var attrs = RequestContextHolder.getRequestAttributes();
        if (attrs instanceof ServletRequestAttributes sra) {
            return sra.getRequest();
        }
        return null;
    }

    private String formQueryParams(HttpServletRequest req) {
        String qs = req.getQueryString();
        if (qs == null || qs.isBlank())     return "{}";

        List<String> parts = new ArrayList<>();

        for (String pair : qs.split("&")) {
            if (pair.isBlank()) continue;

            int idx = pair.indexOf('=');
            String key = (idx >= 0) ? pair.substring(0, idx) : pair;
            String value = (idx >= 0) ? urlDecode(pair.substring(idx + 1)) : "";
            parts.add(key + "=" + value);
        }

        if (parts.isEmpty())    return "{}";
        return "{" + String.join(", ", parts) + "}";
    }

    private String urlDecode(String s) {
        try {
            return java.net.URLDecoder.decode(s, StandardCharsets.UTF_8);
        } catch (IllegalArgumentException e) {
            return s;
        }
    }
}
