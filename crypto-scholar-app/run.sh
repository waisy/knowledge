#!/bin/bash

# Navigate to the script's directory (project root)
cd "$(dirname "$0")"

# Check if nvm is sourced and try to use .nvmrc if it exists
if [ -s "$NVM_DIR/nvm.sh" ]; then
  source "$NVM_DIR/nvm.sh"
  if [ -f ".nvmrc" ]; then
    echo "Found .nvmrc, attempting to use specified Node version..."
    nvm use || {
      echo "nvm use failed. Maybe the version in .nvmrc isn't installed?"
      echo "Attempting to install it..."
      nvm install || echo "nvm install failed. Please check your nvm setup and .nvmrc."
      # Try using again after potential install
      nvm use || echo "Still failed after install attempt. Continuing with current Node version."
    }
  else
    echo "No .nvmrc found. Using current/default nvm Node version."
    # Optional: Check if current node version is sufficient (e.g., >= 18)
    # node_version=$(node -v)
    # echo "Current Node version: $node_version"
    # Add logic here if you want to enforce a minimum version
  fi
elif command -v nvm &> /dev/null; then
  echo "nvm command found but NVM_DIR/nvm.sh not sourced? Trying to source default location..."
  if [ -s "$HOME/.nvm/nvm.sh" ]; then
    source "$HOME/.nvm/nvm.sh"
    if [ -f ".nvmrc" ]; then
      echo "Found .nvmrc, attempting to use specified Node version..."
      nvm use || {
        echo "nvm use failed. Attempting to install..."
        nvm install || echo "nvm install failed."
        nvm use || echo "Still failed after install attempt."
      }
    else
      echo "No .nvmrc found. Using current/default nvm Node version."
    fi
  else
    echo "Could not source nvm.sh from default location either."
  fi
else
 echo "nvm not found. Using system Node version."
fi


echo "\nEnsuring dependencies are installed..."
npm install

echo "\nStarting Next.js development server (Turbopack)..."
npm run dev 