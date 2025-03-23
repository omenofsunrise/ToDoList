using Microsoft.AspNetCore.Mvc;
using To_Do_List_Project.Services;

namespace YourNamespace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly AuthService _authService;

        public AccountController(UserService userService, AuthService authService)
        {
            _userService = userService;
            _authService = authService;
        }

        [HttpPost("login")]
        public IActionResult Login(string username, string password)
        {
            var user = _userService.GetUserByUsername(username);

            if (user != null && _authService.VerifyPassword(password, user.password, user.salt))
            {
                var token = _authService.GenerateToken(user.username, user.is_admin, user.idUser);

                return Ok(new { Token = token });
            }

            return Unauthorized("Invalid username or password");
        }

        [HttpGet("secure")]
        public IActionResult SecureEndpoint()
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return Unauthorized("Invalid token");
            }

            return Ok("Access granted");
        }

        [HttpGet("access")]
        public IActionResult AccessEndpoint()
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return Unauthorized("Invalid token");
            }

            return Ok(_authService.GetUserAccess(token));
        }
    }
}