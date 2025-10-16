package com.syun.posleep.web;

import com.syun.posleep.service.IngredientOcrService;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/ingredients")
public class IngredientOcrController {
    private final IngredientOcrService svc;
    public IngredientOcrController(IngredientOcrService svc) {
        this.svc = svc;
    }

    @PostMapping(
            value = "/ocr",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> ocr(@RequestPart("image") @NotNull MultipartFile image) throws  Exception {
        if (image.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        final String ct = image.getContentType();
        if (ct == null ||
                !(ct.equals(MimeTypeUtils.IMAGE_PNG_VALUE) ||
                        ct.equals(MimeTypeUtils.IMAGE_JPEG_VALUE) ||
                        ct.equals("image/webp"))) {
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).build();
        }

        svc.processAndApply(image);

        return ResponseEntity.ok().build();
    }

}
