using System.Net;
using System.Text;
using plantour_server.Services.Interfaces;

namespace plantour_server.Services;

public class EmailService(IBrevoEmailClient brevoEmailClient) : IEmailService
{
    private const string BrandName = "Plantour";
    private const string PrimaryColor = "#3A9AA8";
    private const string PrimaryColorDark = "#2F7C87";
    private const string PrimaryColorLight = "#EBFDFF";
    private const string BorderColor = "#D7EAEE";
    private const string BackgroundColor = "#F3FBFC";
    private const string TextColor = "#1A1A1A";
    private const string MutedColor = "#5E6B70";

    private readonly IBrevoEmailClient _brevoEmailClient = brevoEmailClient;

    public Task<EmailDispatchResult> SendSignInEmailAsync(SignInEmailRequest request)
    {
        var recipientName = GetDisplayName(request.RecipientName, request.RecipientEmail);
        var expiresLabel = request.ExpiresInMinutes == 1
            ? "1 minute"
            : $"{request.ExpiresInMinutes} minutes";

        return SendAsync(new EmailTemplateModel(
            request.RecipientEmail,
            recipientName,
            "Sign in to Plantour",
            "Secure access",
            "Your secure Plantour sign-in link",
            recipientName,
            new[]
            {
                "Use the secure button below to sign in to your Plantour workspace.",
                $"For your security, this sign-in link expires in {expiresLabel}."
            },
            new[]
            {
                new EmailFact("Link validity", expiresLabel)
            },
            Array.Empty<string>(),
            new EmailCallToAction("Sign in to Plantour", request.SignInUrl),
            new[]
            {
                new EmailCallToAction("Direct sign-in link", request.SignInUrl)
            },
            "If you did not request this sign-in link, you can safely ignore this email."));
    }

    public Task<EmailDispatchResult> SendInvitationEmailAsync(InvitationEmailRequest request)
    {
        var recipientName = GetDisplayName(request.RecipientName, request.RecipientEmail);

        return SendAsync(new EmailTemplateModel(
            request.RecipientEmail,
            recipientName,
            "Your Plantour invitation",
            "Invitation",
            "You’ve been invited to Plantour",
            recipientName,
            new[]
            {
                $"{request.AdminName} invited you to join Plantour.",
                "You can open Plantour directly from the button below, or use the participant sign-in link and access code if you prefer the manual sign-in flow."
            },
            new[]
            {
                new EmailFact("Invited by", request.AdminName),
                new EmailFact("Access code", request.AccessCode)
            },
            Array.Empty<string>(),
            new EmailCallToAction("Access Plantour", request.AccessUrl),
            new[]
            {
                new EmailCallToAction("Participant sign-in link", request.SignInUrl)
            },
            $"If you do not recognize {request.AdminName}, ignore this email."));
    }

    public Task<EmailDispatchResult> SendContactSubmissionNotificationEmailAsync(ContactSubmissionNotificationEmailRequest request)
    {
        var recipientName = GetDisplayName(request.RecipientName, request.RecipientEmail);
        var facts = new List<EmailFact>
        {
            new("From", $"{request.FullName} <{request.Email}>"),
            new("Submitted", FormatUtc(request.SubmittedAt))
        };

        if (!string.IsNullOrWhiteSpace(request.SubjectCategory))
        {
            facts.Add(new EmailFact("Category", request.SubjectCategory));
        }

        if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
        {
            facts.Add(new EmailFact("Phone", request.PhoneNumber));
        }

        if (!string.IsNullOrWhiteSpace(request.IpAddress))
        {
            facts.Add(new EmailFact("IP address", request.IpAddress));
        }

        if (!string.IsNullOrWhiteSpace(request.ReferrerUrl))
        {
            facts.Add(new EmailFact("Referrer", request.ReferrerUrl));
        }

        if (!string.IsNullOrWhiteSpace(request.UserAgent))
        {
            facts.Add(new EmailFact("User agent", request.UserAgent));
        }

        var categoryLabel = string.IsNullOrWhiteSpace(request.SubjectCategory)
            ? "General"
            : request.SubjectCategory.Trim();

        var additionalHtml = BuildMessagePanelHtml("Message", request.MessageBody);
        var additionalText = BuildLabeledSectionText("Message", request.MessageBody);

        var model = new EmailTemplateModel(
            request.RecipientEmail,
            recipientName,
            $"Plantour contact submission: {categoryLabel}",
            "Contact submission",
            "A new contact message was submitted",
            recipientName,
            new[]
            {
                "A user submitted a new message through the Plantour contact form.",
                "Review the submission details below and reply directly to the sender if needed."
            },
            facts,
            Array.Empty<string>(),
            null,
            Array.Empty<EmailCallToAction>(),
            "This notification was sent automatically from Plantour.");

        return SendAsync(model, additionalHtml, additionalText);
    }

    public Task<EmailDispatchResult> SendUserCreatedNotificationEmailAsync(UserCreatedNotificationEmailRequest request)
    {
        var recipientName = GetDisplayName(request.RecipientName, request.RecipientEmail);
        var facts = new List<EmailFact>
        {
            new("User ID", request.UserId.ToString()),
            new("Email", request.Email),
            new("Created", FormatUtc(request.CreatedAt)),
            new("Temporary", request.Temporary ? "Yes" : "No")
        };

        var fullName = BuildFullName(request.FirstName, request.LastName);
        if (!string.IsNullOrWhiteSpace(fullName))
        {
            facts.Add(new EmailFact("Name", fullName));
        }

        if (!string.IsNullOrWhiteSpace(request.Phone))
        {
            facts.Add(new EmailFact("Phone", request.Phone));
        }

        if (!string.IsNullOrWhiteSpace(request.AccessTypeName))
        {
            facts.Add(new EmailFact("Access type", request.AccessTypeName));
        }

        if (!string.IsNullOrWhiteSpace(request.ParticipantCode))
        {
            facts.Add(new EmailFact("Participant code", request.ParticipantCode));
        }

        if (!string.IsNullOrWhiteSpace(request.PaddleSubscriptionId))
        {
            facts.Add(new EmailFact("Paddle subscription", request.PaddleSubscriptionId));
        }

        if (!string.IsNullOrWhiteSpace(request.GoogleSub))
        {
            facts.Add(new EmailFact("Google sign-in", "Linked"));
        }

        if (!string.IsNullOrWhiteSpace(request.FacebookUserId))
        {
            facts.Add(new EmailFact("Facebook sign-in", "Linked"));
        }

        var additionalHtml = string.IsNullOrWhiteSpace(request.Notes)
            ? string.Empty
            : BuildMessagePanelHtml("Notes", request.Notes);

        var additionalText = string.IsNullOrWhiteSpace(request.Notes)
            ? null
            : BuildLabeledSectionText("Notes", request.Notes);

        var model = new EmailTemplateModel(
            request.RecipientEmail,
            recipientName,
            $"Plantour user created: {request.Email}",
            "User created",
            "A new user record was created",
            recipientName,
            new[]
            {
                "A new row was added to the Plantour users table by the application.",
                "Review the user details below if you need to audit or follow up on this account."
            },
            facts,
            Array.Empty<string>(),
            null,
            Array.Empty<EmailCallToAction>(),
            "This notification was sent automatically from Plantour.");

        return SendAsync(model, additionalHtml, additionalText);
    }

    public Task<EmailDispatchResult> SendTripParticipantInvitationEmailAsync(TripParticipantInvitationEmailRequest request)
    {
        var recipientName = GetDisplayName(request.RecipientName, request.RecipientEmail);

        return SendAsync(new EmailTemplateModel(
            request.RecipientEmail,
            recipientName,
            $"Plantour: You were added to {request.TripName}",
            "Trip invitation",
            "You’ve been added to a Plantour trip",
            recipientName,
            new[]
            {
                $"{request.AdminName} added you to the trip {request.TripName}.",
                "Open Plantour from the button below to review the trip and your current responsibilities."
            },
            new[]
            {
                new EmailFact("Trip", request.TripName),
                new EmailFact("Added by", request.AdminName)
            },
            Array.Empty<string>(),
            new EmailCallToAction("Open trip in Plantour", request.TripUrl),
            Array.Empty<EmailCallToAction>(),
            "This notification was sent automatically because you were added to a Plantour trip."));
    }

    public Task<EmailDispatchResult> SendParticipantAssignmentChangesEmailAsync(ParticipantAssignmentChangesEmailRequest request)
    {
        var recipientName = GetDisplayName(request.RecipientName, request.RecipientEmail);
        var normalizedAction = request.ActionLabel.ToLowerInvariant();

        var facts = new List<EmailFact>
        {
            new("Trip", request.TripName)
        };

        if (request.DeadlineAt.HasValue)
        {
            facts.Add(new EmailFact("Deadline", FormatUtc(request.DeadlineAt.Value)));
        }

        return SendAsync(new EmailTemplateModel(
            request.RecipientEmail,
            recipientName,
            $"Plantour: {request.EntityLabel} {request.ActionLabel} for {request.TripName}",
            "Trip update",
            $"Your {request.EntityLabel.ToLowerInvariant()} were updated",
            recipientName,
            new[]
            {
                $"{request.AdminName} {normalizedAction} the following {request.EntityLabel.ToLowerInvariant()} for the trip {request.TripName}.",
                "Review the updated list below and open Plantour to see the latest state."
            },
            facts,
            request.EntityNames,
            new EmailCallToAction($"Open {request.EntityLabel} in Plantour", request.PageUrl),
            Array.Empty<EmailCallToAction>(),
            "This notification was sent automatically because your Plantour assignments changed."));
    }

    public Task<EmailDispatchResult> SendAdminParticipantActionEmailAsync(AdminParticipantActionEmailRequest request)
    {
        var recipientName = GetDisplayName(request.RecipientName, request.RecipientEmail);
        var normalizedAction = request.ActionLabel.ToLowerInvariant();

        return SendAsync(new EmailTemplateModel(
            request.RecipientEmail,
            recipientName,
            $"Plantour: {request.ParticipantName} {normalizedAction} a {request.EntityLabel}",
            "Participant activity",
            $"{request.ParticipantName} {normalizedAction} a {request.EntityLabel}",
            recipientName,
            new[]
            {
                $"{request.ParticipantName} {normalizedAction} the {request.EntityLabel.ToLowerInvariant()} {request.EntityName}.",
                $"Trip: {request.TripName}."
            },
            new[]
            {
                new EmailFact("Trip", request.TripName),
                new EmailFact(Capitalize(request.EntityLabel), request.EntityName)
            },
            Array.Empty<string>(),
            new EmailCallToAction($"Open {request.EntityLabel} in Plantour", request.PageUrl),
            Array.Empty<EmailCallToAction>(),
            "This notification was sent automatically from Plantour so you can keep track of participant activity."));
    }

    public Task<EmailDispatchResult> SendExceptionAlertEmailAsync(ExceptionAlertEmailRequest request)
    {
        var recipientName = GetDisplayName(request.RecipientName, request.RecipientEmail);
        var facts = new List<EmailFact>
        {
            new("Status code", request.StatusCode.ToString()),
            new("Trace ID", request.TraceId),
            new("Request", $"{request.RequestMethod} {request.RequestPath}"),
            new("Remote IP", request.RemoteIpAddress),
            new("User", $"{request.UserId} ({request.UserRole})"),
            new("Exception type", request.ExceptionType)
        };

        if (!string.IsNullOrWhiteSpace(request.RequestQueryString))
        {
            facts.Add(new EmailFact("Query", request.RequestQueryString));
        }

        var paragraphs = new List<string>
        {
            "Plantour API reported an exception that requires review."
        };

        if (!string.IsNullOrWhiteSpace(request.CustomMessage))
        {
            paragraphs.Add($"Reported message: {request.CustomMessage}");
        }

        var additionalHtml = BuildExceptionSectionsHtml(request);
        var additionalText = BuildExceptionSectionsText(request);

        var model = new EmailTemplateModel(
            request.RecipientEmail,
            recipientName,
            $"Plantour API exception ({request.StatusCode})",
            "Operational alert",
            "Plantour API exception detected",
            recipientName,
            paragraphs,
            facts,
            Array.Empty<string>(),
            null,
            Array.Empty<EmailCallToAction>(),
            "This alert was sent automatically from Plantour API.");

        return SendAsync(model, additionalHtml, additionalText);
    }

    private async Task<EmailDispatchResult> SendAsync(EmailTemplateModel model)
    {
        return await SendAsync(model, string.Empty, null);
    }

    private async Task<EmailDispatchResult> SendAsync(EmailTemplateModel model, string additionalSectionsHtml, string? additionalText)
    {
        var htmlContent = BuildHtml(model, additionalSectionsHtml);
        var textContent = BuildText(model, additionalText);
        var sendResult = await _brevoEmailClient.SendTransactionalEmailAsync(
            model.RecipientEmail,
            model.RecipientName,
            model.Subject,
            htmlContent,
            textContent);

        return new EmailDispatchResult(model.Subject, htmlContent, textContent, sendResult.MessageId);
    }

    private static string BuildHtml(EmailTemplateModel model, string additionalSectionsHtml = "")
    {
        var previewText = model.Paragraphs.FirstOrDefault() ?? model.Subject;
        var factsHtml = BuildFactsHtml(model.Facts);
        var bulletsHtml = BuildBulletsHtml(model.BulletItems);
        var secondaryLinksHtml = BuildSecondaryLinksHtml(model.SecondaryLinks);
        var paragraphsHtml = string.Join(string.Empty, model.Paragraphs.Select(paragraph =>
            $"<p style=\"margin:0 0 16px;font-size:16px;line-height:1.7;color:{TextColor};\">{Encode(paragraph)}</p>"));

        var ctaHtml = model.PrimaryCta == null
            ? string.Empty
            : string.Concat(
                $"<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"margin:8px 0 24px;\">",
                "<tr>",
                $"<td align=\"center\" bgcolor=\"{PrimaryColor}\" style=\"border-radius:999px;\">",
                $"<a href=\"{EncodeAttribute(model.PrimaryCta.Url)}\" style=\"display:inline-block;padding:14px 26px;font-size:15px;font-weight:700;line-height:1;color:#FFFFFF;text-decoration:none;background:{PrimaryColor};border-radius:999px;\">{Encode(model.PrimaryCta.Label)}</a>",
                "</td>",
                "</tr>",
                "</table>");

        var builder = new StringBuilder();
        builder.AppendLine("<!DOCTYPE html>");
        builder.AppendLine("<html lang=\"en\">");
        builder.AppendLine("<head>");
        builder.AppendLine("    <meta charset=\"UTF-8\" />");
        builder.AppendLine("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />");
        builder.AppendLine($"    <title>{Encode(model.Subject)}</title>");
        builder.AppendLine("</head>");
        builder.AppendLine($"<body style=\"margin:0;padding:0;background:{BackgroundColor};font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;color:{TextColor};\">");
        builder.AppendLine($"    <span style=\"display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;\">{Encode(previewText)}</span>");
        builder.AppendLine($"    <table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"background:{BackgroundColor};padding:24px 12px;\">");
        builder.AppendLine("        <tr>");
        builder.AppendLine("            <td align=\"center\">");
        builder.AppendLine($"                <table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"max-width:640px;background:#FFFFFF;border:1px solid {BorderColor};border-radius:28px;overflow:hidden;\">");
        builder.AppendLine("                    <tr>");
        builder.AppendLine($"                        <td style=\"background:{PrimaryColor};padding:28px 32px 24px;\">");
        builder.AppendLine($"                            <div style=\"font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#DFF8FB;font-weight:700;margin-bottom:12px;\">{Encode(model.Eyebrow)}</div>");
        builder.AppendLine($"                            <div style=\"font-size:30px;line-height:1.2;font-weight:800;color:#FFFFFF;margin-bottom:10px;\">{BrandName}</div>");
        builder.AppendLine($"                            <div style=\"font-size:18px;line-height:1.5;color:#FFFFFF;max-width:480px;\">{Encode(model.Title)}</div>");
        builder.AppendLine("                        </td>");
        builder.AppendLine("                    </tr>");
        builder.AppendLine("                    <tr>");
        builder.AppendLine("                        <td style=\"padding:32px;\">");
        builder.AppendLine($"                            <p style=\"margin:0 0 20px;font-size:18px;line-height:1.5;font-weight:700;color:{PrimaryColorDark};\">Hello {Encode(model.GreetingName)},</p>");
        builder.AppendLine($"                            {paragraphsHtml}");
        builder.AppendLine($"                            {factsHtml}");
        builder.AppendLine($"                            {bulletsHtml}");
        builder.AppendLine($"                            {ctaHtml}");
        builder.AppendLine($"                            {secondaryLinksHtml}");
        builder.AppendLine($"                            {additionalSectionsHtml}");
        builder.AppendLine($"                            <div style=\"margin-top:28px;padding-top:20px;border-top:1px solid {BorderColor};font-size:14px;line-height:1.7;color:{MutedColor};\">{Encode(model.ClosingNote)}</div>");
        builder.AppendLine("                        </td>");
        builder.AppendLine("                    </tr>");
        builder.AppendLine("                </table>");
        builder.AppendLine("            </td>");
        builder.AppendLine("        </tr>");
        builder.AppendLine("    </table>");
        builder.AppendLine("</body>");
        builder.AppendLine("</html>");

        return builder.ToString();
    }

    private static string BuildText(EmailTemplateModel model, string? additionalText = null)
    {
        var builder = new StringBuilder();

        builder.AppendLine(model.Subject);
        builder.AppendLine();
        builder.AppendLine($"Hello {model.GreetingName},");
        builder.AppendLine();

        foreach (var paragraph in model.Paragraphs)
        {
            builder.AppendLine(paragraph);
            builder.AppendLine();
        }

        if (model.Facts.Count > 0)
        {
            foreach (var fact in model.Facts)
            {
                builder.AppendLine($"{fact.Label}: {fact.Value}");
            }

            builder.AppendLine();
        }

        if (model.BulletItems.Count > 0)
        {
            builder.AppendLine("Details:");
            foreach (var item in model.BulletItems)
            {
                builder.AppendLine($"- {item}");
            }

            builder.AppendLine();
        }

        if (model.PrimaryCta != null)
        {
            builder.AppendLine($"{model.PrimaryCta.Label}: {model.PrimaryCta.Url}");
        }

        if (model.SecondaryLinks.Count > 0)
        {
            builder.AppendLine();
            foreach (var link in model.SecondaryLinks)
            {
                builder.AppendLine($"{link.Label}: {link.Url}");
            }
        }

        if (!string.IsNullOrWhiteSpace(additionalText))
        {
            builder.AppendLine();
            builder.AppendLine(additionalText.Trim());
        }

        builder.AppendLine();
        builder.AppendLine(model.ClosingNote);
        builder.AppendLine();
        builder.AppendLine(BrandName);

        return builder.ToString().Trim();
    }

    private static string BuildFactsHtml(IReadOnlyList<EmailFact> facts)
    {
        if (facts.Count == 0)
        {
            return string.Empty;
        }

        var items = string.Join(string.Empty, facts.Select(fact =>
            $"<tr><td style=\"padding:0 0 10px;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:{PrimaryColorDark};width:160px;vertical-align:top;\">{Encode(fact.Label)}</td><td style=\"padding:0 0 10px;font-size:15px;line-height:1.6;color:{TextColor};\">{Encode(fact.Value)}</td></tr>"));

        return string.Concat(
            $"<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"margin:8px 0 24px;background:{PrimaryColorLight};border:1px solid {BorderColor};border-radius:18px;padding:20px 22px;\">",
            "<tr><td>",
            "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">",
            items,
            "</table>",
            "</td></tr>",
            "</table>");
    }

    private static string BuildBulletsHtml(IReadOnlyList<string> bulletItems)
    {
        if (bulletItems.Count == 0)
        {
            return string.Empty;
        }

        var items = string.Join(string.Empty, bulletItems.Select(item =>
            $"<li style=\"margin:0 0 10px;color:{TextColor};\">{Encode(item)}</li>"));

        return string.Concat(
            $"<div style=\"margin:0 0 24px;padding:22px 24px;background:#FFFFFF;border:1px solid {BorderColor};border-radius:18px;\">",
            $"<div style=\"margin:0 0 14px;font-size:14px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:{PrimaryColorDark};\">Included in this update</div>",
            $"<ul style=\"margin:0;padding-left:22px;font-size:15px;line-height:1.6;\">{items}</ul>",
            "</div>");
    }

    private static string BuildSecondaryLinksHtml(IReadOnlyList<EmailCallToAction> secondaryLinks)
    {
        if (secondaryLinks.Count == 0)
        {
            return string.Empty;
        }

        var blocks = string.Join(string.Empty, secondaryLinks.Select(link =>
            string.Concat(
                $"<div style=\"margin:0 0 12px;padding:16px 18px;background:#FFFFFF;border:1px dashed {BorderColor};border-radius:16px;\">",
                $"<div style=\"margin:0 0 6px;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:{PrimaryColorDark};\">{Encode(link.Label)}</div>",
                $"<a href=\"{EncodeAttribute(link.Url)}\" style=\"font-size:14px;line-height:1.6;color:{PrimaryColor};word-break:break-all;text-decoration:none;\">{Encode(link.Url)}</a>",
                "</div>")));

        return string.Concat(
            "<div style=\"margin:0 0 24px;\">",
            blocks,
            "</div>");
    }

    private static string BuildExceptionSectionsHtml(ExceptionAlertEmailRequest request)
    {
        var builder = new StringBuilder();
        builder.Append(BuildMessagePanelHtml("Exception message", request.ExceptionMessage));

        if (!string.IsNullOrWhiteSpace(request.InnerExceptionMessage))
        {
            var innerSummary = string.IsNullOrWhiteSpace(request.InnerExceptionType)
                ? request.InnerExceptionMessage
                : $"{request.InnerExceptionType}: {request.InnerExceptionMessage}";
            builder.Append(BuildMessagePanelHtml("Inner exception", innerSummary));
        }

        if (!string.IsNullOrWhiteSpace(request.StackTrace))
        {
            builder.Append(string.Concat(
                $"<div style=\"margin:0 0 24px;padding:22px 24px;background:#FFFFFF;border:1px solid {BorderColor};border-radius:18px;\">",
                $"<div style=\"margin:0 0 14px;font-size:14px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:{PrimaryColorDark};\">Stack trace</div>",
                $"<pre style=\"margin:0;font-size:12px;line-height:1.6;color:{TextColor};white-space:pre-wrap;word-break:break-word;\">{Encode(request.StackTrace)}</pre>",
                "</div>"));
        }

        return builder.ToString();
    }

    private static string BuildExceptionSectionsText(ExceptionAlertEmailRequest request)
    {
        var builder = new StringBuilder();
        builder.AppendLine("Exception message:");
        builder.AppendLine(request.ExceptionMessage);

        if (!string.IsNullOrWhiteSpace(request.InnerExceptionMessage))
        {
            builder.AppendLine();
            builder.AppendLine("Inner exception:");
            if (!string.IsNullOrWhiteSpace(request.InnerExceptionType))
            {
                builder.AppendLine(request.InnerExceptionType);
            }
            builder.AppendLine(request.InnerExceptionMessage);
        }

        if (!string.IsNullOrWhiteSpace(request.StackTrace))
        {
            builder.AppendLine();
            builder.AppendLine("Stack trace:");
            builder.AppendLine(request.StackTrace);
        }

        return builder.ToString().Trim();
    }

    private static string BuildLabeledSectionText(string label, string content)
    {
        var builder = new StringBuilder();
        builder.AppendLine($"{label}:");
        builder.AppendLine(content);
        return builder.ToString().Trim();
    }

    private static string BuildMessagePanelHtml(string title, string content)
    {
        return string.Concat(
            $"<div style=\"margin:0 0 24px;padding:22px 24px;background:#FFFFFF;border:1px solid {BorderColor};border-radius:18px;\">",
            $"<div style=\"margin:0 0 14px;font-size:14px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:{PrimaryColorDark};\">{Encode(title)}</div>",
            $"<div style=\"font-size:15px;line-height:1.7;color:{TextColor};word-break:break-word;\">{Encode(content)}</div>",
            "</div>");
    }

    private static string GetDisplayName(string? preferredName, string fallbackEmail)
    {
        return string.IsNullOrWhiteSpace(preferredName)
            ? fallbackEmail
            : preferredName.Trim();
    }

    private static string FormatUtc(DateTime value)
    {
        return $"{value:yyyy-MM-dd HH:mm} UTC";
    }

    private static string Capitalize(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return value;
        }

        return char.ToUpperInvariant(value[0]) + value[1..];
    }

    private static string? BuildFullName(string? firstName, string? lastName)
    {
        var fullName = string.Join(" ", new[] { firstName?.Trim(), lastName?.Trim() }.Where(value => !string.IsNullOrWhiteSpace(value)));
        return string.IsNullOrWhiteSpace(fullName) ? null : fullName;
    }

    private static string Encode(string? value)
    {
        return WebUtility.HtmlEncode(value ?? string.Empty);
    }

    private static string EncodeAttribute(string? value)
    {
        return WebUtility.HtmlEncode(value ?? string.Empty);
    }

    private sealed record EmailTemplateModel(
        string RecipientEmail,
        string RecipientName,
        string Subject,
        string Eyebrow,
        string Title,
        string GreetingName,
        IReadOnlyList<string> Paragraphs,
        IReadOnlyList<EmailFact> Facts,
        IReadOnlyList<string> BulletItems,
        EmailCallToAction? PrimaryCta,
        IReadOnlyList<EmailCallToAction> SecondaryLinks,
        string ClosingNote);

    private sealed record EmailFact(string Label, string Value);

    private sealed record EmailCallToAction(string Label, string Url);
}