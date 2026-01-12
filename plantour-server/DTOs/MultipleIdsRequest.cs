namespace plantour_server.DTOs;

public class MultipleIdsRequest
{
    public Guid CollectionId { get; set; }
    public Guid[] Ids { get; set; } = [];
    public Guid? Id { get; set; } = null;
}


public class ArrayOfGuidsRequest
{
    public Guid[] Ids { get; set; } = [];
}


