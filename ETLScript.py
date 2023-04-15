from datetime import datetime
import json
import psycopg2

# Connect to PostgreSQL
conn = psycopg2.connect(
    host="localhost",
    database="food_delivery",
    user="sunyupei",
    password="password"
)
cur = conn.cursor()

# Define a function to convert opening hours string to a dictionary
def parse_hours(hours_str: str):
    days = {"Mon": 0, "Tues": 1, "Weds": 2, "Wed": 2,
            "Thurs": 3, "Thu": 3, "Fri": 4, "Sat": 5, "Sun": 6}
    hours_dict = {}
    for h in hours_str.split(" / "):
        for i in range(len(h)):
            if h[i].isdigit():
                day_range = h[0:i].strip()
                time_range = h[i:].strip()
                break

        temp_day_range = day_range.split(",")
        day_numbers = []
        for d in temp_day_range:
            if "-" in d:
                d = d.split("-")
                start_idx = days[d[0].strip()]
                end_idx = days[d[1].strip()]
                for i in range(start_idx, end_idx + 1):
                    day_numbers.append(i)
            else:
                day_numbers.append(days[d.strip()])

        start_time, end_time = time_range.split("-")

        try:
            start_time_obj = datetime.strptime(start_time.strip(), "%I:%M %p")
        except:
            start_time_obj = datetime.strptime(start_time.strip(), "%I %p")

        try:
            end_time_obj = datetime.strptime(end_time.strip(), "%I:%M %p")
        except:
            end_time_obj = datetime.strptime(end_time.strip(), "%I %p")

        print(day_numbers, start_time_obj, end_time_obj)
        print(start_time_obj.time())
        for d in day_numbers:
            hours_dict[d] = (start_time_obj.time(), end_time_obj.time())
    return hours_dict


# Load data from JSON files
with open('restaurant_with_menu.json') as f:
    restaurants = json.load(f)

with open('users_with_purchase_history.json') as f:
    users = json.load(f)

# Insert data into PostgreSQL
for r in restaurants:
    print(r)
    cur.execute("INSERT INTO restaurants (cash_balance, restaurant_name) VALUES (%s, %s) RETURNING id",
                (r['cashBalance'], r['restaurantName']))
    restaurant_id = cur.fetchone()[0]
    for m in r['menu']:
        cur.execute("INSERT INTO dishes (restaurant_id, dish_name, price) VALUES (%s, %s, %s)",
                    (restaurant_id, m['dishName'], m['price']))
    hours_dict = parse_hours(r['openingHours'])
    for day, hours in hours_dict.items():
        start_time, end_time = hours
        print(day)
        cur.execute("INSERT INTO restaurant_hours (restaurant_id, day_of_week, opening_time, closing_time) VALUES (%s, %s, %s, %s)",
                    (restaurant_id, day, start_time, end_time))

for u in users:
    print(u)
    cur.execute("INSERT INTO users (name, cash_balance) VALUES (%s, %s) RETURNING id",
                (u['name'], u['cashBalance']))
    user_id = cur.fetchone()[0]
    for p in u['purchaseHistory']:
        cur.execute("SELECT d.id FROM dishes d JOIN restaurants r ON d.restaurant_id = r.id WHERE d.dish_name = %s AND r.restaurant_name = %s",
                    (p['dishName'], p['restaurantName']))
        dish_id = cur.fetchone()[0]
        cur.execute("INSERT INTO transactions (user_id, dish_id, transaction_amount, transaction_date) VALUES (%s, %s, %s, %s)",
                    (user_id, dish_id, p['transactionAmount'], datetime.strptime(p['transactionDate'], "%m/%d/%Y %I:%M %p")))

# Commit changes and close the connection
conn.commit()
cur.close()
conn.close()
