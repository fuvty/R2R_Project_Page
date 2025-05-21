import csv
import json
import os
import argparse
import re

def csv_to_json(csv_file_path, output_file_path=None):
    """
    Convert CSV file to JSON format, keeping only required fields and
    extracting only the reasoning part from judge_response.
    
    Args:
        csv_file_path (str): Path to the input CSV file
        output_file_path (str, optional): Path for the output JSON file. If None, uses input filename with .json extension
    
    Returns:
        str: Path to the created JSON file
    """
    # Required fields to keep in the output
    required_fields = [
        "data_id", 
        "position", 
        "token_id", 
        "token_text", 
        "usage_type", 
        "is_mismatch", 
        "small_diverge_text", 
        "reference_diverge_text", 
        "judge_response"
    ]
    
    # If output path not specified, create one based on input
    if output_file_path is None:
        base_name = os.path.splitext(csv_file_path)[0]
        output_file_path = f"{base_name}_processed.json"
    
    try:
        # Read CSV file
        data = []
        with open(csv_file_path, 'r', encoding='utf-8') as csv_file:
            csv_reader = csv.DictReader(csv_file)
            for row in csv_reader:
                # Process judge_response to extract just the reasoning
                if 'judge_response' in row and row['judge_response']:
                    # Extract the reasoning part after "**Answer (Output: X)**\n**Reasoning:**"
                    match = re.search(r'\*\*Answer \(Output: [01]\)\*\*\s*\n\*\*Reasoning:\*\*(.*)', row['judge_response'], re.DOTALL)
                    if match:
                        row['judge_response'] = match.group(1).strip()
                
                # Create a new row with only the required fields
                processed_row = {}
                for key in required_fields:
                    if key in row:
                        value = row[key]
                        if not value:  # Handle empty values
                            processed_row[key] = ""
                            continue
                        
                        # Try to convert to numeric values when appropriate
                        try:
                            if value.lower() == 'true':
                                processed_row[key] = True
                            elif value.lower() == 'false':
                                processed_row[key] = False
                            elif '.' in value and value.replace('.', '', 1).isdigit():
                                processed_row[key] = float(value)
                            elif value.isdigit():
                                processed_row[key] = int(value)
                            else:
                                processed_row[key] = value
                        except (ValueError, TypeError):
                            processed_row[key] = value
                    else:
                        processed_row[key] = ""
                
                data.append(processed_row)
        
        # Write to JSON file as an array of objects
        with open(output_file_path, 'w', encoding='utf-8') as json_file:
            json.dump(data, json_file, indent=2, ensure_ascii=False)
        
        print(f"Conversion successful. JSON file created at: {output_file_path}")
        return output_file_path
    
    except Exception as e:
        print(f"Error converting CSV to JSON: {str(e)}")
        return None

def main():
    parser = argparse.ArgumentParser(description='Convert CSV file to JSON format, keeping only required fields and extracting reasoning from judge_response.')
    parser.add_argument('csv_file', help='Path to the CSV file to convert')
    parser.add_argument('-o', '--output', help='Path for the output JSON file (optional)')
    
    args = parser.parse_args()
    
    # Call the conversion function
    csv_to_json(args.csv_file, args.output)

if __name__ == "__main__":
    main()