using System.Security.Cryptography;
using System.Text;

namespace plantour_server.Utils;

public static class DateUtils
{

    public static string FormatDate(DateOnly date)
    {
        return date.ToString("MMM d, yyyy");
    }

    public static string TwoDatesToStr(DateOnly? start, DateOnly? end)
    {
        if (start == null && end == null)
            return String.Empty;

        if (start != null && end != null)
            if (start <= end)
            {
                return $"{FormatDate(start.Value)} - {FormatDate(end.Value)}";
            }
            else
            {
                return String.Empty;
            }

        if (start != null)
            return $"{FormatDate(start.Value)} - ?";

        return $"? - {FormatDate(end!.Value)}";
    }

}