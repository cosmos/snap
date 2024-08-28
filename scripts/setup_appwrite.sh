#!/bin/bash

# Check if necessary environment variables are set
if [[ -z "$APPWRITE_ENDPOINT" ]]; then
    echo "Error: APPWRITE_ENDPOINT is not set. Please set it to your Appwrite endpoint."
    exit 1
fi

if [[ -z "$APPWRITE_PROJECT_ID" ]]; then
    echo "Error: APPWRITE_PROJECT_ID is not set. Please set it to your Appwrite project ID."
    exit 1
fi

if [[ -z "$APPWRITE_API_KEY" ]]; then
    echo "Error: APPWRITE_API_KEY is not set. Please set it to your Appwrite API key."
    exit 1
fi

# Initialize Appwrite CLI
appwrite client --endpoint "$APPWRITE_ENDPOINT" --projectId "$APPWRITE_PROJECT_ID" --key "$APPWRITE_API_KEY"

# Function to create a collection
create_collection() {
    COLLECTION_NAME=$1
    appwrite databases create-collection \
        --databaseId multisig \
        --collectionId "$COLLECTION_NAME" \
        --name "$COLLECTION_NAME" \
        --permissions "create(\"any\")" "read(\"any\")" "update(\"any\")" "delete(\"any\")"
}

# Function to create a string attribute
create_string_attribute() {
    COLLECTION_NAME=$1
    ATTRIBUTE=$2
    SIZE=$3
    REQUIRED=$4
    appwrite databases create-string-attribute \
        --databaseId multisig \
        --collectionId "$COLLECTION_NAME" \
        --key "$ATTRIBUTE" \
        --size "$SIZE" \
        --required "$REQUIRED"
}

# Function to create an enum attribute
create_enum_attribute() {
    COLLECTION_NAME=$1
    ATTRIBUTE=$2
    ELEMENTS=$3
    REQUIRED=$4
    DEFAULT=$5
    appwrite databases create-enum-attribute \
        --databaseId multisig \
        --collectionId "$COLLECTION_NAME" \
        --key "$ATTRIBUTE" \
        --elements "$ELEMENTS" \
        --required "$REQUIRED" \
        --default "$DEFAULT"
}

# Function to create an integer attribute
create_integer_attribute() {
    COLLECTION_NAME=$1
    ATTRIBUTE=$2
    MIN=$3
    MAX=$4
    REQUIRED=$5
    appwrite databases create-integer-attribute \
        --databaseId multisig \
        --collectionId "$COLLECTION_NAME" \
        --key "$ATTRIBUTE" \
        --min "$MIN" \
        --max "$MAX" \
        --required "$REQUIRED"
}

# Function to create a relationship attribute
create_relationship_attribute() {
    COLLECTION_NAME=$1
    ATTRIBUTE=$2
    RELATION_COLLECTION=$3
    RELATION_TYPE=$4
    appwrite databases create-relationship-attribute \
        --databaseId multisig \
        --collectionId "$COLLECTION_NAME" \
        --relatedCollectionId "$RELATION_COLLECTION" \
        --type "$RELATION_TYPE" \
        --twoWay false \
        --key "$ATTRIBUTE" \
        --twoWayKey "parent_$ATTRIBUTE"
}

# Function to deploy an Appwrite function
deploy_function() {
    FUNCTION_NAME=$1
    FUNCTION_PATH="./packages/appwrite/functions/$FUNCTION_NAME"
    appwrite functions create \
        --functionId "$FUNCTION_NAME" \
        --name "$FUNCTION_NAME" \
        --runtime "node-18.0" \
        --execute "any" \
        --vars "APPWRITE_FUNCTION_ENDPOINT=$APPWRITE_ENDPOINT" "APPWRITE_FUNCTION_PROJECT_ID=$APPWRITE_PROJECT_ID" \
        --entrypoint "src/index.js" \
        --command "npm run start" \
        --timeout 15
    appwrite functions createDeployment \
        --functionId "$FUNCTION_NAME" \
        --code "$FUNCTION_PATH"
}

# Create Transactions collection
create_collection "transactions"

# Create attributes for Transactions collection
create_string_attribute "transactions" "chain_id" 1000 true
create_enum_attribute "transactions" "status" "[\"created\"]" true "created"
create_string_attribute "transactions" "signatures" 1073741824 false
create_string_attribute "transactions" "body_bytes" 1073741824 true
create_integer_attribute "transactions" "sequence" 0 100000 true
create_string_attribute "transactions" "fee" 1073741824 true
create_string_attribute "transactions" "messages" 1073741824 false

# Create Multisig collection
create_collection "multisig"

# Create attributes for Multisig collection
create_integer_attribute "multisig" "threshold" 0 1000 true
create_string_attribute "multisig" "name" 1000 true
create_string_attribute "multisig" "public_key" 1073741824 true
create_string_attribute "multisig" "chain_id" 10000000 true
create_string_attribute "multisig" "members" 1073741824 false

# Create relationship attribute for Multisig collection
create_relationship_attribute "multisig" "transactions" "transactions" "oneToMany"

# Deploy functions
deploy_function "create_multisig"
deploy_function "create_multisig_tx"
deploy_function "delete_multisig_tx"
deploy_function "get_multisigs"
deploy_function "sign_multisig_tx"

echo "Appwrite setup successfully completed."