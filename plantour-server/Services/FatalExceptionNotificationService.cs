using System.Threading;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using plantour_server.Models;
using plantour_server.Services.Interfaces;

namespace plantour_server.Services;

public sealed class FatalExceptionNotificationService : IHostedService, IDisposable
{
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly ILogger<FatalExceptionNotificationService> _logger;
    private readonly BrevoSettings _brevoSettings;
    private int _notificationSent;

    public FatalExceptionNotificationService(
        IServiceScopeFactory serviceScopeFactory,
        ILogger<FatalExceptionNotificationService> logger,
        IOptions<BrevoSettings> brevoSettings)
    {
        _serviceScopeFactory = serviceScopeFactory;
        _logger = logger;
        _brevoSettings = brevoSettings.Value;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        AppDomain.CurrentDomain.UnhandledException += OnUnhandledException;
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        AppDomain.CurrentDomain.UnhandledException -= OnUnhandledException;
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        AppDomain.CurrentDomain.UnhandledException -= OnUnhandledException;
    }

    private void OnUnhandledException(object sender, UnhandledExceptionEventArgs args)
    {
        if (!args.IsTerminating)
        {
            return;
        }

        var exception = args.ExceptionObject as Exception
            ?? new Exception($"Unhandled non-Exception object caused process termination: {args.ExceptionObject}");

        _logger.LogCritical(
            exception,
            "Fatal unhandled exception is terminating the Plantour API process");

        if (Interlocked.Exchange(ref _notificationSent, 1) == 1)
        {
            return;
        }

        TrySendFatalExceptionEmail(exception);
    }

    private void TrySendFatalExceptionEmail(Exception exception)
    {
        if (string.IsNullOrWhiteSpace(_brevoSettings.ExceptionsReceiverEmail)
            || string.IsNullOrWhiteSpace(_brevoSettings.ExceptionsReceiverName))
        {
            return;
        }

        try
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

            emailService.SendExceptionAlertEmailAsync(new ExceptionAlertEmailRequest(
                    _brevoSettings.ExceptionsReceiverEmail,
                    _brevoSettings.ExceptionsReceiverName,
                    StatusCodes.Status503ServiceUnavailable,
                    Guid.NewGuid().ToString("N"),
                    "PROCESS",
                    "/fatal-unhandled-exception",
                    null,
                    Environment.MachineName,
                    "System",
                    "Host",
                    exception.GetType().FullName ?? exception.GetType().Name,
                    exception.Message,
                    "Plantour API is terminating because of an unhandled process-level exception.",
                    exception.InnerException?.GetType().FullName,
                    exception.InnerException?.Message,
                    exception.StackTrace))
                .GetAwaiter()
                .GetResult();
        }
        catch (Exception emailException)
        {
            _logger.LogError(emailException, "Failed to send fatal exception email notification");
        }
    }
}