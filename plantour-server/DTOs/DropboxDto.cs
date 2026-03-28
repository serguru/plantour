namespace plantour_server.DTOs;

public class DropboxBrowseResultDto
{
    public string? CurrentPath { get; set; }
    public string? ParentPath { get; set; }
    public List<DropboxBrowseEntryDto> Entries { get; set; } = [];
}

public class DropboxBrowseEntryDto
{
    public string Type { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? PathDisplay { get; set; }
    public string? Id { get; set; }
    public string? Source { get; set; }
}