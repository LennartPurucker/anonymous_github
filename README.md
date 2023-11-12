# Anonymous GitHub Instance for the AutoML Conference 

Anonymous GitHub is a system that helps anonymize GitHub repositories for double-anonymous paper submissions. 

This repository contains the code for an instance of Anonymous GitHub hosted by and for the AutoML Conference (https://automl.cc/). 

The official public instance of Anonymous GitHub is hosted at https://anonymous.4open.science/ 
maintained and developed by Thomas Durieux. 
See the upstream repository (https://github.com/tdurieux/anonymous_github) for more details 

## Developer Documentation
### Instance Setup Documentation 

#### 1. Clone the repository

```bash
git clone https://github.com/LennartPurucker/anonymous_github.git
cd anonymous_github
```

#### 2. Configure the GitHub token and other options

Create a `.env` file with the following contents (options as used for the AutoML Conf Instance):

```env
GITHUB_TOKEN=<GITHUB_TOKEN>
CLIENT_ID=<CLIENT_ID>
CLIENT_SECRET=<CLIENT_SECRET>
PORT=5000
DB_USERNAME=
DB_PASSWORD=
AUTH_CALLBACK=https://<host>/github/auth,
APP_HOSTNAME=<host>
MAX_FILE_SIZE=
MAX_REPO_SIZE=
AUTO_DOWNLOAD_REPO_SIZE=
FREE_DOWNLOAD_REPO_SIZE=
```

- `GITHUB_TOKEN` can be generated here: https://github.com/settings/tokens/new with `repo` scope.
- `CLIENT_ID` and `CLIENT_SECRET` are the tokens are generated when you create a new GitHub app https://github.com/settings/applications/new.
- `<host>` is the URL to the server hosting the instance. The callback of the GitHub app needs to be defined as `https://<host>/github/auth` (the same as defined in AUTH_CALLBACK).

#### 3. Start Anonymous Github server

```bash
docker-compose up -d
```

#### 4. (Recommended) nginx and cloudflare setup

TODO: Add description. Right now, we use nginx.

#### 5. Rebuild when needed
Clear the docker containers , e.g. by calling `docker system prune -a` before calling `docker-compose up -d`
such that changes to the code base can change the deployment. 

### Maintainer Documentation

#### General

* Anonymized repos are downloaded and stored under `./repositories_backups` on the server.

#### Changes compared to the original Anonymous GitHub

* We force downloads of repositories up to 500 MB with individual files up to 50 MB to facilitate reproducibility reviews.
* We do not guarantee that the anonymized repositories will be available forever after a conference. We will keep them at least until after the conference took place (each year). 
* We do not support the Conference ID or Auto update features for anonymized repositories.
* We force the user to set an expiration date for the repo. 

#### Restarting the Webserver
After changing the code, the webserver needs to be restarted to make the code change take effect. 
This can be done by calling:

```bash
docker compose -f -build --force-recreate --no-deps -d
```
