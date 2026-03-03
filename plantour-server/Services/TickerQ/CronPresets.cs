namespace plantour_server.Services.TickerQ;

public enum CronPreset
{
    EveryMinute,
    Every5Minutes,
    Every10Minutes,
    Every15Minutes,
    Every30Minutes,
    Hourly,
    Every2Hours,
    Every6Hours,
    DailyAtMidnightUtc,
    DailyAt01_00Utc,
    DailyAt01_10Utc,
    DailyAt01_20Utc,
    DailyAt09_00Utc,
    DailyAtNoonUtc,
    DailyAt23_00Utc,
    WeeklyMondayAt01_00Utc,
    MonthlyFirstDayAt01_00Utc,
    YearlyJan1AtMidnightUtc
}

public static class CronPresetExtensions
{
    public static string ToExpression(this CronPreset preset)
    {
        return preset switch
        {
            CronPreset.EveryMinute => "0 * * * * *",
            CronPreset.Every5Minutes => "0 */5 * * * *",
            CronPreset.Every10Minutes => "0 */10 * * * *",
            CronPreset.Every15Minutes => "0 */15 * * * *",
            CronPreset.Every30Minutes => "0 */30 * * * *",
            CronPreset.Hourly => "0 0 * * * *",
            CronPreset.Every2Hours => "0 0 */2 * * *",
            CronPreset.Every6Hours => "0 0 */6 * * *",
            CronPreset.DailyAtMidnightUtc => "0 0 0 * * *",
            CronPreset.DailyAt01_00Utc => "0 0 1 * * *",
            CronPreset.DailyAt01_10Utc => "0 10 1 * * *",
            CronPreset.DailyAt01_20Utc => "0 20 1 * * *",
            CronPreset.DailyAt09_00Utc => "0 0 9 * * *",
            CronPreset.DailyAtNoonUtc => "0 0 12 * * *",
            CronPreset.DailyAt23_00Utc => "0 0 23 * * *",
            CronPreset.WeeklyMondayAt01_00Utc => "0 0 1 * * 1",
            CronPreset.MonthlyFirstDayAt01_00Utc => "0 0 1 1 * *",
            CronPreset.YearlyJan1AtMidnightUtc => "0 0 0 1 1 *",
            _ => throw new ArgumentOutOfRangeException(nameof(preset), preset, "Unsupported cron preset")
        };
    }
}