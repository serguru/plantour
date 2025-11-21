namespace plantour.Infrastructure.Dtos;

public class TourCreateDto
{
    public string Name { get; set; }
}

public class TourUpdateDto
{
    public string Name { get; set; }
}

public class TourResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Json { get; set; }
    public int Version { get; set; }
}
