package co.edu.unbosque.config;

import co.edu.unbosque.entity.User;
import co.edu.unbosque.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.Enumeration;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminUserInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${oraltech.admin.username:admin}")
    private String adminUsername;

    @Value("${oraltech.admin.password:Admin123*}")
    private String adminPassword;

    @Value("${oraltech.admin.email:admin@oraltech.com}")
    private String adminEmail;

    @Value("${oraltech.admin.name:Administrador del Sistema}")
    private String adminName;

    @Override
    public void run(String... args) {
        try {
            if (!userRepository.existsByRole(User.Role.ADMIN)
                    && !userRepository.existsByUsername(adminUsername)
                    && !userRepository.existsByEmail(adminEmail)) {
                User defaultAdmin = User.builder()
                        .username(adminUsername)
                        .password(passwordEncoder.encode(adminPassword))
                        .name(adminName)
                        .email(adminEmail)
                        .role(User.Role.ADMIN)
                        .build();
                userRepository.save(defaultAdmin);
                log.info("Cuenta administradora inicial creada automáticamente (usuario: '{}').", adminUsername);
            }
        } catch (Exception e) {
            log.warn("No se pudo verificar o crear el usuario administrador inicial: {}", e.getMessage());
        }
    }

    @EventListener(ApplicationReadyEvent.class)
    public void printReadyBanner() {
        String lanIp = detectLanIp();
        String banner = """

                ================================================================================
                  [OK]  EL SISTEMA ORALTECH YA ESTA LISTO PARA USARSE
                ================================================================================

                  Ya puedes ingresar a la aplicacion desde tu navegador web:

                    -> En este computador:
                       http://localhost:5173

                    -> Desde otros computadores, tablets o celulares (misma red Wi-Fi / LAN):
                       http://%s:5173

                  Cuenta de Administrador inicial:
                    Usuario: %s   |   Contrasena: %s

                  [!] IMPORTANTE: No cierres esta ventana mientras estes usando OralTech.
                      (Puedes minimizarla en la barra de tareas).
                ================================================================================
                """.formatted(lanIp, adminUsername, adminPassword);

        log.info(banner);
    }

    private String detectLanIp() {
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface iface = interfaces.nextElement();
                if (iface.isLoopback() || !iface.isUp() || iface.isVirtual()) {
                    continue;
                }
                String displayName = iface.getDisplayName().toLowerCase();
                if (displayName.contains("virtual")
                        || displayName.contains("vbox")
                        || displayName.contains("vmware")
                        || displayName.contains("wsl")
                        || displayName.contains("hyper-v")) {
                    continue;
                }
                Enumeration<InetAddress> addresses = iface.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    InetAddress addr = addresses.nextElement();
                    if (addr instanceof Inet4Address && !addr.isLoopbackAddress() && addr.isSiteLocalAddress()) {
                        String ip = addr.getHostAddress();
                        if (!ip.startsWith("192.168.56.")) {
                            return ip;
                        }
                    }
                }
            }
            return InetAddress.getLocalHost().getHostAddress();
        } catch (Exception e) {
            return "IP-DEL-SERVIDOR";
        }
    }
}
