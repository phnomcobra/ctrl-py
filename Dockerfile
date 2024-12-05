# Pull base image
FROM python:3.13

# Set environment varibles
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /code/

COPY ./requirements.txt /code/
COPY ./start.py /code/
COPY ./valarie/ /code/valarie/

# Install dependencies
RUN pip3 install -r requirements.txt
