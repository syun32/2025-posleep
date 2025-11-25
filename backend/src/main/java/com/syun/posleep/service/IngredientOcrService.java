package com.syun.posleep.service;


import com.google.cloud.vision.v1.*;
import com.google.protobuf.ByteString;
import com.syun.posleep.domain.UserIngredient;
import com.syun.posleep.repository.UserIngredientRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class IngredientOcrService {
    private final Pattern COUNT_LINE = Pattern.compile("^[xX]\\s*(\\d{1,3})$");
    private final Pattern KOREAN_NAME = Pattern.compile(".*[가-힣].*");
    private final String END_ANCHORS = "돌아간다";

    private final UserIngredientRepository repo;

    public IngredientOcrService(UserIngredientRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public void processAndApply(MultipartFile image, Integer userId) throws Exception {
        String fullText = callVision(image);

        Map<String,Integer> ocrResults = parseNameCounts(fullText);
        List<UserIngredient> userIngredients = repo.findByUserId(userId);

        for (UserIngredient ing : userIngredients) {
            String name = ing.getIngredient().getName();
            Integer parseCount = ocrResults.get(name);

            if (parseCount != null) {
                ing.setQuantity(parseCount);
                ing.setIsRegistered(true);
            } else {
                ing.setQuantity(0);
            }
        }
    }

    private String callVision(MultipartFile image) throws Exception {
        ByteString imgBytes = ByteString.copyFrom(image.getBytes());
        Image img = Image.newBuilder().setContent(imgBytes).build();

        Feature feat = Feature.newBuilder()
                .setType(Feature.Type.TEXT_DETECTION)
                .build();

        AnnotateImageRequest request = AnnotateImageRequest.newBuilder()
                .addFeatures(feat)
                .setImage(img)
                .build();

        try (ImageAnnotatorClient client = ImageAnnotatorClient.create()) {
            BatchAnnotateImagesResponse response = client.batchAnnotateImages(List.of(request));
            AnnotateImageResponse res = response.getResponses(0);

            if (res.hasError()) {
                throw new IllegalStateException(res.getError().getMessage());
            }

            return res.getFullTextAnnotation().getText();
        }
    }

    private Map<String, Integer> parseNameCounts(String fullText) {
        Deque<Integer> counts = new ArrayDeque<>();
        Deque<String> names = new ArrayDeque<>();
        Map<String, Integer> result = new LinkedHashMap<>();

        List<String> rawLines = Arrays.stream(fullText.split("\\R"))
                .map(String::trim)
                .toList();
        int startIdx = findStartIndex(rawLines);
        int endIdx = findEndIndex(rawLines, startIdx, END_ANCHORS);

        List<String> lines = rawLines.subList(startIdx, endIdx);
        for (String raw : lines) {
            String line = normalizeLine(raw);
            if (line.isEmpty()) continue;

            Matcher m = COUNT_LINE.matcher(line);
            if (m.matches()) {
                int c = Integer.parseInt(m.group(1));
                counts.addLast(c);
            }
            if (isName(line)) {
                names.addLast(line);
            }

            while (!counts.isEmpty() && !names.isEmpty()) {
                result.put(names.removeFirst(), counts.removeFirst());
            }
        }
        return result;
    }

    private int findStartIndex(List<String> lines) {
        for (int i = 0; i < lines.size(); i++) {
            if (lines.get(i).trim().charAt(0) == 'x') {
                return Math.min(i, lines.size());
            }
        }
        return 0;
    }

    private int findEndIndex(List<String> lines, int from, String endAnchor) {
        for (int i = from; i < lines.size(); i++) {
            if (endAnchor.equals(lines.get(i).trim())) {
                return i;
            }
        }
        return lines.size();
    }

    private String normalizeLine(String s) {
        if (s == null) return "";
        String t = s.trim();
        t = t.replaceAll("^[※+↑\\-\\s]+", "");
        t = t.replaceAll("[※+↑\\-\\s]+$", "");
        return t;
    }

    private boolean isName(String s) {
        if (s.isEmpty()) return false;
        if (!KOREAN_NAME.matcher(s).matches()) return false;
        if (s.length() < 2 || s.length() > 20) return false;
        if (COUNT_LINE.matcher(s).matches()) return false;
        if (s.split(" ").length > 1) return false;
        return true;
    }
}
