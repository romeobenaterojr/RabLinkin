using System.Net.Http.Headers;
using System.Text;
using API.DTOs;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using static API.DTOs.GetHubInfo;

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
            [HttpPost("github-login")]
            public async Task<ActionResult> LoginWithGitHub(string code)
            {
                if (string.IsNullOrEmpty(code))
                return BadRequest("Missing authorization code");
                
                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                var tokenResponse = await httpClient.PostAsJsonAsync(
                    "https://github.com/login/oauth/access_token" , 
                    new GitHubAuthRequest
                    {
                        Code = code,
                        ClientId = _configuration["Authentication:Github:ClientId"]!,
                        ClientSecret = _configuration["Authentication:Github:ClientSecret"]!,
                        RedirectUri = $"{_configuration["ClientAppUrl"]}/auth-callback"
                    }
                );

                if (!tokenResponse.IsSuccessStatusCode)
                    return BadRequest("Failed to get access token");
                
                var tokenContent = await tokenResponse.Content.ReadFromJsonAsync<GitHubTokenREsponse>();
                if (string.IsNullOrEmpty(tokenContent?.AccessToken))
                    return BadRequest("Failed to retrieve access token");

                //---------------------------------------------------------------
                //step 2 fecth to github
                httpClient.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", tokenContent.AccessToken);
                httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("RabLinkin");

                var userResponse =  await httpClient.GetAsync("https://api.github.com/user");

                if (!userResponse.IsSuccessStatusCode)
                    return BadRequest("Failed to fect user form github");

                var user = await userResponse.Content.ReadFromJsonAsync<GitHubUser>();

                if (user == null) return BadRequest("Failed to Read USer from github");

                //set 3 get email id need
             if (string.IsNullOrEmpty(user?.Email))
                {
                    var emailResponse = await httpClient.GetAsync("https://api.github.com/user/emails");

                    if (!emailResponse.IsSuccessStatusCode)
                        return BadRequest("Failed to fetch emails from GitHub");

                    var emails = await emailResponse.Content.ReadFromJsonAsync<List<GithubEmail>>();

                    var primary = emails?.FirstOrDefault(e => e.Primary && e.Verified)?.Email;
                    if (string.IsNullOrEmpty(primary))
                        return BadRequest("Failed to get email from GitHub");

                    user!.Email = primary;
                }

                //find or create user step 4
                var existingUser = await _signInManager.UserManager.FindByEmailAsync(user.Email);

                if(existingUser == null)
                {
                    existingUser = new User
                    {
                        Email = user.Email,
                        UserName = user.Email,
                        DisplayName = user.Name,
                        ImageUrl  = user.ImageUrl
                    };

                    var createdResult = await _signInManager.UserManager.CreateAsync(existingUser);
                    if (!createdResult.Succeeded)
                        return BadRequest("Failed to create user");
                }

                await _signInManager.SignInAsync(existingUser, false);

                return Ok();

                
            }

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
