## This file contains requirements on what should be done before starting the production environment.


Protect the SEO while under maintenance, your app must return a 503 Service Unavailable status code. What it tells Google: "I'm still here, but I'm busy right now. Please come back later and don't delete my index." The "Retry-After" Header: Ideally, your server should also send a Retry-After header (e.g., 3600 for one hour). This tells the Googlebot exactly when to try again.



