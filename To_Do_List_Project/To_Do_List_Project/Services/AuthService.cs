using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace To_Do_List_Project.Services
{
    public class AuthService
    {
        ILogger<AuthService> _logger;

        public AuthService(ILogger<AuthService> logger) 
        { 
                _logger = logger;
        }

        public (string hashedPassword, string salt) HashPassword(string password)
        {
            byte[] saltBytes = new byte[128 / 8];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(saltBytes);
            }
            string salt = Convert.ToBase64String(saltBytes);

            string hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: password,
                salt: saltBytes,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 10000,
                numBytesRequested: 256 / 8));

            return (hashed, salt);
        }

        public bool VerifyPassword(string enteredPassword, string storedHash, string storedSalt)
        {
            byte[] saltBytes = Convert.FromBase64String(storedSalt);

            string hashedEnteredPassword = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: enteredPassword,
                salt: saltBytes,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 10000,
                numBytesRequested: 256 / 8));

            return hashedEnteredPassword == storedHash;
        }

        public string GenerateToken(string username, bool isAdmin, int userId)
        {
            var tokenData = new
            {
                Username = username,
                IsAdmin = isAdmin,
                Expires = DateTime.UtcNow.AddHours(1), 
                UserId = userId
            };

            var jsonToken = JsonSerializer.Serialize(tokenData);

            var base64Token = Convert.ToBase64String(Encoding.UTF8.GetBytes(jsonToken));

            return base64Token;
        }

        public bool ValidateToken(string token)
        {
            try
            {
                var jsonToken = Encoding.UTF8.GetString(Convert.FromBase64String(token));

                var tokenData = JsonSerializer.Deserialize<TokenData>(jsonToken);

                if (tokenData.Expires < DateTime.UtcNow)
                {
                    _logger.LogCritical("Token expired");
                    return false;
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogCritical($"Token validation failed: {ex.Message}");
                return false;
            }
        }

        public bool GetUserAccess(string token)
        {
            try
            {
                var jsonToken = Encoding.UTF8.GetString(Convert.FromBase64String(token));

                var tokenData = JsonSerializer.Deserialize<TokenData>(jsonToken);

                return tokenData.IsAdmin;
            }
            catch (Exception ex)
            {
                _logger.LogCritical($"Token validation failed: {ex.Message}");
                return false;
            }
        }

        public int GetUserId(string token)
        {
            try
            {
                var jsonToken = Encoding.UTF8.GetString(Convert.FromBase64String(token));

                var tokenData = JsonSerializer.Deserialize<TokenData>(jsonToken);

                return tokenData.UserId;
            }
            catch (Exception ex)
            {
                _logger.LogCritical($"Token validation failed: {ex.Message}");
                return -1;
            }
        }

        public class TokenData
        {
            public string Username { get; set; }
            public bool IsAdmin { get; set; }
            public DateTime Expires { get; set; }
            public int UserId { get; set; }
        }
    }
}