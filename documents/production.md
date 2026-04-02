- check robots.txt and noindex tag


What to do: 
remove 
file robots.txt 
<meta name="robots" content="noindex, nofollow"> and
X-Robots-Tag: noindex, nofollow from server response
ui upper banner "non-production environment - test data only"
before deploying to production, and remove this comment


find out how to show local prices to customers with Paddle

Resolve the taxes issue

The Plantour project is ready for production. 

Estimate the following plan for the first production deployment

- keep the QA environment as it is, i.e. free services for Render .Net API / Docker and Angular SSR, Neon for free DB.

- subscribe for three paid services in Render for: .Net API / Docker, Angular SSR, PostgreSQL being on Hobby plan - ~ USD 21 per month

- set the maintenance mode for the production API and frontend, SEO will see 503

- deploy both API and frontend from GitHub to production

- access the production app through a tunnel (the public user sees the maintenance page)

- make sure everything works properly

- switch from the maintenance to the public mode

- the production website is open and accessible for the public users and SEO

- if I need, for example to deploy a new version, I can temporary switch to the maintenance mode any time

Added to Dockerfile
# --- SSH Setup for Render Tunneling ---
# Install OpenSSH
RUN apt-get update && apt-get install -y openssh-server
RUN mkdir /var/run/sshd
# Unlock root for key-based login (Render manages the keys)
RUN usermod --unlock root
# ---------------------------------------

