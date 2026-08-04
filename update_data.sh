#!/bin/bash
# Script to update PQRSD data
# Usage: ./update_data.sh [path_to_excel]

EXCEL_FILE="${1:-7ec7ljcklx.xlsx}"
OUTPUT_DIR="public/data"

if [ ! -f "$EXCEL_FILE" ]; then
  echo "Error: Excel file not found: $EXCEL_FILE"
  exit 1
fi

if [ ! -f "parse_data.js" ]; then
  echo "Error: parse_data.js not found"
  exit 1
fi

echo "Processing $EXCEL_FILE..."

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Run parse script
node parse_data.js

# Move output to public/data
if [ -f "pqrsd_data.json" ]; then
  mv pqrsd_data.json "$OUTPUT_DIR/pqrsd_data.json"
  echo "Data updated successfully!"
  echo "Output: $OUTPUT_DIR/pqrsd_data.json"
else
  echo "Error: parse_data.js did not generate pqrsd_data.json"
  exit 1
fi
