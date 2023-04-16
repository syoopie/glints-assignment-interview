# Setup Guide

## 1. Loading data

1. Install PostgreSQL

    `brew install postgresql`

2. Start the database

    `sudo service start postgresql`

3. Create database and tables

    `CREATE DATABASE food_delivery`

    SCHEMA:

    ```SQL

    CREATE TABLE restaurants (
        id SERIAL PRIMARY KEY,
        cash_balance DECIMAL(10,2),
        restaurant_name TEXT NOT NULL
    );

    CREATE TABLE dishes (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
        dish_name TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL
    );

    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        cash_balance DECIMAL(10,2)
    );

    CREATE TABLE transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        dish_id INTEGER NOT NULL REFERENCES dishes(id),
        transaction_amount DECIMAL(10,2) NOT NULL,
        transaction_date TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE restaurant_hours (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
        day_of_week INTEGER NOT NULL,
        opening_time TIME NOT NULL,
        closing_time TIME NOT NULL
    );


    ```

4. Run ETL Script

    `python ETLScript.py`

    Remember to replace the user and password fields in the script with your own username and password

All data should now be loaded into the database.

## 2. Starting the database

1. Install dependencies

    Run this command in the root directory to install all necessary dependencies.

    `npm install`

2. Start the server

    Use this command to run the script that compiles the Typescript code and starts the server
    `npm start`
