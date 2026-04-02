# Plantour private access through a Render tunnel

This document explains how to open the Plantour app privately while the Render service is under Maintenance Mode.

It covers two cases:

1. You access Plantour from your own computer.
2. Another person accesses Plantour from their own computer.

## Important limitation

Do not try to share your own `localhost:4200` with another person over the internet.

That is not a proper private Render tunnel. It is fragile and unsafe.

The correct approach is:

1. Each person creates their own SSH tunnel from their own computer.
2. Each person must have SSH access to the Render service.

If the other person must not get Render access, then use another solution such as a separate protected pre-production environment or Cloudflare Access. That is a different setup and is not the same as a local SSH tunnel.

## What you need

1. Plantour frontend and, if necessary, backend already deployed to Render.
2. Render Maintenance Mode can stay enabled.
3. OpenSSH client installed on Windows.
4. An SSH key on each tester computer.
5. That SSH public key added to the proper Render account or team that owns the service.
6. The Render SSH host for the frontend service.
7. If you also need private API access, the Render SSH host for the backend service.

## Case 1. Access from your own computer

### Step 1. Create an SSH key if you do not already have one

Open PowerShell and run:

```powershell
ssh-keygen -t ed25519 -C "your-email@example.com"
```

Press Enter to accept the default path.

Then show the public key:

```powershell
Get-Content ~/.ssh/id_ed25519.pub
```

Copy that full line.

### Step 2. Add the public key to Render

In Render:

1. Open the account or team that owns the Plantour service.
2. Open the SSH keys section.
3. Add the public key copied in the previous step.
4. Save it.

If the key is not added, the tunnel will not connect.

### Step 3. Get the SSH host for the frontend service

Open the Render frontend service and find its SSH connection string.

It looks similar to this:

```text
srv-d70qibk9c44c73b7119g@ssh.oregon.render.com
```

Your actual value can be different.

### Step 4. Start the frontend tunnel

Open a new PowerShell window and run:

```powershell
ssh -N -o ServerAliveInterval=60 -L 4200:localhost:10000 srv-d70qibk9c44c73b7119g@ssh.oregon.render.com
```

Notes:

1. `4200` is your local port. You can change it if needed.
2. `10000` is the internal service port used in your existing Plantour note. If the service listens on another port, replace it.
3. Leave this PowerShell window open while you work.

### Step 5. Open the app

Open this address in your browser:

```text
http://localhost:4200
```

If the tunnel is correct, you should see the real frontend app instead of the public maintenance page.

### Step 6. Decide how the frontend will reach the API

There are two valid situations.

#### Situation A. The API is not under Maintenance Mode

If the deployed Plantour frontend is configured to call the public API URL and the backend is not blocked, the frontend can keep using that API normally.

In that case, no extra tunnel is required.

#### Situation B. The API is also private

If the backend is also under Maintenance Mode, create a second tunnel.

Open another PowerShell window and run:

```powershell
ssh -N -o ServerAliveInterval=60 -L 4201:localhost:10000 srv-your-backend-service-id@ssh.oregon.render.com
```

Then test the API directly:

```text
http://localhost:4201
```

Example health check if your backend has one:

```text
http://localhost:4201/health
```

Important: if the deployed frontend bundle calls `https://api.plantour.app` or another public URL, browser requests will still go there, not to `localhost:4201`.

So for full browser-based testing with a private backend, use one of these approaches:

1. Keep the backend public and authenticated while only the frontend stays behind Maintenance Mode.
2. Use a separate test deployment whose API base URL points to the private backend path you want to test.
3. Use a local reverse proxy that maps the expected API host to your backend tunnel.

For most Plantour smoke testing, option 1 is the simplest.

### Step 7. Stop the tunnel when finished

Go back to the PowerShell window where `ssh -N ...` is running and press `Ctrl+C`.

That immediately closes the tunnel.

## Case 2. Another person accesses Plantour from their own computer

The second person must repeat the same process on their own machine.

### Step 1. Give the second person Render SSH access

The clean approach is:

1. Add that person to the proper Render team, or
2. Add that person's public SSH key where the service can accept it.

Do not share your private SSH key.

Do not share your local `localhost` port over the internet.

### Step 2. On their computer, create an SSH key

They run:

```powershell
ssh-keygen -t ed25519 -C "their-email@example.com"
Get-Content ~/.ssh/id_ed25519.pub
```

They send you only the public key, not the private key.

### Step 3. Add their public key to Render

Add their public key to the same Render account or team that owns the Plantour service.

### Step 4. They create their own tunnel

They run on their own computer:

```powershell
ssh -N -o ServerAliveInterval=60 -L 4200:localhost:10000 srv-d70qibk9c44c73b7119g@ssh.oregon.render.com
```

If they also need direct backend access, they create a second tunnel as well.

### Step 5. They open the app locally

They browse to:

```text
http://localhost:4200
```

This gives them their own private connection to the Render service.

## Recommended working model

For Plantour, the safest and simplest model is this:

1. Keep the frontend under Render Maintenance Mode.
2. Access the frontend privately through an SSH tunnel.
3. Keep the backend reachable only as much as needed for testing.
4. Give each tester their own SSH tunnel.
5. Remove SSH access for temporary testers after testing is finished.

## Quick checklist

Use this checklist every time.

1. Render service is deployed.
2. Maintenance Mode is still enabled.
3. SSH key exists on the tester computer.
4. Public key is added to Render.
5. Frontend tunnel command is running.
6. `http://localhost:4200` opens the real app.
7. If needed, backend tunnel command is running.
8. Testing is finished.
9. Tunnel windows are closed.
10. Temporary tester SSH access is removed if no longer needed.

## Troubleshooting

### Problem: `Permission denied (publickey)`

Reason: the SSH public key was not added to Render, or the wrong private key is being used.

Check:

1. The public key in Render matches the tester machine.
2. The local key exists in `~/.ssh/`.
3. The correct Render account or team owns the service.

### Problem: the browser still shows the maintenance page

Reason: you probably opened the public Plantour URL instead of the local tunnel URL.

Use:

```text
http://localhost:4200
```

not the public production domain.

### Problem: frontend opens, but API calls fail

Reason: the frontend is working through the tunnel, but the backend URL used by the deployed app is still public, blocked, wrong, or not reachable from the browser.

Check:

1. What `api.baseUrl` is configured in the deployed frontend environment.
2. Whether the backend is also under Maintenance Mode.
3. Whether CORS and auth allow the frontend origin you are using.
4. Whether you need a second backend tunnel or a separate test deployment.

### Problem: tunnel disconnects after some time

Use the keepalive option already shown above:

```powershell
ssh -N -o ServerAliveInterval=60 -L 4200:localhost:10000 srv-your-service-id@ssh.oregon.render.com
```

## Short answer

If you want both you and another person to access a Render service privately while Maintenance Mode stays on, each of you should create your own SSH tunnel from your own computer to the Render service.

That is the correct private-access workflow.