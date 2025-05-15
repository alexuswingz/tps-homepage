import json
import base64
import os
import urllib.request
import urllib.parse
import urllib.error
import boto3
import logging
from urllib.parse import parse_qs
from io import BytesIO

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Plant.ID API Key - store this in AWS Parameter Store or Secrets Manager in production
PLANT_ID_API_KEY = "qfE1DVIUgbuivUtkjW8eD5w7xfUPMU9BdfNyONEFhfFZTKO6RT"

# Shopify credentials - store these in AWS Parameter Store or Secrets Manager in production
SHOPIFY_STORE_DOMAIN = "https://checkout.tpsplantfoods.com"
SHOPIFY_STOREFRONT_ACCESS_TOKEN = "d5720278d38b25e4bc1118b31ff0f045"

def lambda_handler(event, context):
    """
    AWS Lambda handler function that processes plant identification and product recommendations.
    """
    try:
        # Log the incoming event for debugging
        logger.info(f"Received event: {json.dumps(event)}")
        
        # Get the HTTP method and path from API Gateway v2 format
        http_method = ""
        path = ""
        
        # Handle both REST API and HTTP API Gateway event formats
        if "requestContext" in event:
            if "http" in event["requestContext"]:
                # API Gateway HTTP API (v2) format
                http_method = event["requestContext"]["http"]["method"]
                path = event["requestContext"]["http"]["path"]
            elif "httpMethod" in event["requestContext"]:
                # API Gateway REST API (v1) format
                http_method = event["requestContext"]["httpMethod"]
                path = event["path"]
        else:
            # Fallback to direct properties if requestContext is not available
            http_method = event.get("httpMethod", "")
            path = event.get("path", "")
        
        # Extract route key if available (API Gateway v2)
        route_key = event.get("routeKey", "")
        if route_key and " " in route_key:
            http_method = route_key.split(" ")[0]
            path = route_key.split(" ")[1]
        
        # Add CORS headers
        headers = {
            "Access-Control-Allow-Origin": "*",  # In production, restrict this to your domain
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            "Content-Type": "application/json"
        }
        
        # Handle preflight requests
        if http_method == "OPTIONS":
            return {
                "statusCode": 200,
                "headers": headers,
                "body": ""
            }
            
        # Route to the appropriate handler based on the path
        if path.endswith("/identify-plant"):
            return handle_plant_identification(event, headers)
        elif path.endswith("/get-recommendations"):
            return handle_recommendations(event, headers)
        else:
            return {
                "statusCode": 404,
                "headers": headers,
                "body": json.dumps({"success": False, "error": f"Endpoint not found: {path}"})
            }
            
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            "body": json.dumps({"success": False, "error": f"Server error: {str(e)}"})
        }

def handle_plant_identification(event, headers):
    """
    Handles plant identification requests by forwarding to Plant.ID API
    """
    try:
        # Parse request body
        content_type = ""
        
        # Check for headers in various formats (API Gateway v1 vs v2)
        if "headers" in event and event["headers"]:
            headers_dict = event["headers"]
            # Headers might be case-sensitive or lowercase
            for header_key in ["content-type", "Content-Type"]:
                if header_key in headers_dict:
                    content_type = headers_dict[header_key]
                    break
        
        body = event.get("body", "")
        is_base64 = event.get("isBase64Encoded", False)
        
        # Handle base64 encoded body (binary image data)
        if is_base64 and body:
            try:
                body = base64.b64decode(body)
            except Exception as e:
                logger.error(f"Error decoding base64 body: {str(e)}")
                return {
                    "statusCode": 400,
                    "headers": headers,
                    "body": json.dumps({"success": False, "error": "Invalid base64 encoding"})
                }
            
        # Handle multipart form data (image uploads)
        if "multipart/form-data" in content_type:
            # Extract boundary
            boundary = content_type.split("boundary=")[1]
            if '"' in boundary:
                boundary = boundary.strip('"')
                
            # Parse the multipart form data to extract the image
            parts = body.split(f"--{boundary}".encode() if isinstance(body, bytes) else f"--{boundary}")
            image_data = None
            
            for part in parts:
                if isinstance(part, str) and 'Content-Disposition: form-data; name="image"' in part:
                    # Find the actual image data after the headers
                    image_start = part.find('\r\n\r\n') + 4
                    if image_start > 4:
                        image_data = part[image_start:].encode('utf-8')
                        break
                elif isinstance(part, bytes) and b'Content-Disposition: form-data; name="image"' in part:
                    # Find the actual image data after the headers
                    image_start = part.find(b'\r\n\r\n') + 4
                    if image_start > 4:
                        image_data = part[image_start:]
                        break
            
            if not image_data:
                return {
                    "statusCode": 400,
                    "headers": headers,
                    "body": json.dumps({"success": False, "error": "No image found in request"})
                }
                
            # Forward image to Plant.ID API
            return forward_to_plant_id(image_data, headers)
        
        # Handle JSON input (base64 encoded image)
        elif "application/json" in content_type or content_type == "":
            # If the body is a string, parse it to JSON
            if isinstance(body, str):
                try:
                    body_json = json.loads(body)
                except json.JSONDecodeError:
                    return {
                        "statusCode": 400,
                        "headers": headers,
                        "body": json.dumps({"success": False, "error": "Invalid JSON in request body"})
                    }
            else:
                return {
                    "statusCode": 400,
                    "headers": headers,
                    "body": json.dumps({"success": False, "error": "Unsupported request format"})
                }
                
            # Check if we have a base64 image
            if "image" in body_json:
                # Decode base64 image
                try:
                    image_data = base64.b64decode(body_json["image"])
                    return forward_to_plant_id(image_data, headers)
                except Exception as e:
                    logger.error(f"Error decoding image: {str(e)}")
                    return {
                        "statusCode": 400,
                        "headers": headers,
                        "body": json.dumps({"success": False, "error": f"Error decoding image: {str(e)}"})
                    }
            else:
                return {
                    "statusCode": 400,
                    "headers": headers,
                    "body": json.dumps({"success": False, "error": "No image found in request"})
                }
        else:
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({"success": False, "error": f"Unsupported content type: {content_type}"})
            }
    
    except Exception as e:
        logger.error(f"Error in plant identification: {str(e)}")
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"success": False, "error": f"Server error: {str(e)}"})
        }

def forward_to_plant_id(image_data, headers):
    """
    Forwards image data to Plant.ID API and processes the response
    """
    try:
        # Convert binary image to base64 for Plant.ID API
        base64_image = base64.b64encode(image_data).decode('utf-8')
        
        # Prepare request to Plant.ID API
        request_data = {
            "images": [base64_image],
            "latitude": None,
            "longitude": None,
            "similar_images": True
        }
        
        # Create request to Plant.ID
        req = urllib.request.Request("https://plant.id/api/v3/identification")
        req.add_header("Content-Type", "application/json")
        req.add_header("Api-Key", PLANT_ID_API_KEY)
        
        # Send request
        logger.info("Sending request to Plant.ID API")
        response = urllib.request.urlopen(req, json.dumps(request_data).encode('utf-8'))
        response_data = json.loads(response.read().decode('utf-8'))
        
        # Process the Plant.ID response
        logger.info("Received response from Plant.ID API")
        logger.debug(f"Plant.ID API response: {json.dumps(response_data)}")
        
        if not response_data.get('result'):
            logger.error("No result in Plant.ID response")
            return {
                "statusCode": 500,
                "headers": headers,
                "body": json.dumps({"success": False, "error": "Invalid response from plant identification service"})
            }
            
        # Extract relevant plant information from response
        suggestions = response_data.get('result', {}).get('classification', {}).get('suggestions', [])
        
        if not suggestions or len(suggestions) == 0:
            logger.error("No plant suggestions in Plant.ID response")
            return {
                "statusCode": 404,
                "headers": headers,
                "body": json.dumps({"success": False, "error": "No plants identified"})
            }
            
        # Get the top suggestion
        plant = suggestions[0]
        
        # Extract plant details
        plant_name = plant.get('name')
        probability = plant.get('probability')
        scientific_name = plant.get('name')
        
        common_names = plant.get('details', {}).get('common_names', [])
        if common_names and len(common_names) > 0:
            plant_name = common_names[0]
        
        # Extract similar images URL from response
        similar_images = response_data.get('result', {}).get('classification', {}).get('similar_images', [])
        image_url = None
        if similar_images and len(similar_images) > 0:
            image_url = similar_images[0].get('url')
            
        # Log extracted information
        logger.info(f"Identified plant: {plant_name} (Scientific name: {scientific_name})")
        logger.info(f"Confidence: {probability}")
        logger.info(f"Image URL: {image_url}")
        logger.info(f"Common names: {common_names}")
        
        # Extract info about plant structure, habitat, taxonomy, and more
        details = plant.get('details', {})
        
        # Construct plant care info if available
        care_info = {
            "soil_ph": details.get('edible_parts', {}).get('soil_ph'),
            "light": details.get('cultivation', {}).get('light'),
            "atmospheric_humidity": details.get('cultivation', {}).get('atmospheric_humidity'),
            "soil_nutrient": details.get('cultivation', {}).get('soil_nutrient'),
        }
        
        # Prepare the result
        plant_data = {
            "name": plant_name,
            "probability": probability,
            "details": {
                "common_names": common_names,
                "scientific_name": scientific_name,
                "family": details.get('taxonomy', {}).get('family'),
                "genus": details.get('taxonomy', {}).get('genus'),
                "care_level": "Medium",  # Default value
                "growth_info": care_info
            },
            "image_url": image_url
        }
        
        # Return the processed result
        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({"success": True, "result": plant_data})
        }
        
    except urllib.error.HTTPError as e:
        error_message = f"HTTP Error from Plant.ID API: {e.code} {e.reason}"
        logger.error(error_message)
        try:
            error_body = e.read().decode('utf-8')
            logger.error(f"Error response body: {error_body}")
        except:
            pass
        
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"success": False, "error": error_message})
        }
    except Exception as e:
        logger.error(f"Error forwarding to Plant.ID: {str(e)}")
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"success": False, "error": str(e)})
        }

def determine_care_level(scientific_name):
    """
    Determines the care level based on plant scientific name
    """
    # Simplified care level determination
    easy_care = ['Sansevieria', 'Dracaena', 'Zamioculcas', 'Aspidistra', 'Aglaonema']
    intermediate_care = ['Monstera', 'Ficus', 'Calathea', 'Philodendron', 'Alocasia']
    difficult_care = ['Orchidaceae', 'Adiantum', 'Dionaea', 'Platycerium']
    
    for genus in easy_care:
        if genus in scientific_name:
            return 'Beginner-friendly'
    
    for genus in intermediate_care:
        if genus in scientific_name:
            return 'Intermediate'
    
    for genus in difficult_care:
        if genus in scientific_name:
            return 'Advanced'
    
    return 'Intermediate'  # Default

def get_growth_info(scientific_name):
    """
    Returns growth information for a plant based on scientific name
    """
    # Simplified plant growth info database
    growth_info_database = {
        'Monstera deliciosa': {
            'soil_ph': '5.5-7.0 (slightly acidic to neutral)',
            'light': 'Bright, indirect light',
            'atmospheric_humidity': 'High humidity (50-60%)',
            'soil_nutrient': 'Rich, well-draining potting mix'
        },
        'Ficus lyrata': {
            'soil_ph': '6.0-7.0',
            'light': 'Bright, indirect light',
            'atmospheric_humidity': 'Medium to high (40-60%)',
            'soil_nutrient': 'Well-draining, rich potting mix'
        },
        'Dracaena trifasciata': {
            'soil_ph': '5.5-7.5',
            'light': 'Low to bright indirect light',
            'atmospheric_humidity': 'Low to average (30-40%)',
            'soil_nutrient': 'Well-draining, sandy soil'
        }
    }
    
    # Look for exact matches
    if scientific_name in growth_info_database:
        return growth_info_database[scientific_name]
    
    # Look for genus level matches
    genus = scientific_name.split(' ')[0]
    for known_species, info in growth_info_database.items():
        if known_species.split(' ')[0] == genus:
            return info
    
    # Default growth info
    return {
        'soil_ph': '6.0-7.0 (neutral)',
        'light': 'Medium to bright indirect light',
        'atmospheric_humidity': 'Average humidity (40-50%)',
        'soil_nutrient': 'Standard potting mix with good drainage'
    }

def handle_recommendations(event, headers):
    """
    Handles product recommendation requests based on plant name
    """
    try:
        # Parse request body
        body = event.get("body", "{}")
        is_base64 = event.get("isBase64Encoded", False)
        
        # Handle base64 encoded body if present
        if is_base64 and body:
            try:
                body = base64.b64decode(body).decode('utf-8')
            except Exception as e:
                logger.error(f"Error decoding base64 body: {str(e)}")
                return {
                    "statusCode": 400,
                    "headers": headers,
                    "body": json.dumps({"success": False, "error": "Invalid base64 encoding"})
                }
                
        if isinstance(body, str):
            try:
                body_json = json.loads(body)
            except Exception as e:
                logger.error(f"Error parsing JSON body: {str(e)}")
                return {
                    "statusCode": 400,
                    "headers": headers,
                    "body": json.dumps({"success": False, "error": "Invalid JSON in request body"})
                }
        else:
            body_json = body
            
        # Extract plant name
        plant_name = body_json.get("plantName", "")
        logger.info(f"Received recommendation request for plant: {plant_name}")
        
        if not plant_name:
            logger.error("Plant name not provided in request")
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({"success": False, "error": "Plant name is required"})
            }
            
        # Generate search terms for the plant
        search_terms = generate_search_terms(plant_name)
        logger.info(f"Generated search terms: {search_terms}")
        
        # Search for products in Shopify
        search_results = []
        for term in search_terms[:5]:  # Limit to first 5 search terms for performance
            try:
                products = search_shopify_products(term)
                if products:
                    for product in products:
                        if product not in search_results:
                            search_results.append(product)
            except Exception as e:
                logger.error(f"Error searching for term '{term}': {str(e)}")
                
        # Limit to 6 products maximum
        limited_results = search_results[:6]
        
        logger.info(f"Returning {len(limited_results)} product recommendations")
        logger.info(f"Product titles: {[p.get('title', 'Unknown') for p in limited_results]}")
        
        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({
                "success": True,
                "result": limited_results
            })
        }
    except Exception as e:
        logger.error(f"Error processing recommendations request: {str(e)}")
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"success": False, "error": str(e)})
        }

def generate_search_terms(plant_name):
    """
    Generate relevant search terms for a plant name
    """
    plant_name_lower = plant_name.lower()
    
    # Create a list of all available products from the product catalog
    # This is a comprehensive list of fertilizer products similar to what the user uploaded
    product_catalog = [
        "Drought Fertilizer",
        "Cactus Food",
        "Fish Super Food",
        "Desert Plants Fertilizer",
        "Indoor Plant Food",
        "Exotic Bulb Fertilizer",
        "Potted Plant Food",
        "Terrarium Fertilizer",
        "Fern Food",
        "Hydroponics Fertilizer",
        "House Plant Food",
        "Azalea Fertilizer",
        "Orchid Food",
        "Rhododendron Fertilizer",
        "Succulent Food",
        "Hanging Basket Plant Food",
        "Flowering Plant Food",
        "Tomato Fertilizer",
        "High Bulb Fertilizer",
        "Herb Fertilizer",
        "Tropical Plant Food",
        "Bulk Fertilizer",
        "Acid Plant Fertilizer",
        "Lily Bulb Fertilizer",
        "Rose Fertilizer",
        "Berry Fertilizer",
        "Pepper Fertilizer",
        "Fruit Food",
        "Strawberry Fertilizer",
        "Rubber Plant Food",
        "Monstera Deliciosa Plant Food",
        "Vegetable Fertilizer",
        "Tropical Fertilizer",
        "Garlic Fertilizer",
        "Sweet Potato Fertilizer",
        "Garden Fertilizer",
        "Plant Food Outdoor",
        "Plant Food",
        "All In One Fertilizer",
        "All Purpose NPK Fertilizer",
        "5-5-5 Fertilizer",
        "10-10-10 All Vegetables",
        "6-8-10 Fertilizer",
        "10-10-10 Fertilizer",
        "Water Fertilizer",
        "Seaweed Kelp",
        "MycorrhizalFungi For Trees",
        "MycorrhizalFungi For Shrubs",
        "MycorrhizalFungi For Container Trees",
        "MycorrhizalFungi For Onion Trees",
        "MycorrhizalFungi",
        "Sweet Pea Fertlizer",
        "Granulated For Plants",
        "Magic Tree Fertilzer",
        "Lawn Fertilizer",
        "Grass Fertilizer",
        "Plant Fertilizer",
        "Apple Tree Fertilizer",
        "Citrus Fertilizer",
        "Tree Fertilizer",
        "Vine Fertilizer",
        "Universal Feed",
        "Aromatic Tree Fertilizer",
        "Pear Tree Fertilizer",
        "Rosewood Fertilizer",
        "Fig Tree Fertilizer",
        "Magnolia Tree Fertilizer",
        "Maple Tree Fertilizer",
        "Cherry Tree Fertilizer",
        "Orange Tree Fertilizer",
        "Pine Tree Fertilizer",
        "Spruce Tree Fertilizer",
        "Sage Palm Fertilizer",
        "Olive Fertilizer",
        "Universal Root Food",
        "Bonsai Fertilizer",
        "Oak Tree Fertilizer",
        "Liquid Fertilizer",
        "Super Activated Fertilizer",
        "Cactus Fertilizer",
        "Agave Fertilizer",
        "Aloe Plant Fertilizer",
        "Indoor Plant Fertilizers",
        "Epsom Salt Food",
        "AquaPlus Liquid Plant Food",
        "NutrientPlus For Houseplants",
        "Organic Plant Food",
        "Catalytic Liquid Food",
        "Galactic Lemon Tree Fertilizer",
        "Galactic Rose Fertilizer",
        "Galactic Herb Fertilizer",
        "Crawler Bonsai Fertilizer",
        "Monstera Plant Supplement",
        "Pothos Plant Supplement",
        "Succulent Root Supplement",
        "Succulent Plant Supplement",
        "Fig Root Supplement",
        "Indoor Plant Food",
        "Liquid Fertilizer",
        "Peace Fertilizer",
        "Philadendron Fertilizer",
        "Fern Fertilizer",
        "Ivy Food",
        "Lord of Paradise Fertilizer",
        "Money Plant Food",
        "Jade Fertilizer",
        "Tropical Plant Fertilizer",
        "Wilted Fertilizer",
        "Iron Fertilzer",
        "Fiddle Leaf Fig Plant Food",
        "Agapanthus Fertilizer",
        "African Violet Plant Food",
        "Vine Plant Food",
        "Anthurium Fertilizer",
        "Bamboo Fertilizer",
        "Norfolk Pine Fertilizer",
        "Calathea Plant Food",
        "Corn Plant Food",
        "Herbs Fertilzer",
        "Cacti Monstera Fertilizer",
        "Hibiscus Fertilizer",
        "Venus Fly Fertilizer",
        "Pineapple Fertilzer",
        "Liquid Plant Food",
        "Water Plant Fertilizer",
        "Hydrangea Fertilizer",
        "Blueberry Fertilizer",
        "Fish Emulsion Fertilizer",
        "Lawn Fertilizer",
        "Giant Vegetables",
        "Carhold Fertilizer",
        "Boston Fern Feed",
        "Worm Castings Concentrate",
        "Humus Extract 500 Compound",
        "Wonder Fuel",
        "Sulfur for Plants",
        "Phosphorus Fertilizer",
        "Nitrogen Fertilizer",
        "Pothos Sulfate For Plants",
        "Calcium Fertilizer",
        "Zinc For Plants",
        "Ammonium Nitrate Fertilizer",
        "Potassium Fertilizer",
        "Bat Guano Fertilizer",
        "Rowan Fertilizer",
        "Superphosphate",
        "Oysterphosphate",
        "Compound 1ns for Plants",
        "Compound 2dd",
        "CatNip For Plants",
        "Seaweed Extract For Plants",
        "pH++",
        "Fertilizante Para Plantas",
        "Fertilizante Para Arboles/Foliage",
        "Fertilizante Para Cesped",
        "Fertilizante Para Orquidea",
        "Fertilizante Para Plantas De Interior",
        "Fertilizante Para Bonsai"
    ]
    
    # Base search terms - always include these
    terms = [f"{plant_name} fertilizer", f"{plant_name} plant food"]
    
    # Plant categories that match specific product types
    specific_plant_matches = {
        'monstera': [
            'Monstera Deliciosa Plant Food',
            'Monstera Plant Supplement', 
            'Indoor Plant Food',
            'Tropical Plant Food',
            'Tropical Fertilizer',
            'Tropical Plant Fertilizer',
            'Cacti Monstera Fertilizer',
            'Potted Plant Food',
            'House Plant Food'
        ],
        'succulent': [
            'Succulent Food', 
            'Succulent Root Supplement', 
            'Succulent Plant Supplement',
            'Cactus Food',
            'Cactus Fertilizer',
            'Desert Plants Fertilizer',
            'Drought Fertilizer'
        ],
        'orchid': [
            'Orchid Food',
            'Flowering Plant Food'
        ],
        'fiddle leaf': [
            'Fiddle Leaf Fig Plant Food',
            'Indoor Plant Food',
            'Tropical Plant Food'
        ],
        'snake plant': [
            'Indoor Plant Food',
            'House Plant Food',
            'Drought Fertilizer'
        ],
        'philodendron': [
            'Philadendron Fertilizer',
            'Indoor Plant Food',
            'Tropical Plant Food'
        ],
        'fern': [
            'Fern Food',
            'Fern Fertilizer',
            'Boston Fern Feed'
        ],
        'pothos': [
            'Pothos Plant Supplement',
            'Pothos Sulfate For Plants',
            'Indoor Plant Food',
            'Vine Fertilizer',
            'Vine Plant Food'
        ],
        'cactus': [
            'Cactus Food',
            'Cactus Fertilizer',
            'Drought Fertilizer',
            'Desert Plants Fertilizer'
        ],
        'tomato': [
            'Tomato Fertilizer',
            'Vegetable Fertilizer',
            '10-10-10 All Vegetables'
        ],
        'herb': [
            'Herb Fertilizer',
            'Galactic Herb Fertilizer'
        ],
        'rose': [
            'Rose Fertilizer',
            'Galactic Rose Fertilizer',
            'Flowering Plant Food'
        ],
        'houseplant': [
            'House Plant Food',
            'Indoor Plant Food',
            'NutrientPlus For Houseplants'
        ],
        'ficus': [
            'Fiddle Leaf Fig Plant Food',
            'Indoor Plant Food'
        ],
        'vegetable': [
            'Vegetable Fertilizer',
            '10-10-10 All Vegetables',
            'Garden Fertilizer'
        ],
        'plant': [
            'Plant Food',
            'Plant Fertilizer',
            'Indoor Plant Food',
            'Universal Feed',
            'All Purpose NPK Fertilizer'
        ]
    }
    
    # Find the best matching plant category
    best_match = ''
    best_match_length = 0
    
    for plant_type in specific_plant_matches:
        if plant_type in plant_name_lower and len(plant_type) > best_match_length:
            best_match = plant_type
            best_match_length = len(plant_type)
    
    # Add specific product names for the matched plant type
    if best_match:
        logger.info(f"Found specific match for {plant_name}: {best_match}")
        search_products = specific_plant_matches[best_match]
        terms.extend(search_products)
        logger.info(f"Adding specific product searches: {search_products}")
    else:
        # If no specific match, add general terms based on plant categories
        general_terms = ['Plant Food', 'Plant Fertilizer', 'All Purpose NPK Fertilizer', 'Universal Feed']
        terms.extend(general_terms)
        logger.info(f"No specific match found for {plant_name}, using general terms")
        
        # For generic plant names, include common terms
        if 'plant' in plant_name_lower or len(plant_name_lower) < 5:
            additional_terms = ['Indoor Plant Food', 'House Plant Food', 'Liquid Fertilizer']
            terms.extend(additional_terms)
            logger.info(f"Adding generic plant terms: {additional_terms}")
    
    # Filter for exact matches in the product catalog
    exact_matches = []
    for product in product_catalog:
        product_lower = product.lower()
        if plant_name_lower in product_lower:
            exact_matches.append(product)
    
    # If we found any exact matches in the product catalog, prioritize them
    if exact_matches:
        logger.info(f"Found exact product matches for {plant_name}: {exact_matches}")
        terms = exact_matches + terms
    
    # Remove duplicates and return
    return list(set(terms))

def search_shopify_products(query):
    """
    Search Shopify products via Storefront API
    """
    graphql_query = """
    query searchProducts($query: String!) {
      products(first: 10, query: $query) {
        edges {
          node {
            id
            title
            description
            handle
            featuredImage {
              url
              altText
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
    """
    
    # Prepare request to Shopify Storefront API
    request_data = json.dumps({
        "query": graphql_query,
        "variables": {"query": query}
    }).encode()
    
    req = urllib.request.Request(f"{SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json")
    req.add_header("Content-Type", "application/json")
    req.add_header("X-Shopify-Storefront-Access-Token", SHOPIFY_STOREFRONT_ACCESS_TOKEN)
    
    try:
        response = urllib.request.urlopen(req, request_data)
        data = json.loads(response.read().decode())
        
        if data.get("errors"):
            logger.error(f"Shopify API error: {json.dumps(data['errors'])}")
            return []
        
        # Extract products from response
        if data.get("data") and data["data"].get("products") and data["data"]["products"].get("edges"):
            return [edge["node"] for edge in data["data"]["products"]["edges"]]
        
        return []
    
    except urllib.error.HTTPError as e:
        logger.error(f"Shopify API HTTP error: {e.code} - {e.reason}")
        return []
    except Exception as e:
        logger.error(f"Error searching Shopify products: {str(e)}")
        return []

def format_product_response(product, plant_name):
    """
    Format Shopify product data for response
    """
    # Get price from the first variant
    price_amount = "0"
    if (product.get("variants") and product["variants"].get("edges") and 
        product["variants"]["edges"] and product["variants"]["edges"][0].get("node") and
        product["variants"]["edges"][0]["node"].get("price") and
        product["variants"]["edges"][0]["node"]["price"].get("amount")):
        price_amount = product["variants"]["edges"][0]["node"]["price"]["amount"]
    
    price = float(price_amount)
    
    # Get product image
    image_url = "https://images.unsplash.com/photo-1611048268330-53de574cae3b"
    if product.get("featuredImage") and product["featuredImage"].get("url"):
        image_url = product["featuredImage"]["url"]
    
    # Format description
    description = product.get("description", f"Premium quality fertilizer for your {plant_name}.")
    if len(description) > 150:
        last_space = description[:150].rfind(" ")
        description = description[:last_space] + "..."
    
    # Create product ID from handle or ID
    product_id = product.get("handle", "")
    if not product_id and product.get("id"):
        product_id = product["id"].split("/")[-1]
    
    return {
        "id": product_id,
        "name": product.get("title", ""),
        "description": description,
        "price": price,
        "image": image_url,
        "link": f"/shop/{product_id}"
    } 