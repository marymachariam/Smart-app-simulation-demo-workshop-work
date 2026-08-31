# Smart Stock Reorder Simulation  Workshop Project

A simulation project comparing naive vs. automated stock reorder strategies, built with a FastAPI backend and a Next.js frontend as part of a workshop.

## Overview

This project simulates inventory stock reorder decisions, contrasting a naive reordering approach against an automated (smarter) strategy. It was built as workshop material to demonstrate how automation can improve decision-making in stock management scenarios.

## Features

- **Naive Reorder Simulation** — Simulates a basic, rule-of-thumb approach to restocking inventory.
- **Automated Reorder Simulation** — Simulates a smarter, automated approach to restocking decisions.
- **Comparison View** — Frontend interface to visualize and compare outcomes between the two strategies.

## Tech Stack

| Layer      | Technology   |
|------------|--------------|
| Frontend   | Next.js      |
| Backend    | FastAPI      |

## Getting Started

### Prerequisites

- Python 3.x
- Node.js and npm/yarn

### Backend Setup

cd workshop_backend
python -m venv venv
source venv/bin/activate  (On Windows: venv\Scripts\activate)
pip install -r requirements.txt
uvicorn main:app --reload

### Frontend Setup

cd workshop_frontend
npm install
npm run dev

The frontend will be available at http://localhost:3000 and the backend API at http://localhost:8000 (adjust ports as configured).

## Project Structure

Smart-app-simulation-demo-workshop-work/
├── workshop_backend/       (FastAPI simulation engine)
│   ├── main.py
│   ├── models.py
│   ├── simulation.py
│   └── requirements.txt
├── workshop_frontend/      (Next.js application)
│   ├── app/
│   └── public/
└── README.md

## Roadmap

- [ ] Add more simulation strategies for comparison
- [ ] Export simulation results
- [ ] Configurable simulation parameters via UI


## Author

**Mary Macharia**
