#!/bin/bash

# project
wget http://codex.local/api/v1?fetch=app,projects,layout -O json
wget http://codex.local/api/v1/projects -O projects.json
wget http://codex.local/api/v1/projects/codex -O projects.codex.json
wget http://codex.local/api/v1/projects/codex/revisions -O projects.codex.revisions.json
wget http://codex.local/api/v1/projects/codex/revisions/master -O projects.codex.revisions.master.json
wget http://codex.local/api/v1/projects/codex/revisions/master/documents -O projects.codex.revisions.master.documents.json

# documents
wget http://codex.local/api/v1/projects/codex/revisions/master/documents/document?render=1 -O projects.codex.revisions.master.documents.document.json
wget http://codex.local/api/v1/projects/codex/revisions/master/documents/getting-started/configuration?render=1 -O projects.codex.revisions.master.documents.getting-started.configuration.json
wget http://codex.local/api/v1/projects/codex/revisions/master/documents/getting-started/creating-a-project?render=1 -O projects.codex.revisions.master.documents.getting-started.creating-a-project.json
wget http://codex.local/api/v1/projects/codex/revisions/master/documents/getting-started/installation?render=1 -O projects.codex.revisions.master.documents.getting-started.installation.json
wget http://codex.local/api/v1/projects/codex/revisions/master/documents/global?render=1 -O projects.codex.revisions.master.documents.global.json
wget http://codex.local/api/v1/projects/codex/revisions/master/documents/index?render=1 -O projects.codex.revisions.master.documents.index.json
wget http://codex.local/api/v1/projects/codex/revisions/master/documents/links?render=1 -O projects.codex.revisions.master.documents.links.json
wget http://codex.local/api/v1/projects/codex/revisions/master/documents/planning/search?render=1 -O projects.codex.revisions.master.documents.planning.search.json
wget http://codex.local/api/v1/projects/codex/revisions/master/documents/TODO?render=1 -O projects.codex.revisions.master.documents.TODO.json


#phpdoc
wget http://codex.local/api/v1/phpdoc/codex/master -O phpdoc.codex.master.json