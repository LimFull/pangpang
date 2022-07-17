@file:DependsOn(
    "software.amazon.awssdk:s3:2.13.7",
    "software.amazon.awssdk:apache-client:2.13.7",
    "org.jetbrains.kotlinx:kotlinx-coroutines-core:1.5.0",
    "org.jetbrains.kotlinx:kotlinx-coroutines:0.19.2"
)

import kotlin.io.path.isRegularFile
import kotlin.streams.asSequence
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.PutObjectRequest

job("") {
    container(displayName = "npm build", image = "node:14-alpine") {
        env["BUILD_PATH"] = "$mountDir/share/pangpang-client"
        shellScript {
            interpreter = "/bin/sh"
            content = """
                cd client
                npm install
                npm run build
            """
        }
    }

    container("publish to s3", image = "openjdk:11") {
        env["AWS_ACCESS_KEY_ID"] = Secrets("s3-access-key")
        env["AWS_SECRET_ACCESS_KEY"] = Secrets("s3-secret-access-key")
        kotlinScript { api ->
            val client = S3Client.builder()
                .credentialsProvider(software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider.create())
                .httpClient(software.amazon.awssdk.core.internal.http.loader.DefaultSdkHttpClientBuilder().build())
                .region(Region.AP_NORTHEAST_2)
                .build()
            val outputDir = api.fileShare().locate("pangpang-client")!!.toPath()
            java.nio.file.Files.walk(api.fileShare().locate("pangpang-client")!!.toPath()).use { stream ->
                stream.asSequence()
                    .filter { it.isRegularFile() }
                    .forEach { path ->
                        client.putObject(
                            PutObjectRequest.builder()
                                .bucket("pangpang-web")
                                .key("${outputDir.relativize(path)}")
                                .build(),
                            path
                        )
                    }
            }
        }
    }
}