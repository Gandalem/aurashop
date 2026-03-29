package com.aura.shop.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "http://localhost:5173")
public class FileUploadController {

    // 🌟 이미지를 저장할 폴더 경로 (프로젝트 최상단에 'uploads' 라는 폴더가 자동 생성됩니다)
    private final String uploadDir = System.getProperty("user.dir") + "/uploads/";

    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("파일이 비어있습니다.");
        }

        try {
            // 폴더가 없으면 새로 만들기
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // 파일 이름 중복 방지를 위해 무작위 문자열(UUID)을 앞에 붙임
            String originalFilename = file.getOriginalFilename();
            String uniqueFilename = UUID.randomUUID().toString() + "_" + originalFilename;

            // 파일 물리적으로 저장하기
            File dest = new File(uploadDir + uniqueFilename);
            file.transferTo(dest);

            // 🌟 저장된 이미지를 웹에서 볼 수 있는 URL 주소 만들어서 반환!
            String imageUrl = "http://localhost:8080/uploads/" + uniqueFilename;

            return ResponseEntity.ok(imageUrl);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("파일 업로드에 실패했습니다.");
        }
    }
}