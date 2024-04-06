# Note Archives Application

There are many archives.
Each archive has a name and a list of songs.
Each song has a name, path, and an url to a file, e.g. google drive.
Each archive has a visitor, user and manager accounts.
Each archive has many collections that group songs for a purpose like concert, rehearsal, etc.

The real data is on another web storage e.g.google drive,
but the songs, archives, collections are stored on mongo database.

## Security notes

The archive songs are open source, or similar material, that do not need high security:
It is not a problem if the songs are downloaded by someone who is outside the band.
The visitor session is saved to a browser or mobile phone local storage for a long period.
Visitor passwords are saved uncrypted in the database by the application administrator.

The manager passwords and storage credentials need high security.
These are crypted environment variables.

## Application administrator

Uses some pages inside test that are for creating archive, adding songs.
Uses a script for viewing/removing files from archive.
Uses a script for creating and checking passwords for archive visitors and managers.
Sets up manager paswords into a crypted environment variables.
Sets up the credentials for using web file storage e.g. google drive.

# Visitors and Managers

An iron session cookie is used to keep track of logged visitors and managers.
Visitors for each archive use the archive name as username and all visitors use the same password.
Archive managers can manage the collections, and change the visitor password.
They can show/hide songs from the archive song list and check storage for new files to add to the song list.
