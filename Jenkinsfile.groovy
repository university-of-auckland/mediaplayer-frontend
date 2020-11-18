#!/usr/bin/env groovy

def slackChannel = "ltis-ltr"
def slackCredentials = "UoA-Slack-Access-ltis-ltr"

pipeline {
    agent  {
        label("uoa-buildtools-ionic")
    }

    parameters {
        choice(choices: ['DEV', 'TEST', 'PROD'], description: 'What environment?', name: 'DEPLOY_ENV')
        gitParameter name: 'BRANCH', type: 'PT_BRANCH', defaultValue: 'master', description: 'What Git branch you want to checkout?'
    }
  
    stages {
        stage("Checkout") {
            steps {
                echo "Checking out.."
                checkout([$class: 'GitSCM', 
                    branches: [[name: "${params.BRANCH}"]], 
                    doGenerateSubmoduleConfigurations: false, 
                    extensions: [], 
                    gitTool: 'Default', 
                    submoduleCfg: [], 
                    userRemoteConfigs: [[credentialsId: 'lib-bitbucket-user', url: 'https://bitbucket.org/uoa/media-player-cloud-frontend.git']]
                ])
            }
        }

        stage('AWS Credential Grab') {
            steps{
                script {
                    echo "☯ Authenticating with AWS"

                    def awsCredentialsId = ''
                    def awsTokenId = ''
                    def awsProfile = ''

                    if (params.DEPLOY_ENV == 'DEV') {
                        echo 'Setting variables for DEV deployment'
                        awsCredentialsId = 'aws-user-sandbox'
                        awsTokenId = 'aws-token-sandbox'
                        awsProfile = 'uoa-sandbox'

                    } else if (params.DEPLOY_ENV == 'TEST') {
                        echo 'Setting variables for TEST deployment'
                        awsCredentialsId = 'uoa-its-nonprod-access'
                        awsTokenId = 'uoa-its-nonprod-token'
                        awsProfile = 'uoa-its-nonprod'

                    } else if (params.DEPLOY_ENV == 'PROD') {
                        echo 'Setting variables for PROD deployment'
                        awsCredentialsId = 'uoa-its-prod-access'
                        awsTokenId = 'uoa-its-prod-token'
                        awsProfile = 'uoa-its-prod'

                    } else {
                        echo 'No Env set'
                    }
                    
                    withCredentials([
                        usernamePassword(credentialsId: "${awsCredentialsId}", passwordVariable: 'awsPassword', usernameVariable: 'awsUsername'),
                        string(credentialsId: "${awsTokenId}", variable: 'awsToken')
                    ]) {
                        sh "python3 /home/jenkins/aws_saml_login.py --idp iam.auckland.ac.nz --user $awsUsername --password $awsPassword --token $awsToken --profile ${awsProfile}"
                    }
                }
            }
        }

        stage("Build") {
            steps {
                script {
                    def ionicBuild = ''
                    sh "node --version"
                    sh "npm --version"
                    sh "ionic --version"

                    sh "npm install"
                    if (params.DEPLOY_ENV == 'DEV') {
                        echo 'Setting variables for DEV deployment'
                        ionicBuild = "sandbox"
                        
                    } else if (params.DEPLOY_ENV == 'TEST') {
                        echo 'Setting variables for TEST deployment'
                        ionicBuild = "nonprod"
                        
                    } else if (params.DEPLOY_ENV == 'PROD') {
                        echo 'Setting variables for PROD deployment'
                        ionicBuild = "production"
                        
                    } else {
                        echo 'No Env set'
                    }

                    echo "Replacing Version Number in the app..."
                    sh "sed -i 's/VERSION_WILL_BE_REPLACED_BY_CICD/#${env.BUILD_NUMBER}/g' src/environments/environment.${ionicBuild}.ts"

                    echo "Building the app..."
                    sh "ionic build --configuration=${ionicBuild}"
                    echo "Build complete"
                }
            }
        }

        stage("Deploy to S3 bucket") {
            steps {
                script {
                    echo "Deploying..."

                    def awsProfile = ''
                    def s3BucketName = ''
                    if (params.DEPLOY_ENV == 'DEV') {
                        echo 'Setting variables for DEV deployment'
                        awsProfile = "uoa-sandbox"
                        s3BucketName = "uoa-mediaplayer-sandbox"
                        
                    } else if (params.DEPLOY_ENV == 'TEST') {
                        echo 'Setting variables for TEST deployment'
                        awsProfile = "uoa-its-nonprod"
                        s3BucketName = "uoa-mediaplayer-nonprod"
                        
                    } else if (params.DEPLOY_ENV == 'PROD') {
                        echo 'Setting variables for PROD deployment'
                        awsProfile = "uoa-its-prod"
                        s3BucketName = "uoa-mediaplayer"
                        
                    } else {
                        echo 'No Env set'
                    }
                    sh "aws s3 sync www s3://${s3BucketName} --delete --profile ${awsProfile}"
                    echo "Sync complete"
                }
            }
        }

        stage("Invalidate CloudFront") {
            steps {
                script {
                    echo "Invalidating..."

                    def awsProfile = ''
                    def awsCloudFrontDistroId = ''
                    if (params.DEPLOY_ENV == 'DEV') {
                        echo 'Setting variables for DEV deployment'
                        awsProfile = "uoa-sandbox"
                        awsCloudFrontDistroId = 'E19H7B2G6KOA04'
                        
                    } else if (params.DEPLOY_ENV == 'TEST') {
                        echo 'Setting variables for TEST deployment'
                        awsProfile = "uoa-its-nonprod"
                        awsCloudFrontDistroId = 'E1QUMW4UUMHEKM'
                        
                    } else if (params.DEPLOY_ENV == 'PROD') {
                        echo 'Setting variables for PROD deployment'
                        awsProfile = "uoa-its-prod"
                        awsCloudFrontDistroId = 'E2BR0LHEEJUQ60'
                        
                    } else {
                        echo 'No Env set'
                    }
                    sh "aws cloudfront create-invalidation --distribution-id ${awsCloudFrontDistroId} --paths '/*' --profile ${awsProfile}"
                    echo "Invalidation started"
                }
            }
        }

        stage("Notify Slack Channel") {
            steps {
                script{
                    slackSend(channel: slackChannel, message:"Media Player Cloud has been deployed to " + params.DEPLOY_ENV, tokenCredentialId: slackCredentials)
                }
            }
        }
    }
}
