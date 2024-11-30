using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

using final_project_vinhspart.Services;
using server.Models;
using Microsoft.EntityFrameworkCore;


[ApiController]
[Route("api/[controller]")] 
public class AuthController : ControllerBase
{
    private readonly GoogleTokenService _googleTokenService;
    private readonly IGenerateTokenService _services;
    private readonly UserJourflowContext _dbContext;

    public AuthController(GoogleTokenService googleTokenService,  
                        IGenerateTokenService services,
                        UserJourflowContext dbContext)
    {
        _googleTokenService = googleTokenService;  
        _services = services;
        _dbContext = dbContext;
    }

    [HttpPost("google-signin")]
    public async Task<IActionResult> GoogleSignIn([FromBody] GoogleSignInRequest request)
    { 
        try 
        { 
            var payload = await _googleTokenService.ValidateGoogleToken(request.IdToken);
            string email = payload.Email;

            var currentUser = await this._dbContext.Userrs.FirstOrDefaultAsync(u=>u.Email == email);
            if (currentUser == null)
            {
                Console.WriteLine("This user is new");
                var userToDB = new Userr{
                    Email = email, // Add additional data later such as avatar, Name,...  
                    RefreshToken = await _services.GenerateRefreshToken(email)
                };
                await this._dbContext.Userrs.AddAsync(userToDB);
                await this._dbContext.SaveChangesAsync();
                var token = _services.GenerateJWT(userToDB); 
                return Ok(new {
                    message = "Register new User successfully",
                    token,
                    userToDB.RefreshToken
                });
            } else {
                var token = _services.GenerateJWT(currentUser);
                var refreshToken = await _services.GenerateRefreshToken(email);
                return Ok(new { 
                    token,
                    refreshToken
                }); 
            }
        } catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpPost("update-jwt/{refreshToken}")]
    public async Task<IActionResult> UpdateJWT(string refreshToken)
    {
        var current_user = await this._dbContext.Userrs.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
        if (current_user == null)
        {
            return NotFound();
        } else {
            return Ok(new {
                jwt = this._services.GenerateJWT(current_user)
            });
        }
    }

    
   
}
public class GoogleSignInRequest
{
    public string? IdToken { get; set; }
} 