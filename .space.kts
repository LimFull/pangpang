@file:DependsOn(
    "software.amazon.awssdk:s3:2.17.167",
    "software.amazon.awssdk:lambda:2.17.167",
    "software.amazon.awssdk:apache-client:2.17.167",
    "org.jetbrains.kotlinx:kotlinx-coroutines-core:1.5.0",
    "org.jetbrains.kotlinx:kotlinx-coroutines:0.19.2"
)

import kotlin.io.path.isRegularFile
import kotlin.streams.asSequence

job("build and publish client") {
    startOn {
        gitPush {
//            branchFilter = "refs/heads/dev"
            pathFilter {
                +"client/**"
            }
        }
    }

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
            val client = s3Client()
            val outputDir = api.fileShare().locate("pangpang-client")!!.toPath()
            java.nio.file.Files.walk(outputDir).use { stream ->
                stream.asSequence()
                    .filter { it.isRegularFile() }
                    .forEach { path ->
                        client.putObject({
                            it.bucket("pangpang-web")
                            it.key("${outputDir.relativize(path)}")
                        }, path)
                    }
            }
        }
    }
}


job("build and publish lambda") {
    startOn {
        gitPush {
            branchFilter = "refs/heads/dev"
            pathFilter {
                +"lambda/**"
            }
        }
    }

    container(displayName = "zip src folder", image = "ubuntu") {
        shellScript {
            interpreter = "/bin/bash"
            content = """
                apt-get update -y
                apt-get install zip -y
                cd lambda/src
                zip -r rtc-connector.zip .
                mv rtc-connector.zip $mountDir/share/rtc-connector.zip
            """
        }
    }

    container("publish to lambda", image = "openjdk:11") {
        env["AWS_ACCESS_KEY_ID"] = Secrets("s3-access-key")
        env["AWS_SECRET_ACCESS_KEY"] = Secrets("s3-secret-access-key")

        kotlinScript { api ->
            val zipFile = api.fileShare().locate("rtc-connector.zip")!!
            lambdaClient().updateFunctionCode {
                it.functionName("rtc-connector")
                it.zipFile(software.amazon.awssdk.core.SdkBytes.fromInputStream(zipFile.inputStream()))
            }
        }
    }
}

fun s3Client() = software.amazon.awssdk.services.s3.S3Client.builder()
    .credentialsProvider(software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider.create())
    .httpClient(software.amazon.awssdk.core.internal.http.loader.DefaultSdkHttpClientBuilder().build())
    .region(software.amazon.awssdk.regions.Region.AP_NORTHEAST_2)
    .build()

fun lambdaClient() = software.amazon.awssdk.services.lambda.LambdaClient.builder()
    .credentialsProvider(software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider.create())
    .httpClient(software.amazon.awssdk.core.internal.http.loader.DefaultSdkHttpClientBuilder().build())
    .region(software.amazon.awssdk.regions.Region.AP_NORTHEAST_2)
    .build()