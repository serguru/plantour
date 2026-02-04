using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using plantour_server.DTOs;
using PlantourApi.Models;
using plantour_server.Utils;

namespace plantour_server.Services;

public class DocumentsService : IDocumentsService
{
    private readonly ITripService _tripService;
    private readonly ITripUserService _tripUserService;
    private readonly ITripPackageService _tripPackageService;
    private readonly ITripThingService _tripThingService;
    private readonly CurrentUser _currentUser;

    private readonly ICheckAccessService _checkAccessService;

    private const string primaryColor = "#2F7C87";

    public DocumentsService(
        ITripService tripService,
        ITripUserService tripUserService,
        ITripPackageService tripPackageService,
        ITripThingService tripThingService,
        HttpCurrentUser httpCurrentUser,
        ICheckAccessService checkAccessService)
    {
        _tripService = tripService;
        _tripUserService = tripUserService;
        _tripPackageService = tripPackageService;
        _tripThingService = tripThingService;
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
            }
            AddInfoRow(table, "Shared Items:", trip.TotalSharedThings.ToString());

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
}
