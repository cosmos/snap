# Appwrite Database and Functions Setup

This guide provides instructions on how to set up Appwrite to self host your multisigs.

## Prerequisites

1. **Appwrite CLI**: Ensure you have the Appwrite CLI [installed](https://appwrite.io/docs/tooling/command-line/installation). You can install it using npm:

    ```bash
    npm install -g appwrite-cli
    ```

2. **Environment Variables**: Ensure the following environment variables are set in your shell:

    - `PROJECT_ID`: Your Appwrite project ID.
    - `ENDPOINT`: Your Appwrite endpoint.
    - `API_KEY`: Your Appwrite API key.

    You can set these variables in your shell profile (e.g., `.bashrc`, `.zshrc`) or export them directly in your terminal session:

    ```bash
    export PROJECT_ID="your_project_id"
    export ENDPOINT="your_appwrite_endpoint"
    export API_KEY="your_appwrite_api_key"
    ```

## Running the Setup Script

1. **Navigate to the Snap Directory**: Open your terminal and navigate to the snap directory where the `./scripts/setup_appwrite.sh` script is located. If you have not yet, git clone this repo before doing this step.

2. **Run the Script**: Execute the script by running the following command:

    ```bash
    bash ./scripts/setup_appwrite.sh
    ```

## Functions Deployment

Ensure the `appwrite.json` file is in its respective location under `./packages/appwrite/` and the `projectId` key is your project id. The script will use these files to deploy the functions to Appwrite.

The structure should look like this:

./packages/appwrite/functions/

├── create_multisig

├── create_multisig_tx

├── delete_multisig_tx

├── get_multisigs

└── sign_multisig_tx