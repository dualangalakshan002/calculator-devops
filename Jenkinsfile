pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    // Local Jenkins cannot receive GitHub webhooks, so check GitHub every 2 minutes
    triggers {
        pollSCM('H/2 * * * *')
    }

    environment {
        DOCKERHUB_REPO  = 'dulanga002/calculator-devops'
        SMOKE_CONTAINER = "calc-smoke-${env.BUILD_NUMBER}"
        TRIVY_IMAGE     = 'aquasec/trivy:0.58.1'
    }

    stages {
        stage('Info') {
            steps {
                script {
                    def shortSha = sh(script: 'git rev-parse --short=7 HEAD', returnStdout: true).trim()
                    env.IMAGE_TAG = "${env.BUILD_NUMBER}-${shortSha}"
                }
                sh '''
                    echo "Image tag: ${IMAGE_TAG}"
                    node --version
                    docker --version
                '''
            }
        }

        stage('Install') {
            steps {
                sh 'npm ci --prefer-offline --no-audit --no-fund'
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
                      -t ${DOCKERHUB_REPO}:${IMAGE_TAG} \
                      -t ${DOCKERHUB_REPO}:latest \
                      .
                '''
            }
        }

        stage('Security Scan') {
            steps {
                sh '''
                    echo "=== Report: HIGH + CRITICAL (informational) ==="
                    docker run --rm \
                      -v /var/run/docker.sock:/var/run/docker.sock \
                      -v trivy-cache:/root/.cache/ \
                      ${TRIVY_IMAGE} image \
                      --severity HIGH,CRITICAL \
                      --exit-code 0 \
                      ${DOCKERHUB_REPO}:${IMAGE_TAG}

                    echo "=== Gate: fail on fixable CRITICAL ==="
                    docker run --rm \
                      -v /var/run/docker.sock:/var/run/docker.sock \
                      -v trivy-cache:/root/.cache/ \
                      ${TRIVY_IMAGE} image \
                      --severity CRITICAL \
                      --ignore-unfixed \
                      --skip-db-update \
                      --exit-code 1 \
                      ${DOCKERHUB_REPO}:${IMAGE_TAG}
                '''
            }
        }

        stage('Smoke Test') {
            steps {
                sh '''
                    docker run -d --name ${SMOKE_CONTAINER} ${DOCKERHUB_REPO}:${IMAGE_TAG}

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

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push ${DOCKERHUB_REPO}:${IMAGE_TAG}
                        docker push ${DOCKERHUB_REPO}:latest
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'docker rm -f ${SMOKE_CONTAINER} || true'
            sh 'docker logout || true'
            // Image is safe in Docker Hub now, so remove local copies
            sh 'docker rmi ${DOCKERHUB_REPO}:${IMAGE_TAG} ${DOCKERHUB_REPO}:latest || true'
            sh 'docker image prune -f'
            sh 'docker builder prune -f --filter until=72h'
            cleanWs()
        }
        success {
            echo "Pushed ${DOCKERHUB_REPO}:${IMAGE_TAG}"
        }
        failure {
            echo 'Pipeline failed. Check the stage that turned red.'
        }
    }
}