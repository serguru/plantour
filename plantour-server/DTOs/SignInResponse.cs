using System.ComponentModel.DataAnnotations;

namespace plantour_server.DTOs;

public class SignInResponse
{
    public int SignInEmailTokenMinutes { get; set; }
    public required string FullUserName { get; set; }

}