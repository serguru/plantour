import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
//  const token = localStorage.getItem('jwt');
  const token = "eyJhbGciOiJIUzI1NiIsImtpZCI6IkpGbEFnV3Jsd1hPZExabFQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2V1b3B1dmdsZW1pamt4dnlpbWdiLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI1N2I0YzQzNS1jYmYyLTRiYTItYTUyNi02MzhhMGZmMGRhMmYiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYzMjc4NjM4LCJpYXQiOjE3NjMyNzUwMzgsImVtYWlsIjoid2VibGlua3NhcHBAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6IndlYmxpbmtzYXBwQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJzdF9uYW1lIjoiU2VyZ2UiLCJsYXN0X25hbWUiOiJDaGVybnkiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjU3YjRjNDM1LWNiZjItNGJhMi1hNTI2LTYzOGEwZmYwZGEyZiJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzYzMjc1MDM4fV0sInNlc3Npb25faWQiOiJhZjEzNDU3MS1hODZmLTRkZGItYjBhMi00NzU0MmYyMjJjY2YiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.DIOUjkk6aD2TD5EbkEtMzQQb6p-t_raotgJi3H1l0ao";

  // If there's no token, just continue
  if (!token) {
    return next(req);
  }

  // Clone request and add Authorization header
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};
