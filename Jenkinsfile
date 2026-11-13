pipeline{
    agent any

    options {
        timestamps()
        timeout(time: 15, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    //local jenkins cannot receive Github webhooks, so check Github every 2 minutes 
    triggers {
        pollSCM('H/2 * * * *')
    }

    environment {
        IMAGE_NAME = "calculator-devops"
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        SMOKE_CONTAINER="calc-smoke-${env.BUILD_NUMBER}"
    }

    stages {
        stage('Info') {
            steps {
                sh '''
                    echo "Commit: $ (git rev-parse --short HEAD)"
                    node --version
                    npm --version
                    docker --version
                '''
            }
        }

        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
            post {
                always {
                    junit 'reports/junit.xml'
                }
            }
        }

        stage('Build Image') {
            steps {
                sh '''
                    docker build \
                      --build-arg APP_VERSION=${IMAGE_TAG} \
                      -t ${IMAGE_NAME}:${IMAGE_TAG} \
                      -t ${IMAGE_NAME}:latest \
                      .
                '''
            }
        }

        stage('Smoke Test') {
            steps {
                sh '''
                    docker run -d --name ${SMOKE_CONTAINER} ${IMAGE_NAME}:${IMAGE_TAG}

                    for i in $(seq 1 10); do
                        RESPONSE=$(docker exec ${SMOKE_CONTAINER} wget -qO- http://localhost:3000/health || true)
                        echo "Attempt $i: $RESPONSE"
                        if echo "$RESPONSE" | grep -q "\\"version\\":\\"${IMAGE_TAG}\\""; then
                            echo "Smoke test passed"
                            exit 0
                        fi
                        sleep 2
                    done

                    echo "Smoke test FAILED"
                    docker logs ${SMOKE_CONTAINER}
                    exit 1
                '''
            }
        }
    }

    post {
        always {
            sh 'docker rm -f ${SMOKE_CONTAINER} || true'
            cleanWs()
        }
        success {
            echo "Build ${IMAGE_TAG} passed. Image: ${IMAGE_NAME}:${IMAGE_TAG}"
        }
        failure {
            echo 'Pipeline failed. Check the stage that turned red for details.'
        }
    }
}