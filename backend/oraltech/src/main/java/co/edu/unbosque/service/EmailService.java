package co.edu.unbosque.service;

import co.edu.unbosque.entity.Appointment;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("EEEE d 'de' MMMM 'de' yyyy", new Locale("es", "CO"));
    private static final DateTimeFormatter TIME_FMT =
            DateTimeFormatter.ofPattern("hh:mm a", new Locale("es", "CO"));

    // ── Confirmación de cita ──────────────────────────────────────────────────

    @Async
    public void sendConfirmationEmail(Appointment appt) {
        String to = appt.getPatient().getEmail();
        if (to == null || to.isBlank()) {
            log.warn("Paciente {} no tiene email, omitiendo confirmación.", appt.getPatient().getId());
            return;
        }
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject("✅ Cita Confirmada — Consultorio Odontológico JG");
            helper.setText(buildConfirmationHtml(appt), true);
            mailSender.send(msg);
            log.info("Correo de confirmación enviado a {}", to);
        } catch (MessagingException e) {
            log.error("Error enviando confirmación a {}: {}", to, e.getMessage());
        }
    }

    // ── Recordatorio 24 h antes ───────────────────────────────────────────────

    @Async
    public void sendReminderEmail(Appointment appt) {
        String to = appt.getPatient().getEmail();
        if (to == null || to.isBlank()) {
            log.warn("Paciente {} no tiene email, omitiendo recordatorio.", appt.getPatient().getId());
            return;
        }
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject("🔔 Recordatorio de Cita — Consultorio Odontológico JG");
            helper.setText(buildReminderHtml(appt), true);
            mailSender.send(msg);
            log.info("Recordatorio enviado a {}", to);
        } catch (MessagingException e) {
            log.error("Error enviando recordatorio a {}: {}", to, e.getMessage());
        }
    }

    // ── HTML Templates ────────────────────────────────────────────────────────

    private String buildConfirmationHtml(Appointment appt) {
        String name    = appt.getPatient().getNames() + " " + appt.getPatient().getFirstSurname();
        String date    = appt.getAppointmentDate().format(DATE_FMT);
        String start   = appt.getStartTime().format(TIME_FMT);
        String end     = appt.getEndTime().format(TIME_FMT);
        String title   = appt.getTitle();
        String notes   = appt.getNotes() != null && !appt.getNotes().isBlank()
                ? "<p style='margin:0;color:#555;font-size:14px;'><strong>Notas:</strong> " + appt.getNotes() + "</p>"
                : "";

        return """
            <!DOCTYPE html>
            <html lang="es">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
            <body style="margin:0;padding:0;background:#f0f7ff;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f0f7ff;padding:40px 0;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,119,182,0.10);">

                    <!-- Header -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#0077b6,#00b4d8);padding:36px 40px;text-align:center;">
                        <div style="font-size:32px;margin-bottom:8px;">🦷</div>
                        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">
                          Consultorio Odontológico JG
                        </h1>
                        <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                          Tu cita ha sido confirmada
                        </p>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:40px;">
                        <p style="margin:0 0 24px;color:#1d3557;font-size:16px;">
                          Hola, <strong>%s</strong> 👋
                        </p>
                        <p style="margin:0 0 28px;color:#457b9d;font-size:15px;line-height:1.6;">
                          Tu cita ha sido agendada exitosamente. Aquí tienes los detalles:
                        </p>

                        <!-- Appointment card -->
                        <div style="background:#f0f7ff;border-left:4px solid #0077b6;border-radius:0 12px 12px 0;padding:24px;margin-bottom:28px;">
                          <table width="100%%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding-bottom:14px;">
                                <span style="font-size:12px;font-weight:700;color:#457b9d;text-transform:uppercase;letter-spacing:0.06em;">Motivo</span><br>
                                <span style="font-size:16px;font-weight:700;color:#1d3557;">%s</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom:14px;">
                                <span style="font-size:12px;font-weight:700;color:#457b9d;text-transform:uppercase;letter-spacing:0.06em;">Fecha</span><br>
                                <span style="font-size:15px;color:#1d3557;">📅 %s</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom:4px;">
                                <span style="font-size:12px;font-weight:700;color:#457b9d;text-transform:uppercase;letter-spacing:0.06em;">Hora</span><br>
                                <span style="font-size:15px;color:#1d3557;">🕐 %s — %s</span>
                              </td>
                            </tr>
                          </table>
                        </div>

                        %s

                        <p style="margin:28px 0 0;color:#457b9d;font-size:14px;line-height:1.6;">
                          Si necesitas cancelar o reprogramar tu cita, comunícate con nosotros con anticipación.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background:#f8fbff;padding:24px 40px;text-align:center;border-top:1px solid #e3f2fd;">
                        <p style="margin:0;color:#90a4b4;font-size:12px;">
                          © 2026 Consultorio Odontológico JG · OralTech
                        </p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(name, title, date, start, end, notes);
    }

    private String buildReminderHtml(Appointment appt) {
        String name  = appt.getPatient().getNames() + " " + appt.getPatient().getFirstSurname();
        String date  = appt.getAppointmentDate().format(DATE_FMT);
        String start = appt.getStartTime().format(TIME_FMT);
        String end   = appt.getEndTime().format(TIME_FMT);
        String title = appt.getTitle();

        return """
            <!DOCTYPE html>
            <html lang="es">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
            <body style="margin:0;padding:0;background:#f0f7ff;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f0f7ff;padding:40px 0;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,119,182,0.10);">

                    <!-- Header -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#f59e0b,#fbbf24);padding:36px 40px;text-align:center;">
                        <div style="font-size:32px;margin-bottom:8px;">🔔</div>
                        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">
                          Recordatorio de Cita
                        </h1>
                        <p style="margin:6px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">
                          Tu cita es mañana
                        </p>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:40px;">
                        <p style="margin:0 0 24px;color:#1d3557;font-size:16px;">
                          Hola, <strong>%s</strong> 👋
                        </p>
                        <p style="margin:0 0 28px;color:#457b9d;font-size:15px;line-height:1.6;">
                          Te recordamos que tienes una cita programada para <strong>mañana</strong>:
                        </p>

                        <!-- Appointment card -->
                        <div style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 12px 12px 0;padding:24px;margin-bottom:28px;">
                          <table width="100%%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding-bottom:14px;">
                                <span style="font-size:12px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.06em;">Motivo</span><br>
                                <span style="font-size:16px;font-weight:700;color:#1d3557;">%s</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom:14px;">
                                <span style="font-size:12px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.06em;">Fecha</span><br>
                                <span style="font-size:15px;color:#1d3557;">📅 %s</span>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <span style="font-size:12px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.06em;">Hora</span><br>
                                <span style="font-size:15px;color:#1d3557;">🕐 %s — %s</span>
                              </td>
                            </tr>
                          </table>
                        </div>

                        <!-- Tips -->
                        <div style="background:#f0fdf4;border-radius:12px;padding:20px;margin-bottom:24px;">
                          <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#166534;">💡 Recomendaciones</p>
                          <ul style="margin:0;padding-left:18px;color:#166534;font-size:13px;line-height:1.8;">
                            <li>Llega 10 minutos antes de tu cita.</li>
                            <li>Trae tu documento de identidad.</li>
                            <li>Si tomaste algún medicamento nuevo, infórmalo al odontólogo.</li>
                          </ul>
                        </div>

                        <p style="margin:0;color:#457b9d;font-size:14px;line-height:1.6;">
                          Si no puedes asistir, comunícate con nosotros lo antes posible para reprogramar.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background:#f8fbff;padding:24px 40px;text-align:center;border-top:1px solid #e3f2fd;">
                        <p style="margin:0;color:#90a4b4;font-size:12px;">
                          © 2026 Consultorio Odontológico JG · OralTech
                        </p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(name, title, date, start, end);
    }
}
