package com.syun.posleep.web;

import com.syun.posleep.domain.User;
import com.syun.posleep.dto.request.LoginRequest;
import com.syun.posleep.dto.request.SignUpRequest;
import com.syun.posleep.dto.response.LoginResponse;
import com.syun.posleep.repository.UserRepository;
import com.syun.posleep.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        log.info("Login: ID={}", request.getName());
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(request.getName(), request.getPassword());

        try {
            Authentication authentication = authenticationManager.authenticate(authToken);

            String name = authentication.getName();

            User user = userRepository.findByName(name)
                    .orElseThrow(() -> new IllegalStateException("유저가 존재하지 않습니다."));

            String token = jwtTokenProvider.createToken(user.getId(), user.getName());

            return ResponseEntity.ok(new LoginResponse(token));
        } catch (AuthenticationException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("아이디 또는 비밀번호가 올바르지 않습니다.");
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody SignUpRequest request) {
        log.info("SignUp: ID={}", request.getName());

        if (userRepository.existsByName(request.getName())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("이미 사용 중인 아이디입니다.");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User(request.getName(), encodedPassword);

        userRepository.save(user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body("회원가입이 완료되었습니다.");
    }
}
