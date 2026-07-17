---
title: Jenkins Declarative Pipeline and Scripted Pipeline
author: Lee
---

## Declarative Pipeline

_Jenkinsfile (Declarative Pipeline)_

```groovy
pipeline {
    agent any // Allows running on any node; can also use none to not specify a global agent.
    stages {
        stage('Build') {
          agent { // Specify agent node
              label 'master'
            }
            steps {
                //
            }
        }
        stage('Test') {
            steps {
                //
            }
        }
        stage('Deploy') {
            steps {
                //
            }
        }
    }
}
```

Each stage can only have one steps block, and the execution node for the stage can be specified with `agent { label 'master' }`.

### Features of Declarative Pipeline

1. When different stages use the same label, the execution node may not be the same. Jenkins will randomly assign an available node with that label.
2. When managing Jenkinsfile with a version control system, the Declarative Pipeline will check out the entire repository to the root directory for every stage, so git must be installed on the agent nodes.
3. Within the same steps block, the context is inherited from previous steps. For example, if the first line is `sh 'cd nya'`, the next line will have its working path inside nya.

### Solution for Feature 1

When first calling the node, assign `env.NODE_NAME` to a global variable, and add the defined variable to the label tag where this node is needed.

`env.NODE_NAME` is a built-in Jenkins variable. Its value is the name of the node running the current stage.

## Scripted Pipeline

_Jenkinsfile (Scripted Pipeline)_

```groovy
node('master') { // Specify node with master label
    stage('Build') {
        //
    }
    stage('Test') {
        //
    }
}
node('RVV') { // Specify node with RVV label
    stage('Build') {
        //
    }
    stage('Test') {
      sh 'meow'
      sh 'meow'
    }
}
```

Simple and convenient, with no complicated `pipeline` framework, it uses node blocks to control node execution.Usage Example: <https://github.com/Leetfs/opencv-riscv-perf/blob/main/Jenkinsfile>

### Features of Scripted Pipeline

1. A pipeline can have multiple nodes. A node can be specified for multiple stages at once, and stages in the same node block will run on the same node.
2. When managing Jenkinsfile with a version control system, the Scripted Pipeline will not check out the entire repository to the node, it only reads the Jenkinsfile. If you want to use the repository, you need to clone it manually.
3. Within the same steps block, the context is not inherited from previous steps. For example, if the first line is `sh 'cd nya'`, the second line's working directory is still the default workspace path, not nya.
   - This does not apply to multi-line scripts like `sh ''' I am the content ''' `, since all commands inside the multi-line block run in a single sh context.
