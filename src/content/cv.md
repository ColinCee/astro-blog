---
title: 'Colin Cheung - Senior Software Engineer CV'
pubDate: "May 08 2025"
name: 'Colin Cheung' # Replace with your name
email: 'colincheung25@gmail.com' # Replace
linkedin: 'https://www.linkedin.com/in/colin-cheung/' # Replace
github: 'https://github.com/ColinCee' # Replace
website: 'https://colincheung.dev/' # Optional
description: 'Senior Software Engineer with 8+ years of experience building scalable, high-impact full-stack solutions using Node.js, React, TypeScript, and AWS. Proven leader in driving innovation and optimizing engineering practices.'
---

# Colin Cheung

Glasgow, UK - Working remotely.
<[colincheung25@gmail.com](mailto:colincheung25@gmail.com)> | [linkedin/colin-cheung/](https://www.linkedin.com/in/colin-cheung/) | [github.com/ColinCee](https://github.com/ColinCee) | [colincheung.dev](https://colincheung.dev/)>

## Professional Profile

Senior Software Engineer with 8+ years of experience architecting, developing, and deploying high-impact, scalable full-stack solutions for complex business needs. Deep expertise in **Node.js, React, TypeScript, and distributed AWS systems**. Proven ability to lead projects, optimize engineering practices, drive innovation, and significantly enhance developer productivity and system performance. Passionate about mentorship and building highly available, resilient systems.

----

## Experience

### **EDF Energy** - Senior Software Engineer (Contract) - *Apr 2023 - Present*

**Technologies:** `TypeScript`, `Node.js`, `AWS (Lambda, SQS, SNS, DynamoDB, S3, Cognito)`, `React`, `React Query`, `Zod`, `GitHub Actions`

*Developed and scaled solutions within Customer Complaints and Debt Collection, directly impacting multi-million pound revenue recovery.*

* Led migration of CI/CD pipelines (AWS CodePipeline to GitHub Actions) for a large monorepo, integrating Turborepo, **slashing build/test cycles from 20 to 5 minutes**.
* Led migration from JavaScript to TypeScript and implemented Zod for runtime validation, reducing runtime errors through static type checking and strict data validation.
* Enhanced the existing debt recovery state machine by developing additional customer journeys using its internal DSL, **directly contributing to the recovery of hundreds of thousands in debt**.
* Developed a secure, high-performance React-based self-service portal, granting internal stakeholders direct access to critical ETL pipeline outputs and **eliminating hours of daily ad-hoc development requests**.
* Architected event-driven microservices for critical B2B integrations with Debt Collection Agencies, powering the **engagement high-debt customers (collectively owing millions)** by automating the complete data exchange cycle: dispatching targeted customer visitation lists to guide DCA field operations, and processing their subsequent collection status updates into our state machine.
* Drove cost optimization by identifying and implementing DynamoDB Point-in-Time Recovery (PITR), **saving ~$4,000 USD monthly** on AWS spend.

### **BBC** - Senior Software Engineer (Contract) - *Nov 2022 - Apr 2023*

**Technologies:** `Node.js`, `React`, `AWS (Lambda, DynamoDB, CDK)`, `CI/CD`

Improved developer productivity and engineering insights by enhancing internal tooling.

* Architected and implemented a serverless data pipeline using AWS CDK for tracking build failure statistics, enabling data-driven CI/CD optimization.
* Led a key **developer experience initiative by automating PR comments** with code coverage reports, **reducing debugging time in CI logs by up to 90%** and accelerating delivery.

### **Hopper** - Software Engineer - *Mar 2022 - Oct 2022*

**Technologies:** `Scala`, `Docker`, `Kubernetes (K8s)`, `GCP (Pub/Sub)`, `gRPC`, `React`, `Terraform`, `Datadog`

Contributed to scaling customer service platforms during hyper-growth, handling high request volumes.

* Engineered and launched cross-vertical VIP support features, **increasing service visibility by >200% and contributing to a 50% revenue uplift** for related services.
* Developed and maintained business-critical Scala backend microservices serving **100k+ daily requests** via gRPC.
* Implemented multi-tenancy in backend services using gRPC and GCP Pub/Sub for scalable asynchronous communication.
* Established robust service monitoring, SLOs, and alerting in Datadog using Terraform (IaC), ensuring high availability.

### **Hometree** - Senior Software Engineer - *Jun 2021 - Mar 2022*

**Technologies:** `React (Hooks)`, `Node.js`, `TypeScript`, `AWS (Serverless Stack, RDS Proxy, CloudWatch)`, `Cypress`, `React Testing Library`, `Buildkite`, `MikroORM`

Led full-stack development initiatives and mentored engineers in a fast-paced startup.

* **Led the greenfield redesign and modernization of a business-critical legacy checkout system** using React (Hooks) and TypeScript, significantly improving UX, performance, and maintainability.
* **Championed and embedded modern development practices**: E2E testing (Cypress), Serverless Stack for IaC, CloudWatch Alarms for proactive monitoring, and Buildkite for robust CI/CD pipelines.
* Utilized Pair Programming and TDD (React Testing Library, Cypress, unit tests) to maintain high code quality and foster knowledge sharing.
* Drove migration to **AWS RDS Proxy** and **MikroORM**, enhancing database security by mitigating SQL injection vulnerabilities and enabling reliable transaction management.

### **Skyscanner** - Software Engineer - *Feb 2020 - Apr 2021*

**Technologies:** `Python`, `React`, `Docker`, `AWS (Lambda, SQS)`

Managed sensitive employee data and developed HR automation tools.

* Engineered HRMS to Active Directory data synchronization (AWS Lambda, SQS), **reducing update times from 8 hours to 2 minutes**.
* Architected and developed an AWS Serverless Slack chatbot for HR feedback.

### **PodFather Ltd** - Software Engineer - *Jul 2017 - Feb 2020*

**Technologies:** `PHP`, `Android (Java/Kotlin)`, `MySQL`, `TypeScript`, `Node.js`, `Docker`, `AWS S3`

Full-stack development for a mobile ePOD application (10k+ daily drivers).

* Optimized Android image capture, **improving processing speed by 300%**.
* Successfully **migrated Terabytes of image data** from MySQL BLOBs to AWS S3.

## Education

**University of Strathclyde** | Glasgow, UK - *2013 - 2018*
**BEng (Hons) Computer and Electronic Systems - 1st Class Honours**

* Dissertation: "Investigating learning type algorithms for video games" (Focus on AI/Machine Learning)

## Skills

* **Programming Languages:** TypeScript, JavaScript (Node.js), Python
* **Cloud Platform - AWS:**Lambda, SQS, SNS, DynamoDB, S3, Cognito, API Gateway, CDK, RDS, SST
* **Backend Development:** Node.js, Microservices, Event-Driven Architecture, REST APIs, gRPC
* **Frontend Development:** React, React Query, HTML5, CSS3, Electron
* **Databases:** DynamoDB, MySQL, PostgreSQL, MongoDB, ORMs (MikroORM)
* **CI/CD, DevOps & Observability:** GitHub Actions, Buildkite, Docker, Kubernetes (K8s), Terraform, Datadog, Prometheus, Grafana
* **Testing & Quality:** Jest, React Testing Library, Cypress/Playwright, TDD, Zod
* **Other Tools:** Git, JIRA, Monorepo tools Turborepo

## Personal Projects

* **TypeScript Discord Bot:** Engineered a feature-rich Discord bot using TypeScript and Node.js, leveraging the Discord.js library for robust command handling and event management. Implemented real-time chat message processing to trigger dynamic voice clip playback. Deployed and self-hosted on a Raspberry Pi, optimizing for resource-constrained environments.
* **Electron Chess App:** Developed a cross-platform desktop chess application using Electron and React, providing a real-time, side-by-side move analysis overlay for popular online chess platforms. Integrated the Leela Chess Zero (Lc0) reinforcement learning engine via UCI protocol for advanced AI-powered insights during live gameplay.
* **Self-Hosted Minecraft Server:** Deployed a dedicated Minecraft server within a Dockerized environment on a low-power (6W TDP) Linux machine. Utilized Docker Compose to orchestrate services including Minecraft, Prometheus (for metrics collection: JVM performance, player count, TPS), Grafana (for customizable dashboard visualization), and Traefik (as a reverse proxy). Configured DuckDNS for dynamic DNS resolution to a home IP address, enabling public accessibility.
