import os
import json
from datetime import datetime
from utils.auth import get_service
from utils.config import CONFIG

service = get_service()


def build_tree(parent_id):
    query = f"'{parent_id}' in parents and trashed=false"
    results = service.files().list(
        q=query,
        fields="files(id, name, mimeType, parents, modifiedTime)"
    ).execute()
    children = []
    for f in results.get('files', []):
        node = {
            'id': f['id'],
            'name': f['name'],
            'mimeType': f['mimeType'],
            'modifiedTime': f.get('modifiedTime')
        }
        if f['mimeType'] == 'application/vnd.google-apps.folder':
            node['children'] = build_tree(f['id'])
        children.append(node)
    return children


def load_sourcelist(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)


def load_trees(sourcelist_file):
    os.makedirs(CONFIG['data_directory'], exist_ok=True)
    entries = load_sourcelist(sourcelist_file)
    for entry in entries:
        name = entry['name']
        drive_id = entry['driveId']
        print(f"Loading tree for source: {name}")
        tree = build_tree(drive_id)
        timestamp = datetime.now().isoformat(timespec='minutes').replace(":", "-")
        file_name = f"{CONFIG['data_directory']}/{name.replace(' ', '_')}_{timestamp}.json"
        with open(file_name, 'w') as f:
            json.dump(tree, f, indent=2)


def cleanup_old_tree_files():
    max_files = CONFIG.get('max_tree_files', 2)
    data_dir = CONFIG['data_directory']
    source_file = CONFIG['sourcelist']

    with open(source_file, 'r') as f:
        sources = json.load(f)

    for source in sources:
        prefix = source['name'].replace(' ', '_')
        all_files = [
            f for f in os.listdir(data_dir)
            if f.startswith(prefix + '_') and f.endswith('.json')
        ]

        if len(all_files) <= max_files:
            continue

        sorted_files = sorted(all_files, reverse=True)
        to_delete = sorted_files[max_files:]

        for f in to_delete:
            full_path = os.path.join(data_dir, f)
            os.remove(full_path)
            print(f"Removed old tree file: {f}")


def main():
    load_trees(CONFIG['sourcelist'])
    cleanup_old_tree_files()


if __name__ == '__main__':
    main()
