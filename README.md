# Anonymous GitHub Instance for the AutoML Conference 

Anonymous GitHub is a system that helps anonymize GitHub repositories for double-anonymous paper submissions. 

This repository contains the code for an instance of Anonymous GitHub hosted by and for the AutoML Conference (https://automl.cc/). 

The official public instance of Anonymous GitHub is hosted at https://anonymous.4open.science/ 
maintained and developed by Thomas Durieux. 
See the upstream repository (https://github.com/tdurieux/anonymous_github) for more details 


### Instance Documentation 

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

TODO: Add description. Right now, we use cloudflare and nginx.

#### 6. Rebuild when needed
Clear the docker containers , e.g. by calling `docker system prune -a` before calling `docker-compose up -d`
such that changes to the code base can change the deployment. 