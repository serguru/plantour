using plantour_server.Utils;

namespace plantour_server.DTOs;

public class PriceDto
{
    public Guid Id { get; set; }

    public string PaymentProcessorPriceId { get; set; } = null!;

    public string Name { get; set; } = null!;

    public int ValueCents { get; set; }

    public string? Notes { get; set; }
}
