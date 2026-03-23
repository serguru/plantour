## This file contains steps of deployment to the production

Step 1. DB.

- Buy a PostgreSQL service in Render. Build the connection string. Connect the server from the local computer. Set the connection.

- Create 4-pred-prod-settings.sql. Run all 4 SQL scripts. Make sure the DB is ready.

Step 2. API.

- Buy a Docker web service in Render. - done

- Set  the ASPNETCORE_ENVIRONMENT variable In Render to "pred-prod" (it will be "production" for production)

Ensure that the pred-prod environment guarantees the following:
- `src/server.ts` adds `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet`

- server.ts has this code
    app.use((req, res, next) => {
    if (environment.environment !== 'production' || isAuthPage(req.path)) {
        res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
    }

    next();
    });





- SitemapController /sitemap.xml returns NotFound();
- SitemapController /robots.txt returns 
                "User-agent: *",
                "Disallow: /"


- this code is in Program.cs
    if (!app.Environment.IsProduction())
    {
        app.Use(async (context, next) =>
        {
            context.Response.Headers.Append("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
            await next();
        });
    }

- this code is in app-component.ts
    showNonProductionBanner = this.environmentName !== 'production';

- this code is in paddle-service.ts
    const instance = await initializePaddle({
      environment: this.environment.environment === "production" ? 'production' : 'sandbox',
      token: 'test_c4c0e48b001d35f302e3ef618a6',
      eventCallback: (event) => {
        const eventName = event?.name;

        if (!eventName) {
          return;
        }

        this.checkoutEventHandler?.(eventName);
      }
    });

- ensure right values in environment.pred-prod.ts
    export const environment = {
        environment: "pred-prod",
        // Put pre-production API endpoints and feature flags here
        api: {
            baseUrl: 'https://plantour-server-qa.onrender.com'
        },
        clientUrl: 'https://plantour-client-qa.onrender.com',
        googleClientId: '256558134062-f78noulvdiq52n7bfmmh0cm23j91942s.apps.googleusercontent.com',
        facebookAppId: '2076632839798115',
        turnstileSiteKey: '',
        version: '0.1.0'
    };



