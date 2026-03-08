using System.ComponentModel.DataAnnotations;

namespace plantour_server.Models;
public class SignInRequestToken
{
    public required string Token { get; set; }

}