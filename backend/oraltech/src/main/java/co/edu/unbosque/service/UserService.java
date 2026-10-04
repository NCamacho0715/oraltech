package co.edu.unbosque.service;

import co.edu.unbosque.dto.CreateUserRequest;
import co.edu.unbosque.dto.UpdateUserRoleRequest;
import co.edu.unbosque.dto.UserResponse;
import co.edu.unbosque.entity.User;
import co.edu.unbosque.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El nombre de usuario ya está registrado");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo electrónico ya está registrado");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .email(request.getEmail())
                .role(request.getRole())
                .build();

        return mapToResponse(userRepository.save(user));
    }

    public UserResponse updateUserRole(Long id, UpdateUserRoleRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        user.setRole(request.getRole());
        return mapToResponse(userRepository.save(user));
    }

    public void deleteUser(Long id, String currentUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        if (user.getUsername().equalsIgnoreCase(currentUsername)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes eliminar tu propia cuenta de administrador");
        }
        userRepository.delete(user);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
