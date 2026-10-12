# DevOps Final End Term Capstone Project

## Student Details

- **Name:** Abhijit P
- **Roll No:** 24BCS10175
- **Batch:** A

## Overview

This project deploys TaskBoard using Docker, GitHub Actions, GitHub Container Registry (GHCR), Kubernetes, and Helm.

The CI/CD pipeline runs backend tests and builds the frontend, builds and scans both Docker images, pushes the images to GHCR, and runs the Helm deployment against a Kubernetes cluster created inside the GitHub Actions runner.

The screenshots in this README show the workflow execution, the local task dashboard, and the backend environment and test process. The local dashboard screenshots use the address localhost:1919. The Kubernetes frontend can be accessed separately through port forwarding at localhost:3030.

## Tools Used

- **GitHub Actions** — runs the CI/CD workflow.
- **Python 3.12 and pytest** — installs backend dependencies and runs backend tests.
- **Node.js 22 and npm** — builds the frontend.
- **Docker** — builds the backend and frontend images.
- **GitHub Container Registry (GHCR)** — stores the Docker images.
- **Trivy** — scans the images for HIGH and CRITICAL vulnerabilities.
- **Kubernetes with Kind** — provides a temporary Kubernetes cluster for the deployment job.
- **Helm** — installs or upgrades TaskBoard using the chart in the helm/taskboard directory.

## CI/CD Workflow

The workflow runs when code is pushed to the main branch or when a pull request targets main.

### 1. Test

The first job checks out the repository and runs the application checks:

- Sets up Python 3.12.
- Installs backend dependencies from backend/requirements.txt.
- Runs backend tests with pytest -q from the backend directory.
- Sets up Node.js 22.
- Runs npm install and npm run build from the frontend directory.

The next job only runs if this test job succeeds.

### 2. Build, Scan, and Push Docker Images

This job builds the backend and frontend Docker images. Both images are tagged with the GitHub commit SHA that triggered the workflow. This makes it possible to identify which code version an image was built from.

The workflow logs in to GHCR using the automatically provided GITHUB_TOKEN, then scans both images with Trivy:

- Scans for HIGH and CRITICAL vulnerabilities.
- Uses ignore-unfixed: true to ignore vulnerabilities that do not have a fix available.
- Uses exit-code: '1', so qualifying findings make the scan step fail.

The images are pushed to GHCR only after both scan steps pass:

~~~text
ghcr.io/<repository-owner>/taskboard-backend:<commit-sha>
ghcr.io/<repository-owner>/taskboard-frontend:<commit-sha>
~~~

The build-push job depends on the test job, so it does not run when the tests or frontend build fail.

### 3. Deploy with Helm

The deployment job runs only for pushes to main, and only after the build-push job succeeds. It:

1. Checks out the repository.
2. Installs Helm.
3. Creates a Kind Kubernetes cluster inside the GitHub Actions runner.
4. Verifies the cluster using kubectl cluster-info and kubectl get nodes.
5. Runs helm upgrade --install for the taskboard release, using the commit SHA for both image tags and the chart in helm/taskboard.

The release is deployed into the taskboard namespace. The command creates the namespace if it does not already exist.

The Kind cluster created by GitHub Actions is temporary. This workflow validates the Helm deployment in the runner; it does **not** deploy to the persistent Kind cluster running on my Kali machine. The local cluster remains separate.

### CI/CD Pipeline Execution

The screenshot below documents the GitHub Actions workflow for this project, including the testing, image build and push, and Kubernetes deployment stages.

![GitHub Actions CI/CD workflow execution](screenshots/Screenshot_2026-10-12_11_23_26.png)

*Figure 1. GitHub Actions workflow execution for the DevOps capstone project.*

## Local Application UI and Task Workflow

The following screenshots show the task dashboard running locally at localhost:1919 and demonstrate the task workflow from the initial empty state to completion.

### Initial Dashboard

![Task dashboard in its initial empty state](screenshots/Running%20Locally%20-%201.png)

*Figure 2. Initial dashboard view before a task has been created.*

### Creating a Task

![Task creation modal](screenshots/Running%20Locally%20-%202.png)

*Figure 3. Task creation modal with fields for title, description, priority, and assignee.*

### Task in To Do

![Task listed in To Do status](screenshots/Running%20Locally%20-%203.png)

*Figure 4. Dashboard updated to show the newly created task under To Do.*

### Task in Progress

![Task listed in In Progress status](screenshots/Running%20Locally%20-%204.png)

*Figure 5. Task status changed to In Progress.*

### Task Completed

![Completed task in the dashboard](screenshots/Running%20Locally%20-%205.png)

*Figure 6. Task marked as DONE, with the dashboard showing the final task state.*

## Backend Environment Setup and Testing

These screenshots document setting up the Python virtual environment, installing backend dependencies, and running the automated test suite.

### Virtual Environment and Dependencies

![Backend virtual environment setup](screenshots/pytest%201.jpg)

*Figure 7. Setting up and activating the Python virtual environment for the backend.*

![Backend dependencies installation](screenshots/pytest%202.jpg)

*Figure 8. Installing backend dependencies from the requirements file.*

### Package Resolution and Caching

![Backend package installation output](screenshots/pytest%203.jpg)

*Figure 9. Package resolution output during dependency installation.*

### Test Suite Execution

![Pytest test suite output](screenshots/pytest%204.jpg)

*Figure 10. Running the backend test suite with Python and pytest and checking the test results.*

## Running the Workflow

1. Commit the project and workflow changes.
2. Push to main, or open a pull request targeting main to run the test and build workflow.
3. Open the repository on GitHub and go to **Actions**.
4. Open the latest run and check the test, build-push, and, for a push to main, deploy jobs.
5. If a job fails, open the failed step and check its logs. A later job will not run if its required job fails.

## Checking the Local Kubernetes Deployment

These commands check the TaskBoard deployment in my local Kind cluster. Run them from a terminal where the kind-session20 context is configured.

~~~bash
kubectl config current-context
kubectl get nodes
helm status taskboard -n taskboard
kubectl get pods -n taskboard
kubectl get deployments,services -n taskboard
~~~

To access the frontend locally, run:

~~~bash
kubectl port-forward -n taskboard svc/taskboard-frontend 3030:3030
~~~

Keep the port-forward command running and open http://localhost:3030 in a browser. Stop port forwarding with Ctrl+C when finished.

## Troubleshooting Notes

- **Helm says the Kubernetes cluster is unreachable:** check kubectl config current-context, kubectl cluster-info, and kubectl get nodes. In my local setup, the cluster context is kind-session20. The GitHub Actions runner is a separate machine and cannot use my local cluster automatically.
- **The image has ImagePullBackOff:** check the pod details with kubectl describe pod <pod-name> -n taskboard. Verify that the image name and commit-SHA tag exist in GHCR and that the cluster can access the package.
- **The pod is running but not Ready:** use kubectl describe pod <pod-name> -n taskboard and kubectl logs <pod-name> -n taskboard to check readiness probes and application logs.
- **A Trivy step fails:** read the scan output to identify the reported HIGH or CRITICAL vulnerabilities. Because the scan uses exit-code: '1', the workflow stops before pushing the images when the step fails.
- **The frontend loads but API actions fail:** check browser developer tools and the backend pod logs. An HTTP 200 from the frontend health check alone does not prove that API requests or database operations work.

## Result

The pipeline is configured to test the backend, build the frontend, build and scan both Docker images, push versioned images to GHCR, and run the Helm chart against a temporary Kind cluster in GitHub Actions. I also verified the local TaskBoard deployment by checking the Kubernetes pods and deployments and opening the frontend through port forwarding.

## Screenshot Files

Place the screenshot files in a directory named screenshots at the project root, using the filenames shown in the image links above. GitHub will render the images when the file paths and names match. The screenshots themselves were not attached here, so they need to be copied into that directory in the repository before the images will display.
