// using KonceAuthentication.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using JourFlow_BE.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace JourFlow_BE.Services
{
    public interface IGenerateTokenService
    {
        public string GenerateJWT(Users user);
        public Task<string> GenerateRefreshToken(string email);
    }
    public class TokenGenerating : IGenerateTokenService
    {
        private readonly IConfiguration _config; 
        private readonly JourFlowDbContext _dbContext;
        public TokenGenerating(IConfiguration config, JourFlowDbContext dbContext)
        {
            _config = config; 
            _dbContext = dbContext;
        }
 
        public string GenerateJWT(Users user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, user.Email),
            }; 
            Console.WriteLine(ClaimTypes.NameIdentifier+"from servicee");
            var token = new JwtSecurityToken(
                _config["Jwt:Issuer"],
                _config["Jwt:Audience"],
                claims,
                expires: DateTime.UtcNow.AddHours(20),
                signingCredentials: credentials
            );
            Console.WriteLine($"CREATE TIME: {DateTime.UtcNow}");
            Console.WriteLine($"EXPIRATION WHEN CREATE: {DateTime.UtcNow.AddDays(1)}");
                return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<string> GenerateRefreshToken(string email)
        {
            var currentUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);
            string refreshToken;

            if (currentUser != null) // User exists
            {
                refreshToken = currentUser.RefreshToken;
            }
            else // New user
            {
                refreshToken = Guid.NewGuid().ToString();
            }

            return refreshToken;
        }

    }
}