#!/bin/bash

# Check if necessary environment variables are set
if [[ -z "$PROJECT_ID" ]]; then
    echo "Error: PROJECT_ID is not set. Please set it to your Appwrite project ID."
    exit 1
fi

if [[ -z "$ENDPOINT" ]]; then
    echo "Error: ENDPOINT is not set. Please set it to your Appwrite endpoint."
    exit 1
fi

if [[ -z "$API_KEY" ]]; then
    echo "Error: API_KEY is not set. Please set it to your Appwrite API key."
    exit 1
fi

# Function to create a collection
create_collection() {
    COLLECTION_NAME=$1
    RESPONSE=$(appwrite databases createCollection \
        --projectId $PROJECT_ID \
        --endpoint $ENDPOINT \
        --key $API_KEY \
        --databaseId "default" \
        --collectionId $COLLECTION_NAME \
        --name $COLLECTION_NAME)
    echo $RESPONSE
}

# Function to create a string attribute
create_string_attribute() {
    COLLECTION_NAME=$1
    ATTRIBUTE=$2
    SIZE=$3
    REQUIRED=$4

    RESPONSE=$(appwrite databases createStringAttribute \
        --projectId $PROJECT_ID \
        --endpoint $ENDPOINT \
        --key $API_KEY \
        --databaseId "default" \
        --collectionId $COLLECTION_NAME \
        --key $ATTRIBUTE \
        --size $SIZE \
        --required $REQUIRED)
    echo $RESPONSE
}

# Function to create an enum attribute
create_enum_attribute() {
    COLLECTION_NAME=$1
    ATTRIBUTE=$2
    ELEMENTS=$3
    REQUIRED=$4
    DEFAULT=$5

    RESPONSE=$(appwrite databases createEnumAttribute \
        --projectId $PROJECT_ID \
        --endpoint $ENDPOINT \
        --key $API_KEY \
        --databaseId "default" \
        --collectionId $COLLECTION_NAME \
        --key $ATTRIBUTE \
        --elements $ELEMENTS \
        --required $REQUIRED \
        --default $DEFAULT)
    echo $RESPONSE
}

# Function to create an integer attribute
create_integer_attribute() {
    COLLECTION_NAME=$1
    ATTRIBUTE=$2
    MIN=$3
    MAX=$4
    REQUIRED=$5

    RESPONSE=$(appwrite databases createIntegerAttribute \
        --projectId $PROJECT_ID \
        --endpoint $ENDPOINT \
        --key $API_KEY \
        --databaseId "default" \
        --collectionId $COLLECTION_NAME \
        --key $ATTRIBUTE \
        --min $MIN \
        --max $MAX \
        --required $REQUIRED)
    echo $RESPONSE
}

# Function to create a relationship attribute
create_relationship_attribute() {
    COLLECTION_NAME=$1
    ATTRIBUTE=$2
    RELATION_COLLECTION=$3
    RELATION_TYPE=$4

    RESPONSE=$(appwrite databases createRelationshipAttribute \
        --projectId $PROJECT_ID \
        --endpoint $ENDPOINT \
        --key $API_KEY \
        --databaseId "default" \
        --collectionId $COLLECTION_NAME \
        --key $ATTRIBUTE \
        --relatedCollectionId $RELATION_COLLECTION \
        --type $RELATION_TYPE \
        --required true)
    echo $RESPONSE
}

# Create Transactions collection
create_collection "transactions"

# Create attributes for Transactions collection
create_string_attribute "transactions" "chain_id" 1000 true
create_enum_attribute "transactions" "status" "created" true "created"
create_string_attribute "transactions" "signatures" 0 false
create_string_attribute "transactions" "body_bytes" 1073741824 true
create_integer_attribute "transactions" "sequence" 0 100000 true
create_string_attribute "transactions" "fee" 1073741824 true
create_string_attribute "transactions" "messages" 0 false

# Create Multisig collection
create_collection "multisig"

# Create attributes for Multisig collection
create_integer_attribute "multisig" "threshold" 0 1000 true
create_string_attribute "multisig" "name" 1000 true
create_string_attribute "multisig" "public_key" 1073741824 true
create_string_attribute "multisig" "chain_id" 10000000 true
create_string_attribute "multisig" "members" 0 false

# Create relationship attribute for Multisig collection
create_relationship_attribute "multisig" "transactions" "transactions" "oneToMany"

echo "Database structure created successfully. Appwrite collections and attributes are created."