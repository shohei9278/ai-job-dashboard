import csv

input_file = "data/users_rows.csv"
output_file = "data/users_rows_pg.csv"

def clean_field(value):
    return value.strip() if value else None

with open(input_file, newline='', encoding='utf-8') as infile, open(output_file, 'w', newline='', encoding='utf-8') as outfile:
    reader = csv.DictReader(infile)
    writer = csv.DictWriter(outfile, fieldnames=reader.fieldnames)
    writer.writeheader()

    for row in reader:
        # 不要な空白・改行を削除
        for key in row.keys():
            row[key] = clean_field(row[key])
        writer.writerow(row)

print(f"✅ Cleaned CSV saved: {output_file}")


