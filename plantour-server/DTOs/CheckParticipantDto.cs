namespace plantour_server.DTOs;

public enum CheckParticipantStatus
{
    AlreadyParticipant = 1,
    UserExistsNotParticipant = 2,
    NotFound = 3
}

public class CheckParticipantDto
{
    public Guid? FoundUserId { get; set; }
    public CheckParticipantStatus Status { get; set; }
}
