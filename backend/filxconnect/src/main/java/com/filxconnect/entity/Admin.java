/**
 *
 */
package com.filxconnect.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Data;
import org.hibernate.annotations.*;

import jakarta.persistence.*;
import jakarta.persistence.Table;

/**
 *
 */
@Data
@Entity
@Table(name="admins")
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID aid;

    @Column(nullable = false, unique = false, length = 50)
    private String aname;

    @Column(nullable = false, unique = true, length = 100)
    private String aemail;

    @Column(nullable = false, unique = false, length = 16)
    private String apass;

    @Column
    private String aprofilepic;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime acreatedate;

    @UpdateTimestamp
    private LocalDateTime aupdatedate;

    public UUID getAid() {
        return aid;
    }

    public void setAid(UUID aid) {
        this.aid = aid;
    }

    public String getAname() {
        return aname;
    }

    public void setAname(String aname) {
        this.aname = aname;
    }

    public String getAemail() {
        return aemail;
    }

    public void setAemail(String aemail) {
        this.aemail = aemail;
    }

    public String getApass() {
        return apass;
    }

    public void setApass(String apass) {
        this.apass = apass;
    }

    public String getAprofilepic() {
        return aprofilepic;
    }

    public void setAprofilepic(String aprofilepic) {
        this.aprofilepic = aprofilepic;
    }

    public LocalDateTime getAcreatedate() {
        return acreatedate;
    }

    public void setAcreatedate(LocalDateTime acreatedate) {
        this.acreatedate = acreatedate;
    }

    public LocalDateTime getAupdatedate() {
        return aupdatedate;
    }

    public void setAupdatedate(LocalDateTime aupdatedate) {
        this.aupdatedate = aupdatedate;
    }

}
