using Microsoft.AspNetCore.Mvc;
using System.Data;
using MySql.Data.MySqlClient;
using react_api.Models;
using To_Do_List_Project.Services;

namespace react_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly UserService _userService;
        private readonly AuthService _authService;
        private readonly ILogger<UserController> _logger;

        public UserController(IConfiguration configuration, UserService userService, AuthService authService, ILogger<UserController> logger)
        {
            _configuration = configuration;
            _userService = userService;
            _authService = authService;
            _logger = logger;
        }

        [HttpGet]
        public JsonResult Get()
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return new JsonResult(new { message = "Access denied" })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            List<UserClass> users = _userService.Get();

            return new JsonResult(users);
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterModel model)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return new JsonResult(new { message = "Access denied" })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            if (model == null)
            {
                return BadRequest("Invalid request body");
            }

            var (hashedPassword, salt) = _authService.HashPassword(model.Password);

            string query = @"INSERT INTO todo.user (username, name, surname, password, salt, is_admin) 
             VALUES (@username, @name, @surname, @password, @salt, @is_admin)";
            string MySqlDataSource = _configuration.GetConnectionString("AppCon");

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@username", model.Username);
                    myCommand.Parameters.AddWithValue("@name", model.Name);
                    myCommand.Parameters.AddWithValue("@surname", model.Surname);
                    myCommand.Parameters.AddWithValue("@password", hashedPassword);
                    myCommand.Parameters.AddWithValue("@salt", salt);
                    myCommand.Parameters.AddWithValue("@is_admin", model.IsAdmin);
                    myCommand.ExecuteNonQuery();
                }
            }

            return Ok("User registered successfully");
        }

        [HttpPut("UpdateUser")]
        public JsonResult UpdateUser(UserClass user)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return new JsonResult(new { message = "Access denied" })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            string query = @"
                UPDATE todo.user 
                SET username = @username, 
                    name = @name, 
                    surname = @surname, 
                    is_admin = @is_admin
                WHERE (idUser = @idUser);";

            DataTable table = new DataTable();
            string MySqlDataSource = _configuration.GetConnectionString("AppCon");
            MySqlDataReader myReader;

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@idUser", user.idUser);
                    myCommand.Parameters.AddWithValue("@username", user.username);
                    myCommand.Parameters.AddWithValue("@name", user.name);
                    myCommand.Parameters.AddWithValue("@surname", user.surname);
                    myCommand.Parameters.AddWithValue("@is_admin", user.is_admin);

                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }

            return new JsonResult("User Updated Successfully!");
        }

        [HttpPut("UpdatePassword")]
        public JsonResult UpdatePassword(int idUser, string newPassword)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return new JsonResult(new { message = "Access denied" })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            var (hashedPassword, salt) = _authService.HashPassword(newPassword);

            string query = @"
                UPDATE todo.user 
                SET password = @password, 
                    salt = @salt
                WHERE (idUser = @idUser);";

            DataTable table = new DataTable();
            string MySqlDataSource = _configuration.GetConnectionString("AppCon");
            MySqlDataReader myReader;

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@idUser", idUser);
                    myCommand.Parameters.AddWithValue("@password", hashedPassword);
                    myCommand.Parameters.AddWithValue("@salt", salt);

                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }

            return new JsonResult("Password Updated Successfully!");
        }

        [HttpDelete("{id}")]
        public JsonResult Delete(int id)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return new JsonResult(new { message = "Access denied" })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            string query = @"DELETE FROM todo.user WHERE (idUser = @idUser)";
            DataTable table = new DataTable();
            string MySqlDataSource = _configuration.GetConnectionString("AppCon");
            MySqlDataReader myReader;
            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@idUser", id);
                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }
            return new JsonResult("Deleted Successfully!");
        }

        [HttpPost("AddUserToProject")]
        public JsonResult AddUserToProject(int userId, int projectId, int userRole)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return new JsonResult(new { message = "Access denied" })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            string query = @"
        INSERT INTO todo.user_has_project (user_idUser, project_idProject, user_role) 
        VALUES (@userId, @projectId, @userRole)
        ON DUPLICATE KEY UPDATE user_role = @userRole;";

            DataTable table = new DataTable();
            string MySqlDataSource = _configuration.GetConnectionString("AppCon");
            MySqlDataReader myReader;

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@userId", userId);
                    myCommand.Parameters.AddWithValue("@projectId", projectId);
                    myCommand.Parameters.AddWithValue("@userRole", userRole);

                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }

            return new JsonResult("User added to project successfully!");
        }

        [HttpPost("AddUserToTask")]
        public JsonResult AddUserToTask(int userId, int taskId, int userRole)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return new JsonResult(new { message = "Access denied" })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            string query = @"
        INSERT INTO todo.user_has_task (user_idUser, task_idTask, user_role) 
        VALUES (@userId, @taskId, @userRole)
        ON DUPLICATE KEY UPDATE user_role = @userRole;";

            DataTable table = new DataTable();
            string MySqlDataSource = _configuration.GetConnectionString("AppCon");
            MySqlDataReader myReader;

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@userId", userId);
                    myCommand.Parameters.AddWithValue("@taskId", taskId);
                    myCommand.Parameters.AddWithValue("@userRole", userRole);

                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }

            return new JsonResult("User added to task successfully!");
        }

        [HttpDelete("RemoveUserFromProject")]
        public JsonResult RemoveUserFromProject(int userId, int projectId)
        {
            _logger.LogCritical($"{userId} + {projectId}");
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return new JsonResult(new { message = "Access denied" })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            string query = @"DELETE FROM todo.user_has_project WHERE user_idUser = @userId AND project_idProject = @projectId;";
            DataTable table = new DataTable();
            string MySqlDataSource = _configuration.GetConnectionString("AppCon");
            MySqlDataReader myReader;

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@userId", userId);
                    myCommand.Parameters.AddWithValue("@projectId", projectId);

                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }

            return new JsonResult("User removed from project successfully!");
        }

        [HttpDelete("RemoveUserFromTask")]
        public JsonResult RemoveUserFromTask(int userId, int taskId)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return new JsonResult(new { message = "Access denied" })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            string query = @"DELETE FROM todo.user_has_task WHERE user_idUser = @userId AND task_idTask = @taskId;";
            DataTable table = new DataTable();
            string MySqlDataSource = _configuration.GetConnectionString("AppCon");
            MySqlDataReader myReader;

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@userId", userId);
                    myCommand.Parameters.AddWithValue("@taskId", taskId);

                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }

            return new JsonResult("User removed from task successfully!");
        }

        [HttpPut("UpdateUserRoleInProject")]
        public JsonResult UpdateUserRoleInProject(int userId, int projectId, int userRole)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return new JsonResult(new { message = "Access denied" })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            string query = @"
                UPDATE todo.user_has_project 
                SET user_role = @userRole
                WHERE user_idUser = @userId AND project_idProject = @projectId;";

            DataTable table = new DataTable();
            string MySqlDataSource = _configuration.GetConnectionString("AppCon");
            MySqlDataReader myReader;

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@userId", userId);
                    myCommand.Parameters.AddWithValue("@projectId", projectId);
                    myCommand.Parameters.AddWithValue("@userRole", userRole);

                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }

            return new JsonResult("User role updated in project successfully!");
        }

        [HttpPut("UpdateUserRoleInTask")]
        public JsonResult UpdateUserRoleInTask(int userId, int taskId, int userRole)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return new JsonResult(new { message = "Access denied" })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            string query = @"
                UPDATE todo.user_has_task 
                SET user_role = @userRole
                WHERE user_idUser = @userId AND task_idTask = @taskId;";

            DataTable table = new DataTable();
            string MySqlDataSource = _configuration.GetConnectionString("AppCon");
            MySqlDataReader myReader;

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@userId", userId);
                    myCommand.Parameters.AddWithValue("@taskId", taskId);
                    myCommand.Parameters.AddWithValue("@userRole", userRole);

                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }

            return new JsonResult("User role updated in task successfully!");
        }
    }

    public class RegisterModel
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public bool IsAdmin { get; set; }
    }
}
