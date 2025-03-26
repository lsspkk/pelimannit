import os
import json
import io
from datetime import datetime
from googleapiclient.http import MediaIoBaseDownload
from utils.auth import get_service
from utils.config import CONFIG
from datetime import datetime

service = get_service()


def collect_pdfs(tree, path=""):
    pdfs = []
    for item in tree:
        current_path = os.path.join(path, item["name"])
        if item['mimeType'] == 'application/pdf' and item['name'].lower().endswith('.pdf'):
            pdfs.append({'id': item['id'], 'name': item['name'], 'path': path})
        elif item['mimeType'] == 'application/vnd.google-apps.folder' and 'children' in item:
            pdfs.extend(collect_pdfs(item['children'], current_path))
    return pdfs


def download_file(service, file_id, file_name, target_folder):
    os.makedirs(target_folder, exist_ok=True)
    file_path = os.path.join(target_folder, file_name)
    request = service.files().get_media(fileId=file_id)
    fh = io.FileIO(file_path, 'wb')
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        status, done = downloader.next_chunk()
    print(f"Downloaded: {file_path}")


def find_latest_file(source_name, prefix):
    data_directory = CONFIG['data_directory']
    files = [
        f for f in os.listdir(data_directory)
        if f.startswith(source_name) and f.endswith('.json') and prefix in f
    ]
    if not files:
        return None
    return os.path.join(data_directory, sorted(files, reverse=True)[0])


def load_pdfs_from_tree(source_name):
    tree_file = find_latest_file(source_name, prefix="")
    if not tree_file:
        print(f"No tree JSON file found for {source_name}")
        return []

    with open(tree_file, 'r') as f:
        tree = json.load(f)
    return collect_pdfs(tree)


def load_pdfs_from_status(source_name):
    status_file = find_latest_file("status", prefix="status")
    if not status_file:
        print(f"No status file found for {source_name}")
        return []

    with open(status_file, 'r') as f:
        all_status = json.load(f)
    changes = all_status.get(source_name, {})
    return [
        {**f, 'path': f.get('path', '')}
        for f in (changes.get('added', []) + changes.get('modified', []))
    ]


def log(line):
    log_file = os.path.join(CONFIG['log_directory'], "downloads.log")

    with open(log_file, 'a') as f:
        f.write(line + '\n')


def now():
    return datetime.now().strftime("%d.%m.%Y -- %H:%M")


def log_download_event(entry=None, status=None):
    log(f"{status:<12}  {entry['name']:<30}  {entry.get('path', '')}")


def download_pdfs(source_name, apply_status_changes):
    target_dir = os.path.join(CONFIG['download_directory'], source_name)
    if os.path.exists(target_dir) and not apply_status_changes:
        print(
            f"Folder already exists, skipping full download for: {target_dir}")
        return

    log(f"\n---- {source_name} === {now()} ---------------")

    if apply_status_changes:
        log(f"Downloading changed PDFs for {source_name} from status...")
        pdfs = load_pdfs_from_status(source_name)
    else:
        log(f"Downloading all PDFs for {source_name} from latest tree...")
        pdfs = load_pdfs_from_tree(source_name)

    for file in pdfs:
        sub_dir = os.path.join(target_dir, file.get("path", "").lstrip(os.sep))
        try:
            download_file(service, file['id'], file['name'], sub_dir)
            log_download_event(file, status='downloaded')
        except Exception as e:
            log_download_event(file, status='error')
            print(f"Failed to download {file['name']}: {e}")

    # Always copy latest tree.json to target folder
    latest_tree_file = find_latest_file(source_name, prefix="")
    if latest_tree_file:
        with open(latest_tree_file, 'r') as src, open(os.path.join(target_dir, 'tree.json'), 'w') as dst:
            dst.write(src.read())


def main():
    with open(CONFIG['sourcelist'], 'r') as f:
        sources = json.load(f)

    for source in sources:
        name = source['name'].replace(' ', '_')
        if 'changesOnly' not in source:
            raise ValueError(
                f"Missing 'changesOnly' in source: {source['name']}\n"
                "Set to true to download only changed PDFs (from status file),\n"
                "or false to download all PDFs (from the latest folder tree).\n"
                "Please update sourcelist.json.\n"
            )
        apply_status = source['changesOnly']

        download_pdfs(name, apply_status)


if __name__ == '__main__':
    main()
