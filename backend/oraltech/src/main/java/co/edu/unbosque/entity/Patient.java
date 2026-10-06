package co.edu.unbosque.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.Period;

@Entity
@Table(name = "patients")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstSurname;

    private String secondSurname;

    @Column(nullable = false)
    private String names;

    @Column(nullable = false)
    private String idType;

    @Column(unique = true, nullable = false)
    private String idNumber;

    private String email;

    private String sex;

    @Column(nullable = false)
    private LocalDate birthDate;

    // We can calculate age dynamically, but storing it might be useful for
    // snapshots
    private Integer age;

    private String civilStatus;

    private String occupation;

    private String eps;

    private String residenceAddress;

    private String residencePhone;

    private String residencePlace;

    private String officePlace;

    private String officePhone;

    private String emergencyPhone;

    private String cellphone;

    private String guardianName;

    private String guardianRelationship;

    private String guardianPhone;

    private String referredBy;

    private String referrerPhone;
 
    @Transient
    private Boolean hasHistoriaClinica;

    @PostLoad
    @PostPersist
    @PostUpdate
    public void calculateAge() {
        if (birthDate != null) {
            this.age = Period.between(birthDate, LocalDate.now()).getYears();
        }
    }
}
