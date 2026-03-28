namespace plantour_server.Services;

public interface IDocumentsService
{
    Task<byte[]> GenerateTripReportPdfAsync(Guid tripId);
    Task<byte[]> GeneratePackingListPdfAsync(Guid tripId, Guid packageId);
    Task<byte[]> GenerateTripExpensesReportPdfAsync(Guid tripId);
    Task<byte[]> GenerateTripNotesPdfAsync(Guid tripId, Guid[] ids);
}
