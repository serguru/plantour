using Hangfire;
using plantour_server.Services;

namespace plantour_server.Utils.ProgramAdds;

public static class HangfireJobsConfig
{
    public static void RegisterRecurringJobs(this IApplicationBuilder app)
    {

        // var activeJobIds = new List<string>
        // {
        //     "daily-cleanup",
        //     "send-invoices"
        // };


        using var scope = app.ApplicationServices.CreateScope();
        var recurringJobManager = scope.ServiceProvider.GetRequiredService<IRecurringJobManager>();

        recurringJobManager.AddOrUpdate<SchedulerService>(
            "delete-expired-refresh-tokens",
            service => service.DeleteExpiredRefreshTokensAsync(),
            Cron.Daily
        );

        recurringJobManager.AddOrUpdate<SchedulerService>(
            "delete-old-ai-prompts",
            service => service.DeleteOldAIPromptsAsync(),
            Cron.Daily
        );

        recurringJobManager.AddOrUpdate<SchedulerService>(
            "delete-old-error-logs",
            service => service.DeleteOldErrorLogsAsync(),
            Cron.Daily
        );

    }
}


