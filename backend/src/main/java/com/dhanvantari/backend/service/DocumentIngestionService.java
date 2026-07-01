package com.dhanvantari.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.TextReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentIngestionService {

    private final VectorStore vectorStore;

    public Map<String, Object> ingestMedicalDocuments() {
        Map<String, Object> result = new HashMap<>();
        int fileCount = 0;
        int totalChunks = 0;

        try {
            ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();

            Resource[] resources = resolver.getResources("classpath*:/rag-data/**/*.md");
            log.info("Found {} markdown files for RAG ingestion", resources.length);

            TokenTextSplitter splitter = TokenTextSplitter.builder()
                    .withChunkSize(800)
                    .withMinChunkSizeChars(400)
                    .build();

            for (Resource resource : resources) {
                if (resource.exists() && resource.isReadable()) {
                    try {
                        // Extract language code from parent directory name (e.g., rag-data/hi/remedy.md
                        // -> hi)
                        String path = resource.getURL().getPath().replace("\\", "/");
                        String[] parts = path.split("/");
                        String languageCode = "en"; // default fallback
                        if (parts.length >= 2) {
                            languageCode = parts[parts.length - 2];
                        }

                        log.info("Processing file: {} with language code: {}", resource.getFilename(), languageCode);

                        // Read content using Spring AI's TextReader
                        TextReader textReader = new TextReader(resource);
                        List<Document> documents = textReader.read();

                        // Split/chunk document
                        List<Document> chunks = splitter.apply(documents);

                        // Inject metadata key "language"
                        for (Document chunk : chunks) {
                            chunk.getMetadata().put("language", languageCode);
                        }

                        // Add to database vector store
                        if (!chunks.isEmpty()) {
                            vectorStore.add(chunks);
                            totalChunks += chunks.size();
                        }
                        fileCount++;
                    } catch (Exception e) {
                        log.error("Error processing resource file {}: {}", resource.getFilename(), e.getMessage(), e);
                    }
                }
            }
        } catch (IOException e) {
            log.error("Failed to resolve markdown documents for ingestion", e);
            result.put("error", e.getMessage());
            return result;
        }

        result.put("status", "success");
        result.put("filesProcessed", fileCount);
        result.put("chunksCreated", totalChunks);
        return result;
    }
}
