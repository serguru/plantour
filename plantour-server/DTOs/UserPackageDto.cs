namespace plantour_server.DTOs;

public class UserPackageDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string ShortDescription { get; set; } = null!;
    public string? Description { get; set; }
    public List<CategoryLookupDto> CategoriesLookup { get; set; } = new();
}
