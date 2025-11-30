using System.Text;
using API.DTOs;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController(
        SignInManager<User> signInManager,
        IEmailSender<User> emailSender,
        IConfiguration configuration) : ControllerBase
    {
        private readonly SignInManager<User> _signInManager = signInManager;
        private readonly IEmailSender<User> _emailSender = emailSender;
        private readonly IConfiguration _configuration = configuration;

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult> RegisterUser(RegisterDTO registerDTO)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = new User
            {
                UserName = registerDTO.Email,
                Email = registerDTO.Email,
                DisplayName = registerDTO.DisplayName,
                 EmailConfirmed = true 
            };

            var result = await _signInManager.UserManager.CreateAsync(user, registerDTO.Password);

            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                    ModelState.AddModelError(error.Code, error.Description);

                return ValidationProblem(ModelState);
            }

            await SendConfirmationEmailAsync(user, registerDTO.Email);
            return Ok(new { Message = "User registered successfully. Check your email to confirm." });
        }

        [AllowAnonymous]
        [HttpGet("resendConfirmEmail")]
        public async Task<ActionResult> ResendConfirmEmail(string email, string? userId)
        {
            if (string.IsNullOrEmpty(email) && string.IsNullOrEmpty(userId))
            {
                return BadRequest("Email or UserId must be provider");
            }
            var user = await _signInManager.UserManager.Users
                .FirstOrDefaultAsync(u => u.Email == email || u.Id == userId);

            if (user == null || string.IsNullOrEmpty(user.Email)) return BadRequest("Invalid email");

            await SendConfirmationEmailAsync(user, user.Email);
            return Ok(new { Message = "Confirmation email resent." });
        }

        private async Task SendConfirmationEmailAsync(User user, string email)
        {
            var code = await _signInManager.UserManager.GenerateEmailConfirmationTokenAsync(user);
            code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));

            var confirmEmailUrl = $"{_configuration["ClientAppUrl"]}/confirm-email?userId={user.Id}&code={code}";

            await _emailSender.SendConfirmationLinkAsync(user, email, confirmEmailUrl);
        }

        [AllowAnonymous]
        [HttpGet("user-info")]
        public async Task<ActionResult> GetUserInfo()
        {
            if (!User.Identity?.IsAuthenticated ?? true) return NoContent();

            var user = await _signInManager.UserManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            return Ok(new
            {
                user.DisplayName,
                user.Email,
                user.Id,
                user.ImageUrl
            });
        }

        [HttpPost("logout")]
        public async Task<ActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return NoContent();
        }
    }
}
