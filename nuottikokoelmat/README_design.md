# Note Archives Application


There are many archives.
Each archive has a name and a list of songs. 
Each song has a name, path, and an url to a file, e.g. google drive.
Each archive has a visitor, user and manager accounts.
Each archive has many collections that group songs for a purpose like concert, rehearsal, etc.


The archive songs are open source, or similar material, that do not need high security:
It is not a problem if the songs are downloaded by someone who is outside the band.
The visitor session is saved to a browser or mobile phone local storage for a long period.



## Application administrator

Uses some pages inside test that are for managing archives.
Uses a script for viewing/removing files from archive.
Uses a script for creating and checking passwords for archive users and managers.
Sets upt the database and can update 



# Users

The users are kept in an iron session cookie.

Visitors for each archive use the archive name as username and all visitors use the same password.
Visitor passwords are saved uncrypted in the database. 

Archive users can manage the collections, and change the visitor password.
Their password is set up by the application administrator into a crypted environment variable.

Archive managers can edit the song file list of the archive, hiding or showing songs, 
and update the file list from Google drive or other source.
The google drive credentials is set up by the application administrator into an environment variable.
Their password is set up by the application administrator into a crypted environment variable.

