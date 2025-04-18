# CSV Analytics Dashboard

A full-stack web application that allows users to upload CSV files and automatically generates interactive analytics dashboards with visualizations for all columns in the data.

## Project Structure

This project consists of two main parts:

### Backend (FastAPI)

- REST API built with FastAPI
- CSV file upload and processing
- Data analytics using Pandas
- Visualization generation with Plotly

### Frontend (Next.js)

- Modern UI built with Next.js and Tailwind CSS
- Interactive data visualizations with Plotly
- Responsive design for all screen sizes
- Context-based state management

## Features

- CSV file upload and storage
- Table of all previously uploaded CSV files
- Data preview and summary statistics
- Automatic detection of numerical and categorical columns
- Interactive visualizations including:
  - Histograms and box plots for numerical data
  - Bar charts for categorical data
  - Correlation analysis with heatmaps
- Missing value analysis

## Requirements

- Python 3.8+
- Node.js 18+
- npm or yarn

## Setup

1. Clone this repository
2. Install backend dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```
3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

## Running the Application

1. Start the backend server:
   ```
   cd backend
   ./start.sh
   ```
   or
   ```
   cd backend
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. Start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```

3. Open your browser at http://localhost:3000

## API Documentation

Once the backend is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Sample Data

A sample CSV file is included in the project root directory: `sample_data.csv` # dashboard-project
