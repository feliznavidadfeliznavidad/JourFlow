using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JourFlow_BE.Models;
using JourFlow_BE.Services;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JourFlow_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")] 
    public class AuthController : ControllerBase
    {
        private readonly GoogleTokenService _googleTokenService;
        private readonly IGenerateTokenService _services;
        private readonly JourFlowDbContext _dbContext;

        public AuthController(GoogleTokenService googleTokenService,  
                            IGenerateTokenService services,
                            JourFlowDbContext dbContext)
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
                var payload = await _googleTokenService.ValidateGoogleToken(request.IdToken!);

                // Console.WriteLine(payload.Email); 
                // Console.WriteLine(payload.Picture); 
                // Console.WriteLine(payload.Name); 
                // Console.WriteLine(await _services.GenerateRefreshToken(payload.Email));
                
        
                var currentUser = await _dbContext.Users!.FirstOrDefaultAsync(u=>u.Email == payload.Email);
                Console.WriteLine("Current User" + currentUser?.Email);
                if (currentUser == null)
                {
                    Console.WriteLine("Register new User");
                    var refreshToken = await _services.GenerateRefreshToken(payload!.Email);
                    var userToDB = new Users {
                        Id = Guid.NewGuid(),
                        Email = payload!.Email,
                        RefreshToken = refreshToken,
                        AvtUrl = payload!.Picture,
                        UserName = payload!.Name
                    };

                    Console.WriteLine(userToDB.Id);
                    Console.WriteLine(userToDB.Email);
                    Console.WriteLine(userToDB.RefreshToken);
                    Console.WriteLine(userToDB.AvtUrl);
                    Console.WriteLine(userToDB.UserName);

                    await _dbContext.Users!.AddRangeAsync(userToDB);
                    await _dbContext.SaveChangesAsync();
                    var token = _services.GenerateJWT(userToDB); 
                    return Ok(new {
                        message = "Register new User successfully",
                        userId = userToDB.Id,
                        token,
                        userToDB.RefreshToken
                    });
                } else {
                    var token = _services.GenerateJWT(currentUser);
                    var refreshToken = await _services.GenerateRefreshToken(payload.Email);
                    return Ok(new { 
                        userId = currentUser.Id,
                        token,
                        refreshToken
                    }); 
                }
            } catch (Exception e)
            {
                return BadRequest(e.Message + e.Data);
            }
        }

        [HttpPost("update-jwt/{refreshToken}")]
        public async Task<IActionResult> UpdateJWT(string refreshToken)
        {
            var current_user = await _dbContext.Users!.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
            if (current_user == null)
            {
                return NotFound();
            } else {
                return Ok(new {
                    jwt = _services.GenerateJWT(current_user)
                });
            }
        }
    }
    public class GoogleSignInRequest
    {
        public string? IdToken { get; set; }
    } 
}