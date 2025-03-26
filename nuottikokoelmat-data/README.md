# Nuottikokoelmat-data

Scripts to fetch data from multiple Google drive folders.

## Init

        python -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt

## Configuration

1.  Create a `config.json` file in the top directory with the following structure:

        {
            "data_directory": "/path/to/data_directory",
            "sourcelist": "/path/to/sourcelist.json",
            "log_directory": "/path/to/log_directory",
            "max_status_files": 5
            "max_tree_files": 2
        }

2.  Create a `sourcelist.json` file with the list of sources to be monitored.

         [
             {
                 "name": "Source 1",
                 "driveId": "fakeDriveId1",
                 "changesOnly": false
             },
             {
                 "name": "Source 2",
                 "driveId": "fakeDriveId2",
                 "changesOnly": true
             }
         ]

    - `name`: The name of the source.
    - `driveId`: The ID of the Drive folder.
    - `changesOnly`: A boolean flag indicating whether to only log changes (true) or log all files (false).

## Instructions

Run the scripts

    python load_trees.py   # Fetches and processes the directory trees from Drive
    python load_status.py  # Loads and logs the status of files in the directory trees
    python load_pdfs.py    # Downloads and processes PDF files from the directory trees
