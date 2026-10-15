# DevOps Final End Term Capstone Project

## Student Details

- **Name:** Abhijit P
- **Roll No:** 24BCS10175
- **Batch:** A

## Overview

This project deploys TaskBoard using Docker, GitHub Actions, GHCR, Kubernetes, and Helm.

The CI/CD pipeline tests the backend, builds the frontend, builds and scans Docker images, pushes images to GHCR, and deploys TaskBoard to a temporary Kind cluster.

The local Kubernetes setup also includes ArgoCD, Prometheus, and Grafana. Terraform configuration for AWS is included, but AWS resources have not been deployed.

## Tools Used

- **GitHub Actions** — automates the CI/CD pipeline.
- **Python and pytest** — run backend tests.
- **Node.js and npm** — build the frontend.
- **Docker** — builds container images.
- **GHCR** — stores container images.
- **Trivy** — scans images for HIGH and CRITICAL vulnerabilities.
- **Kubernetes and Kind** — run containers in a Kubernetes cluster.
- **Helm** — deploys TaskBoard.
- **ArgoCD** — manages the GitOps application.
- **Prometheus** — collects application and Kubernetes metrics.
- **Grafana** — displays monitoring dashboards.
- **Terraform** — defines AWS infrastructure as code.

## CI/CD Workflow

The workflow runs on pushes to `main` and pull requests targeting `main`.

### 1. Test

The workflow:

- Sets up Python 3.12 and installs backend dependencies.
- Runs backend tests using `pytest -q`.
- Sets up Node.js 22 and installs frontend dependencies.
- Builds the frontend using `npm run build`.

The next job runs only if the tests and frontend build succeed.

### 2. Build, Scan, and Push Docker Images

The workflow builds separate backend and frontend images using the Git commit SHA as the tag.

Trivy scans both images for HIGH and CRITICAL vulnerabilities. Unfixed vulnerabilities are ignored, and qualifying findings fail the scan.

Images are pushed to GHCR only after both scans pass.

```text
ghcr.io/<repository-owner>/taskboard-backend:<commit-sha>
ghcr.io/<repository-owner>/taskboard-frontend:<commit-sha>
```

### 3. Deploy with Helm

For pushes to `main`, the workflow:

1. Creates a temporary Kind cluster in GitHub Actions.
2. Checks the cluster.
3. Deploys TaskBoard using Helm and the commit-SHA image tags.

The deployment runs in the `taskboard` namespace.

This temporary cluster is separate from my local Kind cluster on Kali Linux.

### CI/CD Pipeline Execution

![GitHub Actions CI/CD workflow execution](screenshots/Screenshot_2026-10-12_11_23_26.png)

**Figure 1. GitHub Actions workflow execution.**

## Local Application UI and Task Workflow

The following screenshots show TaskBoard running locally at `localhost:1919`.

### Initial Dashboard

![Task dashboard in its initial empty state](screenshots/Running%20Locally%20-%201.png)

**Figure 2. Initial dashboard.**

### Creating a Task

![Task creation modal](screenshots/Running%20Locally%20-%202.png)

**Figure 3. Task creation form.**

### Task in To Do

![Task listed in To Do status](screenshots/Running%20Locally%20-%203.png)

**Figure 4. Task in To Do.**

### Task in Progress

![Task listed in In Progress status](screenshots/Running%20Locally%20-%204.png)

**Figure 5. Task in In Progress.**

### Task Completed

![Completed task in the dashboard](screenshots/Running%20Locally%20-%205.png)

**Figure 6. Completed task.**

## Backend Environment Setup and Testing

These screenshots show backend setup and testing.

### Virtual Environment

![Backend virtual environment setup](screenshots/pytest%201.png)

**Figure 7. Backend virtual environment setup.**

![Backend dependencies installation](screenshots/pytest%202.png)

**Figure 8. Installing backend dependencies.**

### Package Installation

![Backend package installation output](screenshots/pytest%203.png)

**Figure 9. Package installation output.**

### Test Execution

![Pytest test suite output](screenshots/pytest%204.png)

**Figure 10. Backend test execution.**

## ArgoCD GitOps

ArgoCD is installed in the local Kubernetes cluster and manages the TaskBoard GitOps application.

The local ArgoCD setup is separate from the temporary GitHub Actions cluster.

## Prometheus and Grafana Monitoring

Prometheus collects metrics from the TaskBoard backend through the `/metrics` endpoint. A ServiceMonitor discovers the backend endpoints.

![Prometheus monitoring targets](screenshots/prometheus.png)

**Figure 11. Prometheus monitoring targets.**

Grafana displays Kubernetes resource usage and namespace metrics.

![Grafana monitoring dashboard](screenshots/grafana.png)

**Figure 12. Grafana monitoring dashboard.**

## Terraform and AWS

Terraform configuration is included for AWS infrastructure. AWS resources have not been deployed.

## Running the Workflow

1. Commit and push changes to `main`, or open a pull request targeting `main`.
2. Open the repository on GitHub.
3. Go to **Actions**.
4. Open the latest workflow run.
5. Check the test, build-push, and deployment jobs.

## Checking the Local Kubernetes Deployment

Run these commands with the `kind-session20` context configured.

```bash
kubectl --context kind-session20 config current-context
kubectl --context kind-session20 get nodes
helm --kube-context kind-session20 status taskboard -n taskboard
kubectl --context kind-session20 get pods -n taskboard
kubectl --context kind-session20 get deployments,services -n taskboard
```

To access the frontend, run:

```bash
kubectl --context kind-session20 port-forward -n taskboard svc/taskboard-frontend 3030:3030
```

Open [http://localhost:3030](http://localhost:3030). Stop port forwarding with `Ctrl+C`.

## Troubleshooting Notes

- **Kubernetes cluster unreachable:** Check the current context and cluster status.
- **ImagePullBackOff:** Check the image name, tag, and GHCR access.
- **Pod not Ready:** Check pod events, readiness probes, and logs.
- **Trivy scan fails:** Review the reported HIGH and CRITICAL vulnerabilities.
- **Frontend API fails:** Check browser developer tools and backend logs.

## Result

The project includes a CI/CD pipeline for testing, building, scanning, and pushing Docker images, followed by Helm deployment to a temporary Kind cluster.

The local Kubernetes setup includes TaskBoard, ArgoCD, Prometheus, and Grafana. Terraform configuration is included, but AWS resources have not been deployed.

## Screenshot Files

All screenshots are stored in the `screenshots/` directory at the project root. Relative paths are used so GitHub displays the images directly in the README preview.

## Demo:

- The presentation is in the given link: ![PPT](./demo/PPT%20for%20capstone%20project.pptx)

- To see the video click in this link: [Video Presentation](https://drive.google.com/file/d/1p57WFkRJHcVLtqjdi4A-qWMNHmzwGoih/view?usp=sharing)