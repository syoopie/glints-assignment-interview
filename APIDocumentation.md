# API

## Restaurant Endpoints

### List all restaurants that are open at a certain datetime

Endpoint: /restaurants/open
Method: GET

Query Parameters:
| Name     | Type                                |
| -------- | ----------------------------------- |
| datetime | string (format: DD/MM/YYYY hh:mm A) |

Description: Retrieve a list of open restaurants at a specified datetime.

### Search for restaurants or dishes by name, ranked by relevance to search term

Endpoint: /restaurants/search
Method: GET

Query Parameters:
| Name | Type   |
| ---- | ------ |
| q    | string |

Description: Search for restaurants and dishes by a given search query, ranked by relevance to the search term

### List top y restaurants that have more or less than x number of dishes within a price range, ranked alphabetically. More or less (than x) is a parameter that the API allows the consumer to enter

Endpoint: /restaurants/ranked
Method: GET
Query Parameters:

| Name         | Type                      |
| ------------ | ------------------------- |
| more_or_less | string ("more" or "less") |
| x            | number                    |
| min_price    | number                    |
| max_price    | number                    |

Description: Retrieve a list of restaurants with a dish count greater or less than a specified number and within a specified price range

## User Endpoints

### Process a user purchasing a dish from a restaurant, handling all relevant data changes in an atomic transaction

Endpoint: /:userId/purchase/:dishId
Method: POST
Query Parameters: None

Description: This function processes a purchase of a dish by a user, updating the user's balance, creating a new order, and updating the restaurant's sales.
