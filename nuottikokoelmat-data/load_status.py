
import os
import json
from datetime import datetime
from utils.config import CONFIG

DATA_DIR = CONFIG['data_directory']
SOURCE_FILE = CONFIG['sourcelist']
LOG_DIR = CONFIG['log_directory']


def list_json_files(source_name):
    prefix = source_name.replace(' ', '_')
    return sorted([
        f for f in os.listdir(DATA_DIR)
        if f.startswith(prefix) and f.endswith('.json')
    ], reverse=True)


def load_tree(filepath):
    with open(filepath, 'r') as f:
        return json.load(f)


def collect_pdfs(tree, path=""):
    pdfs = {}
    for item in tree:
        current_path = os.path.join(path, item["name"])
        if item['mimeType'] == 'application/pdf':
            pdfs[item['id']] = {
                "id": item["id"],
                "name": item["name"],
                "path": path,
                "modifiedTime": item.get("modifiedTime", "")
            }
        elif item['mimeType'] == 'application/vnd.google-apps.folder':
            if 'children' in item:
                pdfs.update(collect_pdfs(item['children'], current_path))
    return pdfs


def format_time(iso_string):
    dt = datetime.fromisoformat(iso_string.replace('Z', ''))
    return dt.strftime("%d.%m.%Y -- %H:%M")


def compare_pdfs(old_pdfs, new_pdfs):
    added, deleted, modified = [], [], []

    old_ids = set(old_pdfs.keys())
    new_ids = set(new_pdfs.keys())

    for fid in new_ids - old_ids:
        added.append(new_pdfs[fid])
    for fid in old_ids - new_ids:
        deleted.append(old_pdfs[fid])
    for fid in new_ids & old_ids:
        if new_pdfs[fid]['modifiedTime'] != old_pdfs[fid]['modifiedTime']:
            modified.append(new_pdfs[fid])

    return added, deleted, modified


def log_changes(source_name, added, deleted, modified):
    now = datetime.now().strftime("%d.%m.%Y -- %H:%M")
    log_file = os.path.join(LOG_DIR, f"status.log")
    lines = [f"\n---- {source_name} === {now} ---------------\n"]

    if not (added or deleted or modified):
        lines.append("No changes detected.")

    for f in modified:
        lines.append(
            f"modified         {f['name']:<20} {f['path']}   {format_time(f['modifiedTime'])}")
    for f in deleted:
        lines.append(f"deleted          {f['name']:<20} {f['path']}")
    for f in added:
        lines.append(
            f"added            {f['name']:<20} {f['path']}   {format_time(f['modifiedTime'])}")

    with open(log_file, 'a') as log:
        log.write("\n".join(lines) + "\n")


def cleanup_old_status_files():
    max_files = CONFIG.get('max_status_files', 5)
    status_dir = CONFIG['data_directory']

    files = [
        f for f in os.listdir(status_dir)
        if f.startswith('status_') and f.endswith('.json')
    ]

    if len(files) <= max_files:
        return  # Nothing to delete

    files_sorted = sorted(files, reverse=True)  # Newest first
    to_delete = files_sorted[max_files:]

    for f in to_delete:
        full_path = os.path.join(status_dir, f)
        os.remove(full_path)
        print(f"Removed old status file: {f}")


def print_status_summary(status_summary):
    for source, changes in status_summary.items():
        print(f"\nSource: {source}")
        if not (changes['added'] or changes['deleted'] or changes['modified']):
            print("  No changes detected.")
        else:
            for f in changes['modified']:
                print(f"  modified: {f['name']} ({f['path']})")
            for f in changes['deleted']:
                print(f"  deleted: {f['name']} ({f['path']})")
            for f in changes['added']:
                print(f"  added: {f['name']} ({f['path']})")


def main():
    with open(SOURCE_FILE, 'r') as f:
        sources = json.load(f)

    status_summary = {}

    for source in sources:
        name = source['name'].replace(' ', '_')
        files = list_json_files(name)
        if len(files) < 2:
            print(
                f"Skipping source '{name}' — not enough JSON files to compare.")
            continue

        newest = os.path.join(DATA_DIR, files[0])
        previous = os.path.join(DATA_DIR, files[1])

        print(
            f"\nChecking status for source: {name} by comparing files:\n  Old: {previous}\n  New: {newest}")

        new_tree = load_tree(newest)
        old_tree = load_tree(previous)

        new_pdfs = collect_pdfs(new_tree)
        old_pdfs = collect_pdfs(old_tree)

        added, deleted, modified = compare_pdfs(old_pdfs, new_pdfs)

        status_summary[name] = {
            "added": added,
            "deleted": deleted,
            "modified": modified
        }

        log_changes(name, added, deleted, modified)

    timestamp = datetime.now().isoformat(timespec='minutes').replace(":", "-")
    out_path = os.path.join(DATA_DIR, f"status_{timestamp}.json")
    with open(out_path, 'w') as f:
        json.dump(status_summary, f, indent=2)
    print(f"\nSaved status: {out_path}")

    print_status_summary(status_summary)  # Print the status summary

    cleanup_old_status_files()


if __name__ == '__main__':
    main()
