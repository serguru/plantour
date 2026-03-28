using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Text.Json;
using plantour_server.DTOs;
using plantour_server.Repositories;
using plantour_server.Services.Interfaces;
using PlantourApi.Models;
using plantour_server.Utils;

namespace plantour_server.Services;

public class DocumentsService : IDocumentsService
{
    private readonly ITripService _tripService;
    private readonly ITripUserService _tripUserService;
    private readonly ITripPackageService _tripPackageService;
    private readonly ITripThingService _tripThingService;
    private readonly ITripTodoService _tripTodoService;
    private readonly ITripSharedTodoService _tripSharedTodoService;
    private readonly ITripExpenseService _tripExpenseService;
    private readonly ITripSharedExpenseService _tripSharedExpenseService;
    private readonly TripNoteRepository _tripNoteRepository;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IDropboxService _dropboxService;
    private readonly CurrentUser _currentUser;

    private readonly ICheckAccessService _checkAccessService;

    private const string primaryColor = "#2F7C87";

    public DocumentsService(
        ITripService tripService,
        ITripUserService tripUserService,
        ITripPackageService tripPackageService,
        ITripThingService tripThingService,
        ITripTodoService tripTodoService,
        ITripSharedTodoService tripSharedTodoService,
        ITripExpenseService tripExpenseService,
        ITripSharedExpenseService tripSharedExpenseService,
        TripNoteRepository tripNoteRepository,
        IHttpClientFactory httpClientFactory,
        IDropboxService dropboxService,
        HttpCurrentUser httpCurrentUser,
        ICheckAccessService checkAccessService)
    {
        _tripService = tripService;
        _tripUserService = tripUserService;
        _tripPackageService = tripPackageService;
        _tripThingService = tripThingService;
        _tripTodoService = tripTodoService;
        _tripSharedTodoService = tripSharedTodoService;
        _tripExpenseService = tripExpenseService;
        _tripSharedExpenseService = tripSharedExpenseService;
        _tripNoteRepository = tripNoteRepository;
        _httpClientFactory = httpClientFactory;
        _dropboxService = dropboxService;
        _currentUser = httpCurrentUser.CurrentUser;
        _checkAccessService = checkAccessService;
    }

    public async Task<byte[]> GenerateTripReportPdfAsync(Guid tripId)
    {
        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new UnauthorizedAccessException("User does not have access to this trip");
        }

        var trip = await _tripService.GetByIdWithStatsAsync(tripId);
        if (trip == null)
        {
            throw new Exception($"Trip with ID {tripId} not found");
        }

        var participants = (await _tripUserService.GetAllAsync(tripId)).ToList();

        var packages = (await _tripPackageService.GetAllAsync(tripId)).ToList();

        var allThings = (await _tripThingService.GetAllAsync(tripId)).ToList();
        var allTodos = (await _tripTodoService.GetAllAsync(tripId)).ToList();
        var sharedTodos = (await _tripSharedTodoService.GetAllFullAsync(tripId)).ToList();

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header()
                    .Column(column =>
                    {
                        column.Item()
                            .Text("Plantour Trip Report")
                            .SemiBold()
                            .FontSize(24)
                            .FontColor(primaryColor);
                        column.Item()
                            .Text($"Generated: {DateTime.Now:dd.MM.yyyy HH:mm}")
                            .FontSize(9)
                            .FontColor(Colors.Grey.Darken1);
                    });

                page.Content()
                    .PaddingVertical(1, Unit.Centimetre)
                    .Column(column =>
                    {
                        column.Spacing(15);

                        // Секция 1: Данные о путешествии
                        RenderTripInfo(column, trip, participants);

                        // Секция 2: Список участников
                        if (participants.Any())
                        {
                            RenderParticipants(column, participants);
                        }

                        // Секция 3: Упаковки и вещи
                        if (packages.Any())
                        {
                            RenderPackagesWithThings(column, packages, allThings);
                        }

                        if (allTodos.Any() || sharedTodos.Any())
                        {
                            RenderTodos(column, allTodos, sharedTodos);
                        }
                    });

                // Футер
                page.Footer()
                    .AlignCenter()
                    .Text(x =>
                    {
                        x.Span("Page ");
                        x.CurrentPageNumber();
                        x.Span(" of ");
                        x.TotalPages();
                    });
            });
        });

        return document.GeneratePdf();
    }

    private void RenderTripInfo(ColumnDescriptor column, TripDto trip, List<TripUserDto> participants)
    {

        var currentParticipant = participants.FirstOrDefault(u => u.Email.Equals(this._currentUser.Email, StringComparison.CurrentCultureIgnoreCase));

        column.Item()
            .Text("Trip Information")
            .SemiBold()
            .FontSize(16)
            .FontColor(primaryColor);

        column.Item().PaddingTop(5).Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.ConstantColumn(120);
                columns.RelativeColumn();
            });

            AddInfoRow(table, "Name:", trip.Name);
            AddInfoRow(table, "Status:", trip.TripStatus);
            
            if (trip.StartDate.HasValue)
                AddInfoRow(table, "Start Date:", trip.StartDate.Value.ToString("dd.MM.yyyy"));
            
            if (trip.EndDate.HasValue)
                AddInfoRow(table, "End Date:", trip.EndDate.Value.ToString("dd.MM.yyyy"));
            
            var d = DateUtils.DurationStr(trip.StartDate, trip.EndDate);

            AddInfoRow(table, "Total Days:", d);
            AddInfoRow(table, "Participants:", trip.TotalParticipants.ToString());
            // AddInfoRow(table, "Bags:", trip.UserStats.TotalPacks.ToString());
            // AddInfoRow(table, "Items:", trip.UserStats.TotalThings.ToString());
            if (currentParticipant != null)
            {
                AddInfoRow(table, "Your Bags:", currentParticipant.TotalPacks.ToString());
                AddInfoRow(table, "Your Items:", currentParticipant.TotalThings.ToString());
                AddInfoRow(table, "Your Todos:", currentParticipant.TotalTodos.ToString());
            }
            AddInfoRow(table, "Shared Items:", trip.TotalSharedThings.ToString());
            AddInfoRow(table, "Shared Todos:", trip.TotalSharedTodos.ToString());

            if (!string.IsNullOrWhiteSpace(trip.Notes))
            {
                AddInfoRow(table, "Notes:", trip.Notes);
            }
        });
    }

    private void AddInfoRow(TableDescriptor table, string label, string value)
    {
        table.Cell().Element(LabelStyle).Text(label);
        table.Cell().Element(ValueStyle).Text(value);

        static IContainer LabelStyle(IContainer container)
        {
            return container
                .PaddingVertical(3)
                .PaddingRight(10)
                .DefaultTextStyle(x => x.SemiBold());
        }

        static IContainer ValueStyle(IContainer container)
        {
            return container.PaddingVertical(3);
        }
    }

    private void RenderParticipants(ColumnDescriptor column, List<TripUserDto> participants)
    {
        column.Item().PaddingTop(10)
            .Text("Participants")
            .SemiBold()
            .FontSize(16)
            .FontColor(primaryColor);

        column.Item().PaddingTop(5).Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.RelativeColumn(3);
                columns.RelativeColumn(2);
                // columns.ConstantColumn(80);
                // columns.ConstantColumn(80);
            });

            // Заголовок
            table.Header(header =>
            {
                header.Cell().Element(HeaderStyle).Text("Name");
                header.Cell().Element(HeaderStyle).Text("Email");
                // header.Cell().Element(HeaderStyle).AlignCenter().Text("Bags");
                // header.Cell().Element(HeaderStyle).AlignCenter().Text("Items");

                static IContainer HeaderStyle(IContainer container)
                {
                    return container
                        .DefaultTextStyle(x => x.SemiBold())
                        .PaddingVertical(5)
                        .BorderBottom(1)
                        .BorderColor(Colors.Grey.Darken2);
                }
            });

            foreach (var participant in participants)
            {
                var fullName = $"{participant.FirstName} {participant.LastName}".Trim();
                if (string.IsNullOrWhiteSpace(fullName))
                    fullName = "N/A";

                table.Cell().Element(CellStyle).Text(fullName);
                table.Cell().Element(CellStyle).Text(participant.Email);
                // table.Cell().Element(CellStyle).AlignCenter().Text(participant.TotalPacks.ToString());
                // table.Cell().Element(CellStyle).AlignCenter().Text(participant.TotalThings.ToString());

                static IContainer CellStyle(IContainer container)
                {
                    return container
                        .BorderBottom(1)
                        .BorderColor(Colors.Grey.Lighten2)
                        .PaddingVertical(5);
                }
            }
        });
    }

    private void RenderPackagesWithThings(ColumnDescriptor column, List<TripPackageDto> packages, List<TripThingDto> allThings)
    {
        column.Item().PaddingTop(10)
            .Text("Bags and Items")
            .SemiBold()
            .FontSize(16)
            .FontColor(primaryColor);

        foreach (var package in packages)
        {
            column.Item().PaddingTop(10).Column(packageColumn =>
            {
                // Название упаковки
                packageColumn.Item().Background(Colors.Grey.Lighten3)
                    .Padding(8)
                    .Text(text =>
                    {
                        text.Span(package.Name).SemiBold().FontSize(13);
                        if (!string.IsNullOrWhiteSpace(package.Label))
                        {
                            text.Span($" ({package.Label})").FontColor(Colors.Grey.Darken1);
                        }
                    });

                // Вещи в упаковке, сгруппированные по категориям
                var thingsInPackage = allThings
                    .Where(t => t.TripUserPackageId == package.Id)
                    .ToList();

                packageColumn.Item().PaddingTop(5).PaddingLeft(15).Column(thingsColumn =>
                {
                    RenderThingsByCategory(thingsColumn, thingsInPackage);
                });
            });
        }

        // Вещи без упаковки
        var thingsWithoutPackage = allThings
            .Where(t => !t.TripUserPackageId.HasValue)
            .ToList();

        if (thingsWithoutPackage.Any())
        {
            column.Item().PaddingTop(10).Column(unpackedColumn =>
            {
                unpackedColumn.Item().Background(Colors.Grey.Lighten3)
                    .Padding(8)
                    .Text("Items without Bag")
                    .SemiBold()
                    .FontSize(13);

                unpackedColumn.Item().PaddingTop(5).PaddingLeft(15).Column(thingsColumn =>
                {
                    RenderThingsByCategory(thingsColumn, thingsWithoutPackage);
                });
            });
        }
    }

    // Общий метод для рендеринга вещей по категориям
    private void RenderThingsByCategory(ColumnDescriptor column, List<TripThingDto> things)
    {
        if (!things.Any())
        {
            column.Item()
                .Text("No items in this bag")
                .FontColor(Colors.Grey.Medium)
                .Italic();
            return;
        }

        var thingsByCategory = things
            .GroupBy(t => t.Category ?? "Uncategorized")
            .OrderBy(g => g.Key);

        foreach (var categoryGroup in thingsByCategory)
        {
            // Категория
            column.Item().PaddingTop(5)
                .Text(categoryGroup.Key)
                .SemiBold()
                .FontSize(11)
                .FontColor(primaryColor);

            // Вещи в категории
            column.Item().PaddingLeft(10).PaddingTop(3).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn();
                    columns.ConstantColumn(100);
                });

                foreach (var thing in categoryGroup.OrderBy(t => t.Name))
                {
                    // Имя вещи слева
                    table.Cell()
                        .PaddingVertical(2)
                        .Text(thing.Name);

                    // Количество и единицы справа
                    table.Cell()
                        .PaddingVertical(2)
                        .AlignRight()
                        .Text(text =>
                        {
                            if (thing.Value.HasValue && !string.IsNullOrWhiteSpace(thing.Units))
                            {
                                text.Span($"{thing.Value.Value:0.###} {thing.Units}");
                            }
                            else if (thing.Value.HasValue)
                            {
                                text.Span($"{thing.Value.Value:0.###}");
                            }
                            else if (!string.IsNullOrWhiteSpace(thing.Units))
                            {
                                text.Span(thing.Units);
                            }
                        });
                }
            });
        }
    }

    private void RenderTodos(ColumnDescriptor column, List<TripTodoDto> todos, List<TripSharedTodoDto> sharedTodos)
    {
        column.Item().PaddingTop(10)
            .Text("Todos")
            .SemiBold()
            .FontSize(16)
            .FontColor(primaryColor);

        if (todos.Any())
        {
            List<(string Category, string Name, string? Status, string? Notes)> todoRows = todos.Select(t => (
                Category: t.Category ?? "Uncategorized",
                Name: t.Name,
                Status: t.Finished,
                Notes: t.Notes)).ToList();

            column.Item().PaddingTop(5).Column(todoColumn =>
            {
                todoColumn.Item().Text("Your Todos").SemiBold().FontSize(13);
                RenderTodoRows(todoColumn, todoRows);
            });
        }

        if (sharedTodos.Any())
        {
            List<(string Category, string Name, string? Status, string? Notes)> sharedTodoRows = sharedTodos.Select(t =>
            {
                var assignedTo = string.Join(" ", new[] { t.AssigneeFirstName, t.AssigneeLastName }.Where(x => !string.IsNullOrWhiteSpace(x))).Trim();
                if (string.IsNullOrWhiteSpace(assignedTo))
                {
                    assignedTo = t.AssigneeEmail ?? "Unassigned";
                }

                string? notes = t.IsTargeted ? $"Assigned to {assignedTo}" : "Not assigned";
                return (
                    Category: t.Category ?? "Uncategorized",
                    Name: t.Name,
                    Status: t.AssigneeFinished,
                    Notes: (string?)notes);
            }).ToList();

            column.Item().PaddingTop(10).Column(todoColumn =>
            {
                todoColumn.Item().Text("Shared Todos").SemiBold().FontSize(13);
                RenderTodoRows(todoColumn, sharedTodoRows);
            });
        }
    }

    private void RenderTodoRows(ColumnDescriptor column, List<(string Category, string Name, string? Status, string? Notes)> todos)
    {
        var todosByCategory = todos
            .GroupBy(t => t.Category)
            .OrderBy(g => g.Key);

        foreach (var categoryGroup in todosByCategory)
        {
            column.Item().PaddingTop(5)
                .Text(categoryGroup.Key)
                .SemiBold()
                .FontSize(11)
                .FontColor(primaryColor);

            column.Item().PaddingLeft(10).PaddingTop(3).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn();
                    columns.ConstantColumn(110);
                });

                foreach (var todo in categoryGroup.OrderBy(t => t.Name))
                {
                    table.Cell().PaddingVertical(2).Text(text =>
                    {
                        text.Span(todo.Name);
                        if (!string.IsNullOrWhiteSpace(todo.Notes))
                        {
                            text.Span($" ({todo.Notes})").FontColor(Colors.Grey.Darken1);
                        }
                    });

                    table.Cell().PaddingVertical(2).AlignRight().Text(todo.Status ?? "pending");
                }
            });
        }
    }

    public async Task<byte[]> GenerateTripExpensesReportPdfAsync(Guid tripId)
    {
        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new UnauthorizedAccessException("User does not have access to this trip");
        }

        var trip = await _tripService.GetByIdWithStatsAsync(tripId);
        if (trip == null)
        {
            throw new Exception($"Trip with ID {tripId} not found");
        }

        var participants = (await _tripUserService.GetAllAsync(tripId)).OrderBy(x => GetParticipantName(x.FirstName, x.LastName, x.Email)).ToList();
        var personalExpenses = (await _tripExpenseService.GetAllForTripAsync(tripId)).ToList();
        var sharedExpenses = (await _tripSharedExpenseService.GetAllFullAsync(tripId)).ToList();

        var summaryByParticipant = participants.ToDictionary(x => x.Id, x => new ExpenseParticipantSummary
        {
            TripUserId = x.Id,
            ParticipantName = GetParticipantName(x.FirstName, x.LastName, x.Email)
        });

        foreach (var expense in personalExpenses)
        {
            if (!summaryByParticipant.TryGetValue(expense.TripUserId, out var summary))
            {
                continue;
            }

            var amount = decimal.Round(expense.AmountInTripCurrency, 2);

            if (expense.RecipientId.HasValue)
            {
                summary.TransfersGiven += amount;
                if (summaryByParticipant.TryGetValue(expense.RecipientId.Value, out var recipientSummary))
                {
                    recipientSummary.TransfersReceived += amount;
                }
                continue;
            }

            if (expense.TripSharedExpenseId.HasValue)
            {
                summary.SharedPaid += amount;
                continue;
            }

            summary.PersonalTotal += amount;
        }

        var participantIds = participants.Select(x => x.Id).ToList();
        foreach (var acceptedSharedExpense in personalExpenses.Where(x => x.TripSharedExpenseId.HasValue && participantIds.Count > 0))
        {
            foreach (var split in SplitAmount(acceptedSharedExpense.AmountInTripCurrency, participantIds))
            {
                summaryByParticipant[split.TripUserId].SharedShare += split.Amount;
            }
        }

        var summaries = summaryByParticipant.Values
            .Select(x =>
            {
                x.PersonalTotal = decimal.Round(x.PersonalTotal, 2);
                x.TransfersGiven = decimal.Round(x.TransfersGiven, 2);
                x.TransfersReceived = decimal.Round(x.TransfersReceived, 2);
                x.SharedPaid = decimal.Round(x.SharedPaid, 2);
                x.SharedShare = decimal.Round(x.SharedShare, 2);
                x.NetBalance = decimal.Round(x.SharedPaid + x.TransfersGiven - x.TransfersReceived - x.SharedShare, 2);
                return x;
            })
            .OrderBy(x => x.ParticipantName)
            .ToList();

        var settlements = BuildSettlements(summaries);
        var tripCurrency = trip.Currency ?? string.Empty;

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Column(column =>
                {
                    column.Item().Text("Plantour Trip Expenses Report").SemiBold().FontSize(22).FontColor(primaryColor);
                    column.Item().Text($"Trip: {trip.Name}").FontSize(11);
                    column.Item().Text($"Generated: {DateTime.Now:dd.MM.yyyy HH:mm}").FontSize(9).FontColor(Colors.Grey.Darken1);
                });

                page.Content().PaddingVertical(1, Unit.Centimetre).Column(column =>
                {
                    column.Spacing(14);
                    column.Item().Text($"Trip currency: {trip.Currency ?? "Not specified"}").FontSize(11);

                    RenderExpenseSummary(column, summaries);
                    RenderSettlements(column, settlements, tripCurrency);
                    RenderPersonalExpenses(column, personalExpenses, tripCurrency);
                    RenderSharedExpenses(column, sharedExpenses, tripCurrency);
                });

                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Page ");
                    x.CurrentPageNumber();
                    x.Span(" of ");
                    x.TotalPages();
                });
            });
        });

        return document.GeneratePdf();
    }

    private void RenderExpenseSummary(ColumnDescriptor column, List<ExpenseParticipantSummary> summaries)
    {
        column.Item().Text("Expense Summary").SemiBold().FontSize(16).FontColor(primaryColor);
        column.Item().Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.RelativeColumn(3);
                columns.RelativeColumn(2);
                columns.RelativeColumn(2);
                columns.RelativeColumn(2);
                columns.RelativeColumn(2);
                columns.RelativeColumn(2);
            });

            table.Header(header =>
            {
                header.Cell().Element(ExpenseCellStyle).Text("Participant").SemiBold();
                header.Cell().Element(ExpenseCellStyle).Text("Personal").SemiBold();
                header.Cell().Element(ExpenseCellStyle).Text("Transfers +").SemiBold();
                header.Cell().Element(ExpenseCellStyle).Text("Transfers -").SemiBold();
                header.Cell().Element(ExpenseCellStyle).Text("Shared paid/share").SemiBold();
                header.Cell().Element(ExpenseCellStyle).Text("Net").SemiBold();
            });

            foreach (var item in summaries)
            {
                table.Cell().Element(ExpenseCellStyle).Text(item.ParticipantName);
                table.Cell().Element(ExpenseCellStyle).Text(item.PersonalTotal.ToString("0.00"));
                table.Cell().Element(ExpenseCellStyle).Text(item.TransfersGiven.ToString("0.00"));
                table.Cell().Element(ExpenseCellStyle).Text(item.TransfersReceived.ToString("0.00"));
                table.Cell().Element(ExpenseCellStyle).Text($"{item.SharedPaid:0.00} / {item.SharedShare:0.00}");
                table.Cell().Element(ExpenseCellStyle).Text(item.NetBalance.ToString("0.00"));
            }
        });
    }

    private void RenderSettlements(ColumnDescriptor column, List<ExpenseSettlementLine> settlements, string currency)
    {
        column.Item().Text("Who Owes What To Whom").SemiBold().FontSize(16).FontColor(primaryColor);

        if (settlements.Count == 0)
        {
            column.Item().Text("No balances need to be settled.");
            return;
        }

        column.Item().Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.RelativeColumn(3);
                columns.RelativeColumn(3);
                columns.RelativeColumn(2);
            });

            table.Header(header =>
            {
                header.Cell().Element(ExpenseCellStyle).Text("Payer").SemiBold();
                header.Cell().Element(ExpenseCellStyle).Text("Receiver").SemiBold();
                header.Cell().Element(ExpenseCellStyle).Text(string.IsNullOrWhiteSpace(currency) ? "Amount" : currency).SemiBold();
            });

            foreach (var line in settlements)
            {
                table.Cell().Element(ExpenseCellStyle).Text(line.FromParticipant);
                table.Cell().Element(ExpenseCellStyle).Text(line.ToParticipant);
                table.Cell().Element(ExpenseCellStyle).Text(line.Amount.ToString("0.00"));
            }
        });
    }

    private void RenderPersonalExpenses(ColumnDescriptor column, List<TripExpenseDto> personalExpenses, string tripCurrency)
    {
        column.Item().Text("Personal Expenses And Transfers").SemiBold().FontSize(16).FontColor(primaryColor);

        if (personalExpenses.Count == 0)
        {
            column.Item().Text("No personal expenses found.");
            return;
        }

        column.Item().Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.RelativeColumn(3);
                columns.RelativeColumn(3);
                columns.RelativeColumn(2);
                columns.RelativeColumn(2);
                columns.RelativeColumn(3);
            });

            table.Header(header =>
            {
                header.Cell().Element(ExpenseCellStyle).Text("Participant").SemiBold();
                header.Cell().Element(ExpenseCellStyle).Text("Expense").SemiBold();
                header.Cell().Element(ExpenseCellStyle).Text("Original").SemiBold();
                header.Cell().Element(ExpenseCellStyle).Text(string.IsNullOrWhiteSpace(tripCurrency) ? "Trip" : tripCurrency).SemiBold();
                header.Cell().Element(ExpenseCellStyle).Text("Type").SemiBold();
            });

            foreach (var expense in personalExpenses.OrderBy(x => GetParticipantName(x.UserFirstName, x.UserLastName, x.UserEmail)).ThenBy(x => x.Name))
            {
                var type = expense.RecipientId.HasValue
                    ? $"Transfer to {GetParticipantName(expense.RecipientFirstName, expense.RecipientLastName, expense.RecipientEmail)}"
                    : expense.TripSharedExpenseId.HasValue
                        ? "Accepted shared expense"
                        : "Personal expense";

                table.Cell().Element(ExpenseCellStyle).Text(GetParticipantName(expense.UserFirstName, expense.UserLastName, expense.UserEmail));
                table.Cell().Element(ExpenseCellStyle).Text(expense.Name);
                table.Cell().Element(ExpenseCellStyle).Text($"{expense.Amount:0.00} {expense.EffectiveCurrency}");
                table.Cell().Element(ExpenseCellStyle).Text(expense.AmountInTripCurrency.ToString("0.00"));
                table.Cell().Element(ExpenseCellStyle).Text(type);
            }
        });
    }

    private void RenderSharedExpenses(ColumnDescriptor column, List<TripSharedExpenseDto> sharedExpenses, string tripCurrency)
    {
        column.Item().Text("Shared Expenses").SemiBold().FontSize(16).FontColor(primaryColor);

        if (sharedExpenses.Count == 0)
        {
            column.Item().Text("No shared expenses found.");
            return;
        }

        column.Item().Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.RelativeColumn(3);
                columns.RelativeColumn(2);
                columns.RelativeColumn(2);
                columns.RelativeColumn(3);
                columns.RelativeColumn(3);
            });

            table.Header(header =>
            {
                header.Cell().Element(ExpenseCellStyle).Text("Expense").SemiBold();
                header.Cell().Element(ExpenseCellStyle).Text("Original").SemiBold();
                header.Cell().Element(ExpenseCellStyle).Text(string.IsNullOrWhiteSpace(tripCurrency) ? "Trip" : tripCurrency).SemiBold();
                header.Cell().Element(ExpenseCellStyle).Text("Assignee").SemiBold();
                header.Cell().Element(ExpenseCellStyle).Text("Status").SemiBold();
            });

            foreach (var expense in sharedExpenses.OrderBy(x => x.Name))
            {
                var assignee = expense.AssignedToId.HasValue
                    ? GetParticipantName(expense.AssigneeFirstName, expense.AssigneeLastName, expense.AssigneeEmail)
                    : "-";

                var status = expense.AssignedExpenseId.HasValue
                    ? "Accepted"
                    : expense.Rejected
                        ? "Rejected"
                        : expense.AssignedToId.HasValue
                            ? "Assigned"
                            : "Awaiting assignment";

                table.Cell().Element(ExpenseCellStyle).Text(expense.Name);
                table.Cell().Element(ExpenseCellStyle).Text($"{expense.Amount:0.00} {expense.EffectiveCurrency}");
                table.Cell().Element(ExpenseCellStyle).Text(expense.AmountInTripCurrency?.ToString("0.00") ?? "-");
                table.Cell().Element(ExpenseCellStyle).Text(assignee);
                table.Cell().Element(ExpenseCellStyle).Text(status);
            }
        });
    }

    private static IContainer ExpenseCellStyle(IContainer container)
    {
        return container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(4).PaddingRight(6);
    }

    private static string GetParticipantName(string? firstName, string? lastName, string? email)
    {
        var name = string.Join(" ", new[] { firstName, lastName }.Where(x => !string.IsNullOrWhiteSpace(x))).Trim();
        return string.IsNullOrWhiteSpace(name) ? (email ?? "Unknown") : name;
    }

    private static List<ExpenseSplitAmount> SplitAmount(decimal totalAmount, List<Guid> participantIds)
    {
        var totalCents = (int)decimal.Round(totalAmount * 100m, MidpointRounding.AwayFromZero);
        var baseCents = totalCents / participantIds.Count;
        var remainder = totalCents % participantIds.Count;
        var result = new List<ExpenseSplitAmount>(participantIds.Count);

        for (var index = 0; index < participantIds.Count; index++)
        {
            var cents = baseCents + (index < remainder ? 1 : 0);
            result.Add(new ExpenseSplitAmount(participantIds[index], cents / 100m));
        }

        return result;
    }

    private static List<ExpenseSettlementLine> BuildSettlements(List<ExpenseParticipantSummary> summaries)
    {
        var creditors = summaries
            .Where(x => x.NetBalance > 0)
            .Select(x => new ExpenseBalanceNode(x.ParticipantName, x.NetBalance))
            .OrderByDescending(x => x.Amount)
            .ToList();

        var debtors = summaries
            .Where(x => x.NetBalance < 0)
            .Select(x => new ExpenseBalanceNode(x.ParticipantName, decimal.Abs(x.NetBalance)))
            .OrderByDescending(x => x.Amount)
            .ToList();

        var result = new List<ExpenseSettlementLine>();
        var creditorIndex = 0;
        var debtorIndex = 0;

        while (creditorIndex < creditors.Count && debtorIndex < debtors.Count)
        {
            var creditor = creditors[creditorIndex];
            var debtor = debtors[debtorIndex];
            var amount = decimal.Round(decimal.Min(creditor.Amount, debtor.Amount), 2);

            if (amount > 0)
            {
                result.Add(new ExpenseSettlementLine(debtor.ParticipantName, creditor.ParticipantName, amount));
            }

            creditor.Amount = decimal.Round(creditor.Amount - amount, 2);
            debtor.Amount = decimal.Round(debtor.Amount - amount, 2);

            if (creditor.Amount <= 0)
            {
                creditorIndex++;
            }

            if (debtor.Amount <= 0)
            {
                debtorIndex++;
            }
        }

        return result;
    }

    private sealed class ExpenseParticipantSummary
    {
        public Guid TripUserId { get; set; }
        public string ParticipantName { get; set; } = string.Empty;
        public decimal PersonalTotal { get; set; }
        public decimal TransfersGiven { get; set; }
        public decimal TransfersReceived { get; set; }
        public decimal SharedPaid { get; set; }
        public decimal SharedShare { get; set; }
        public decimal NetBalance { get; set; }
    }

    private sealed class ExpenseSplitAmount(Guid tripUserId, decimal amount)
    {
        public Guid TripUserId { get; } = tripUserId;
        public decimal Amount { get; } = amount;
    }

    private sealed class ExpenseBalanceNode(string participantName, decimal amount)
    {
        public string ParticipantName { get; } = participantName;
        public decimal Amount { get; set; } = amount;
    }

    private sealed class ExpenseSettlementLine(string fromParticipant, string toParticipant, decimal amount)
    {
        public string FromParticipant { get; } = fromParticipant;
        public string ToParticipant { get; } = toParticipant;
        public decimal Amount { get; } = amount;
    }

    public async Task<byte[]> GeneratePackingListPdfAsync(Guid tripId, Guid packageId)
    {
        // Проверяем доступ к путешествию
        var trip = await _tripService.GetByIdWithStatsAsync(tripId);
        if (trip == null)
        {
            throw new Exception($"Trip with ID {tripId} not found");
        }

        // Получаем упаковку
        var package = await _tripPackageService.GetByIdAsync(tripId, packageId);
        if (package == null)
        {
            throw new Exception($"Bag with ID {packageId} not found");
        }

        // Получаем вещи для этой упаковки
        var things = (await _tripThingService.GetAllForPackageAsync(tripId, packageId)).ToList();

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(11));

                // Шапка
                page.Header()
                    .Column(column =>
                    {
                        column.Item()
                            .Text("Packing List")
                            .SemiBold()
                            .FontSize(24)
                            .FontColor(primaryColor);
                        
                        column.Item().PaddingTop(5)
                            .Text(text =>
                            {
                                text.Span(package.Name).SemiBold().FontSize(16);
                                if (!string.IsNullOrWhiteSpace(package.Label))
                                {
                                    text.Span($" ({package.Label})").FontSize(14).FontColor(Colors.Grey.Darken1);
                                }
                            });

                        column.Item().PaddingTop(3)
                            .Text($"Total items: {things.Count}")
                            .FontSize(12)
                            .FontColor(Colors.Grey.Darken2);

                        column.Item().PaddingTop(2)
                            .Text($"Generated: {DateTime.Now:dd.MM.yyyy HH:mm}")
                            .FontSize(9)
                            .FontColor(Colors.Grey.Darken1);
                    });

                // Содержимое
                page.Content()
                    .PaddingVertical(1, Unit.Centimetre)
                    .Column(column =>
                    {
                        // Дополнительная информация об упаковке
                        if (!string.IsNullOrWhiteSpace(package.Notes) || 
                            (package.WeightValue.HasValue && !string.IsNullOrWhiteSpace(package.WeightUnit)))
                        {
                            column.Item().PaddingBottom(15).Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.ConstantColumn(100);
                                    columns.RelativeColumn();
                                });

                                if (package.WeightValue.HasValue && !string.IsNullOrWhiteSpace(package.WeightUnit))
                                {
                                    table.Cell()
                                        .PaddingVertical(3)
                                        .DefaultTextStyle(x => x.SemiBold())
                                        .Text("Weight:");
                                    
                                    table.Cell()
                                        .PaddingVertical(3)
                                        .Text($"{package.WeightValue.Value:0.###} {package.WeightUnit}");
                                }

                                if (!string.IsNullOrWhiteSpace(package.Notes))
                                {
                                    table.Cell()
                                        .PaddingVertical(3)
                                        .DefaultTextStyle(x => x.SemiBold())
                                        .Text("Notes:");
                                    
                                    table.Cell()
                                        .PaddingVertical(3)
                                        .Text(package.Notes);
                                }
                            });
                        }

                        // Список вещей по категориям
                        RenderThingsByCategory(column, things);
                    });

                // Футер
                page.Footer()
                    .AlignCenter()
                    .Text(x =>
                    {
                        x.Span("Page ");
                        x.CurrentPageNumber();
                        x.Span(" of ");
                        x.TotalPages();
                    });
            });
        });

        return document.GeneratePdf();
    }

    public async Task<byte[]> GenerateTripNotesPdfAsync(Guid tripId, Guid[] ids)
    {
        if (!await _checkAccessService.CurrentUserHasAccessToTripAsync(tripId))
        {
            throw new UnauthorizedAccessException("User does not have access to this trip");
        }

        var distinctIds = ids
            .Where(x => x != Guid.Empty)
            .Distinct()
            .ToArray();

        if (distinctIds.Length == 0)
        {
            throw new InvalidOperationException("At least one note must be selected");
        }

        var trip = await _tripService.GetByIdWithStatsAsync(tripId);
        if (trip == null)
        {
            throw new Exception($"Trip with ID {tripId} not found");
        }

        var notes = await _tripNoteRepository.GetByIdsAsync(_currentUser.AdminId, _currentUser.UserId, tripId, distinctIds);
        if (notes.Count != distinctIds.Length)
        {
            throw new InvalidOperationException("One or more selected notes could not be loaded");
        }

        var noteBlocks = notes.ToDictionary(x => x.Id, x => ParseTripNoteBlocks(x.ContentJson));
        var imageUrlMap = noteBlocks.ToDictionary(
            x => x.Key,
            x => x.Value.SelectMany(GetImageUrls).Distinct(StringComparer.OrdinalIgnoreCase).ToList());

        var imageBytes = await DownloadImagesAsync(imageUrlMap.SelectMany(x => x.Value).Distinct(StringComparer.OrdinalIgnoreCase));

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(11));

                page.Header()
                    .Column(column =>
                    {
                        column.Item()
                            .Text("Plantour Trip Notes")
                            .SemiBold()
                            .FontSize(24)
                            .FontColor(primaryColor);
                        column.Item()
                            .Text($"{trip.Name} · Generated: {DateTime.Now:dd.MM.yyyy HH:mm}")
                            .FontSize(9)
                            .FontColor(Colors.Grey.Darken1);
                    });

                page.Content()
                    .PaddingVertical(1, Unit.Centimetre)
                    .Column(column =>
                    {
                        column.Spacing(18);

                        foreach (var note in notes)
                        {
                            column.Item().Column(noteColumn =>
                            {
                                noteColumn.Spacing(6);
                                noteColumn.Item().Text(note.Title).SemiBold().FontSize(16).FontColor(primaryColor);

                                var metaParts = new List<string>();
                                if (note.TripActivity != null)
                                {
                                    metaParts.Add($"Activity: {note.TripActivity.Name}");
                                }

                                if (note.CreatedAt.HasValue)
                                {
                                    metaParts.Add($"Created: {note.CreatedAt.Value:dd.MM.yyyy HH:mm}");
                                }

                                if (metaParts.Count > 0)
                                {
                                    noteColumn.Item().Text(string.Join(" · ", metaParts)).FontSize(9).FontColor(Colors.Grey.Darken1);
                                }

                                var blocks = noteBlocks[note.Id];
                                if (blocks.Count == 0)
                                {
                                    noteColumn.Item().Text("No note content").Italic().FontColor(Colors.Grey.Medium);
                                }
                                else
                                {
                                    foreach (var block in blocks)
                                    {
                                        RenderTripNoteBlock(noteColumn, block, imageBytes, 0);
                                    }
                                }

                                noteColumn.Item().PaddingTop(8).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                            });
                        }
                    });

                page.Footer()
                    .AlignCenter()
                    .Text(x =>
                    {
                        x.Span("Page ");
                        x.CurrentPageNumber();
                        x.Span(" of ");
                        x.TotalPages();
                    });
            });
        });

        return document.GeneratePdf();
    }

    private static List<TripNotePdfBlock> ParseTripNoteBlocks(string? contentJson)
    {
        if (string.IsNullOrWhiteSpace(contentJson))
        {
            return [];
        }

        try
        {
            using var document = JsonDocument.Parse(contentJson);
            return ParseTripNoteNode(document.RootElement);
        }
        catch (JsonException)
        {
            return [];
        }
    }

    private static List<TripNotePdfBlock> ParseTripNoteNode(JsonElement node)
    {
        var type = GetNodeType(node);

        return type switch
        {
            "doc" => ParseChildren(node),
            "paragraph" => ParseParagraphNode(node),
            "heading" => ParseHeadingNode(node),
            "bulletList" => [new TripNotePdfBlock("bulletList", Children: ParseListItems(node))],
            "orderedList" => [new TripNotePdfBlock("orderedList", Children: ParseListItems(node))],
            "blockquote" => ParseContainerNode(node, "blockquote"),
            "codeBlock" => ParseContainerNode(node, "codeBlock"),
            "image" => TryCreateImageBlock(node) is { } imageBlock ? [imageBlock] : [],
            _ => ParseChildren(node),
        };
    }

    private static List<TripNotePdfBlock> ParseChildren(JsonElement node)
    {
        var blocks = new List<TripNotePdfBlock>();
        if (!node.TryGetProperty("content", out var content) || content.ValueKind != JsonValueKind.Array)
        {
            return blocks;
        }

        foreach (var child in content.EnumerateArray())
        {
            blocks.AddRange(ParseTripNoteNode(child));
        }

        return blocks;
    }

    private static List<TripNotePdfBlock> ParseParagraphNode(JsonElement node)
    {
        var result = ParseInlineContent(node);
        var blocks = new List<TripNotePdfBlock>();

        if (result.Inlines.Count > 0)
        {
            blocks.Add(new TripNotePdfBlock("paragraph", Inlines: result.Inlines));
        }

        blocks.AddRange(result.ImageBlocks);
        return blocks;
    }

    private static List<TripNotePdfBlock> ParseHeadingNode(JsonElement node)
    {
        var result = ParseInlineContent(node);
        var blocks = new List<TripNotePdfBlock>();
        var level = 2;

        if (node.TryGetProperty("attrs", out var attrs) &&
            attrs.TryGetProperty("level", out var levelProp) &&
            levelProp.ValueKind == JsonValueKind.Number &&
            levelProp.TryGetInt32(out var parsedLevel))
        {
            level = parsedLevel;
        }

        if (result.Inlines.Count > 0)
        {
            blocks.Add(new TripNotePdfBlock("heading", Level: level, Inlines: result.Inlines));
        }

        blocks.AddRange(result.ImageBlocks);
        return blocks;
    }

    private static List<TripNotePdfBlock> ParseContainerNode(JsonElement node, string type)
    {
        var children = ParseChildren(node);
        return children.Count > 0 ? [new TripNotePdfBlock(type, Children: children)] : [];
    }

    private static List<TripNotePdfBlock> ParseListItems(JsonElement node)
    {
        var items = new List<TripNotePdfBlock>();
        if (!node.TryGetProperty("content", out var content) || content.ValueKind != JsonValueKind.Array)
        {
            return items;
        }

        foreach (var child in content.EnumerateArray())
        {
            if (GetNodeType(child) != "listItem")
            {
                continue;
            }

            var childBlocks = ParseChildren(child);
            if (childBlocks.Count > 0)
            {
                items.Add(new TripNotePdfBlock("listItem", Children: childBlocks));
            }
        }

        return items;
    }

    private static InlineParseResult ParseInlineContent(JsonElement node)
    {
        var inlines = new List<TripNotePdfInline>();
        var imageBlocks = new List<TripNotePdfBlock>();

        if (!node.TryGetProperty("content", out var content) || content.ValueKind != JsonValueKind.Array)
        {
            return new InlineParseResult(inlines, imageBlocks);
        }

        foreach (var child in content.EnumerateArray())
        {
            var type = GetNodeType(child);

            if (type == "text")
            {
                var text = child.TryGetProperty("text", out var textProp) ? textProp.GetString() : null;
                if (string.IsNullOrEmpty(text))
                {
                    continue;
                }

                var inline = BuildInline(text, child);
                inlines.Add(inline);

                if (!string.IsNullOrWhiteSpace(inline.LinkUrl) && IsSupportedImageUrl(inline.LinkUrl))
                {
                    imageBlocks.Add(new TripNotePdfBlock("image", Url: inline.LinkUrl));
                }

                continue;
            }

            if (type == "hardBreak")
            {
                inlines.Add(new TripNotePdfInline("\n"));
                continue;
            }

            if (type == "image" && TryCreateImageBlock(child) is { } imageBlock)
            {
                imageBlocks.Add(imageBlock);
            }
        }

        return new InlineParseResult(inlines, imageBlocks);
    }

    private static TripNotePdfInline BuildInline(string text, JsonElement node)
    {
        var inline = new TripNotePdfInline(text);
        if (!node.TryGetProperty("marks", out var marks) || marks.ValueKind != JsonValueKind.Array)
        {
            return inline;
        }

        foreach (var mark in marks.EnumerateArray())
        {
            var type = GetNodeType(mark);
            switch (type)
            {
                case "bold":
                    inline = inline with { Bold = true };
                    break;
                case "italic":
                    inline = inline with { Italic = true };
                    break;
                case "underline":
                    inline = inline with { Underline = true };
                    break;
                case "strike":
                    inline = inline with { Strike = true };
                    break;
                case "code":
                    inline = inline with { Code = true };
                    break;
                case "link":
                    if (mark.TryGetProperty("attrs", out var attrs) && attrs.TryGetProperty("href", out var href) && href.ValueKind == JsonValueKind.String)
                    {
                        inline = inline with { LinkUrl = href.GetString() };
                    }
                    break;
            }
        }

        return inline;
    }

    private static TripNotePdfBlock? TryCreateImageBlock(JsonElement node)
    {
        if (!node.TryGetProperty("attrs", out var attrs) ||
            !attrs.TryGetProperty("src", out var src) ||
            src.ValueKind != JsonValueKind.String)
        {
            return null;
        }

        var url = src.GetString();
        return IsSupportedImageUrl(url) ? new TripNotePdfBlock("image", Url: url) : null;
    }

    private static string GetNodeType(JsonElement node)
    {
        return node.TryGetProperty("type", out var type) && type.ValueKind == JsonValueKind.String
            ? type.GetString() ?? string.Empty
            : string.Empty;
    }

    private static IEnumerable<string> GetImageUrls(TripNotePdfBlock block)
    {
        if (!string.IsNullOrWhiteSpace(block.Url) && block.Type == "image")
        {
            yield return block.Url;
        }

        if (block.Children == null)
        {
            yield break;
        }

        foreach (var child in block.Children)
        {
            foreach (var url in GetImageUrls(child))
            {
                yield return url;
            }
        }
    }

    private async Task<Dictionary<string, byte[]>> DownloadImagesAsync(IEnumerable<string> urls)
    {
        var client = _httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(15);

        var result = new Dictionary<string, byte[]>(StringComparer.OrdinalIgnoreCase);
        foreach (var url in urls)
        {
            if (DropboxService.IsDropboxSharedLink(url))
            {
                var dropboxImage = await _dropboxService.TryDownloadImageBySharedLinkAsync(url);
                if (dropboxImage != null && dropboxImage.Bytes.Length > 0)
                {
                    result[url] = dropboxImage.Bytes;
                }

                continue;
            }

            if (!IsSupportedImageUrl(url))
            {
                continue;
            }

            try
            {
                var bytes = await client.GetByteArrayAsync(url);
                if (bytes.Length > 0)
                {
                    result[url] = bytes;
                }
            }
            catch
            {
                // Ignore image download failures and keep the rest of the PDF renderable.
            }
        }

        return result;
    }

    private static bool IsSupportedImageUrl(string? value)
    {
        if (DropboxService.IsDropboxSharedLink(value))
        {
            return true;
        }

        if (string.IsNullOrWhiteSpace(value) || !Uri.TryCreate(value, UriKind.Absolute, out var uri))
        {
            return false;
        }

        if (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)
        {
            return false;
        }

        var path = uri.AbsolutePath;
        return path.EndsWith(".png", StringComparison.OrdinalIgnoreCase)
            || path.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase)
            || path.EndsWith(".jpeg", StringComparison.OrdinalIgnoreCase)
            || path.EndsWith(".gif", StringComparison.OrdinalIgnoreCase)
            || path.EndsWith(".webp", StringComparison.OrdinalIgnoreCase)
            || path.EndsWith(".bmp", StringComparison.OrdinalIgnoreCase)
            || path.EndsWith(".svg", StringComparison.OrdinalIgnoreCase);
    }

    private static void RenderTripNoteBlock(ColumnDescriptor column, TripNotePdfBlock block, IReadOnlyDictionary<string, byte[]> imageBytes, int indent)
    {
        switch (block.Type)
        {
            case "heading":
                column.Item().PaddingLeft(indent).Text(text =>
                {
                    text.DefaultTextStyle(x => x.FontSize(block.Level <= 2 ? 15 : 13).SemiBold());
                    RenderTripNoteInlines(text, block.Inlines);
                });
                return;
            case "paragraph":
                column.Item().PaddingLeft(indent).Text(text => RenderTripNoteInlines(text, block.Inlines));
                return;
            case "blockquote":
                column.Item().PaddingLeft(indent + 10).BorderLeft(3).BorderColor(Colors.Grey.Lighten1).PaddingLeft(8).Column(inner =>
                {
                    inner.Spacing(4);
                    foreach (var child in block.Children ?? [])
                    {
                        RenderTripNoteBlock(inner, child, imageBytes, 0);
                    }
                });
                return;
            case "codeBlock":
                column.Item().PaddingLeft(indent).Background(Colors.Grey.Lighten3).Padding(8).Column(inner =>
                {
                    foreach (var child in block.Children ?? [])
                    {
                        RenderTripNoteBlock(inner, child, imageBytes, 0);
                    }
                });
                return;
            case "bulletList":
                RenderTripNoteList(column, block.Children ?? [], imageBytes, indent, false);
                return;
            case "orderedList":
                RenderTripNoteList(column, block.Children ?? [], imageBytes, indent, true);
                return;
            case "image":
                if (!string.IsNullOrWhiteSpace(block.Url) && imageBytes.TryGetValue(block.Url, out var bytes))
                {
                    column.Item().PaddingLeft(indent).PaddingTop(4).Image(bytes).FitWidth();
                }
                return;
        }
    }

    private static void RenderTripNoteList(ColumnDescriptor column, IReadOnlyList<TripNotePdfBlock> items, IReadOnlyDictionary<string, byte[]> imageBytes, int indent, bool ordered)
    {
        for (var index = 0; index < items.Count; index++)
        {
            var item = items[index];
            var childBlocks = item.Children ?? [];
            if (childBlocks.Count == 0)
            {
                continue;
            }

            var firstBlock = childBlocks[0];
            if (firstBlock.Type == "paragraph" || firstBlock.Type == "heading")
            {
                var prefix = ordered ? $"{index + 1}. " : "• ";
                column.Item().PaddingLeft(indent).Text(text =>
                {
                    text.Span(prefix).SemiBold();
                    RenderTripNoteInlines(text, firstBlock.Inlines);
                });

                foreach (var child in childBlocks.Skip(1))
                {
                    RenderTripNoteBlock(column, child, imageBytes, indent + 18);
                }

                continue;
            }

            column.Item().PaddingLeft(indent).Text(ordered ? $"{index + 1}." : "•").SemiBold();
            foreach (var child in childBlocks)
            {
                RenderTripNoteBlock(column, child, imageBytes, indent + 18);
            }
        }
    }

    private static void RenderTripNoteInlines(TextDescriptor text, IReadOnlyList<TripNotePdfInline>? inlines)
    {
        if (inlines == null)
        {
            return;
        }

        foreach (var inline in inlines)
        {
            var displayText = inline.LinkUrl != null && !string.Equals(inline.Text, inline.LinkUrl, StringComparison.OrdinalIgnoreCase)
                ? $"{inline.Text} ({inline.LinkUrl})"
                : inline.Text;

            var span = text.Span(displayText);
            if (inline.Bold)
            {
                span.SemiBold();
            }

            if (inline.Italic)
            {
                span.Italic();
            }

            if (inline.Underline || inline.LinkUrl != null)
            {
                span.Underline();
            }

            if (inline.Strike)
            {
                span.Strikethrough();
            }

            if (inline.Code)
            {
                span.FontFamily("Courier New");
                span.BackgroundColor(Colors.Grey.Lighten3);
            }

            if (inline.LinkUrl != null)
            {
                span.FontColor(Colors.Blue.Darken2);
            }
        }
    }

    private sealed record TripNotePdfBlock(
        string Type,
        int Level = 0,
        IReadOnlyList<TripNotePdfInline>? Inlines = null,
        IReadOnlyList<TripNotePdfBlock>? Children = null,
        string? Url = null);

    private sealed record TripNotePdfInline(
        string Text,
        bool Bold = false,
        bool Italic = false,
        bool Underline = false,
        bool Strike = false,
        bool Code = false,
        string? LinkUrl = null);

    private sealed record InlineParseResult(
        List<TripNotePdfInline> Inlines,
        List<TripNotePdfBlock> ImageBlocks);
}
