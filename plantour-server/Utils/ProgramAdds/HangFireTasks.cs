using System.Linq.Expressions;
using Hangfire;
using Hangfire.Storage;
using Hangfire.PostgreSql;
using plantour_server.Services;

namespace plantour_server.Utils.ProgramAdds;

class RecurringTask<T>
{
    public string RecurringJobId { get; set; } = string.Empty;
    public Expression<Func<T, Task>> MethodCall { get; set; } = null!;
    public Func<string> CronExpression { get; set; } = null!;
}

public static class HangfireJobsConfig
{

    public static void RegisterRecurringJobs(this IApplicationBuilder app)
    {
        var monitor = JobStorage.Current.GetMonitoringApi();

        // 1. Clear Retries (In Hangfire, Retries = Scheduled)
        var scheduledJobs = monitor.ScheduledJobs(0, 1000);
        foreach (var job in scheduledJobs)
        {
            // job.Key is the JobId
            BackgroundJob.Delete(job.Key);
        }

        // 2. Clear Enqueued
        var enqueuedJobs = monitor.EnqueuedJobs("default", 0, 1000);
        foreach (var job in enqueuedJobs)
        {
            BackgroundJob.Delete(job.Key);
        }

        // 3. Clear Failed
        var failedJobs = monitor.FailedJobs(0, 1000);
        foreach (var job in failedJobs)
        {
            BackgroundJob.Delete(job.Key);
        }

        // 4. Clear Processing (Careful: these are currently running)
        var processingJobs = monitor.ProcessingJobs(0, 1000);
        foreach (var job in processingJobs)
        {
            BackgroundJob.Delete(job.Key);
        }


        var activeJobIds = new List<RecurringTask<SchedulerService>>
        {
            new() {
                RecurringJobId = "delete-expired-refresh-tokens",
                MethodCall = service => service.DeleteExpiredRefreshTokensAsync(),
                CronExpression = () => Cron.Daily()
            },
            new() {
                RecurringJobId = "delete-old-ai-prompts",
                MethodCall = service => service.DeleteOldAIPromptsAsync(),
                CronExpression = () => Cron.Daily()
            },
            new() {
                RecurringJobId = "delete-old-error-logs",
                MethodCall = service => service.DeleteOldErrorLogsAsync(),
                CronExpression = () => Cron.Daily()
            }
        };

        using (var connection = JobStorage.Current.GetConnection())
        {
            // Fetch all recurring jobs currently in the DB
            var allJobIdsInDb = connection.GetRecurringJobs().Select(j => j.Id.ToLower()).ToList();
            foreach (var jobId in allJobIdsInDb)
            {
                if (!activeJobIds.Any(x => x.RecurringJobId == jobId))
                {
                    RecurringJob.RemoveIfExists(jobId);
                }
            }
        }

        using var scope = app.ApplicationServices.CreateScope();
        var recurringJobManager = scope.ServiceProvider.GetRequiredService<IRecurringJobManager>();

        activeJobIds.ForEach(job =>
        {
            recurringJobManager.AddOrUpdate(
                job.RecurringJobId,
                job.MethodCall,
                job.CronExpression()
            );
        });
    }
}


