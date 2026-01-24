namespace plantour_server.Services;

public interface IDocumentsService
{
    Task<byte[]> GenerateTripReportPdfAsync(Guid tripId);
    Task<byte[]> GeneratePackingListPdfAsync(Guid tripId, Guid packageId);
}
