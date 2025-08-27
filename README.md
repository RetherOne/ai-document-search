# Steps to Start the Backend

## Prerequisites

- Windows 10 or 11  
- Docker installed on your system  
- Python **3.12+**  
- Pipenv installed (`pip install pipenv`)  

---

## Installation

Clone this repository and navigate to the backend folder(finder_back):

```bash
cd finder_back
```

Activate the virtual environment:

```bash
pipenv shell
```

Install all dependencies from the Pipenv file:

```bash
pipenv install
```

---

## Running the Services

You will need **three separate terminals** to run this project.

### 1. Start Qdrant (Vector Database)

Run Qdrant in a Docker container:

```bash
docker run --rm -p 6333:6333 -v "$(pwd)/qdrant_storage:/qdrant/storage" qdrant/qdrant
```

### 2. Start the Django Development Server

In another terminal, from the `finder_back` directory:

```bash
python manage.py runserver
```

### 3. Start Django Q Cluster (Background Tasks)

In a third terminal, also from the `finder_back` directory:

```bash
python manage.py qcluster
```

---


