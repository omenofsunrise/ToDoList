using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Data;
using MySql.Data.MySqlClient;
using Microsoft.Extensions.Configuration;
using react_api.Models;
using Microsoft.AspNetCore.Authorization;
using To_Do_List_Project.Services;

namespace react_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaskController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly AuthService _authService;

        public TaskController(IConfiguration configuration, AuthService authService)
        {
            _configuration = configuration;
            _authService = authService;
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

            string query = @"
                SELECT 
                    t.idTask, 
                    t.nameTask, 
                    t.description, 
                    t.deadLine, 
                    t.idProject, 
                    t.status, 
                    uht.user_idUser, 
                    uht.user_role,
                    u.username AS Username,
                    u.name AS Name,
                    u.surname AS Surname,
                    u.is_Admin AS IsAdmin
                FROM todo.task t
                LEFT JOIN todo.user_has_task uht ON t.idTask = uht.task_idTask
                LEFT JOIN todo.user u ON uht.user_idUser = u.idUser";

            List<TaskClass> tasks = new List<TaskClass>();
            string MySqlDataSource = _configuration.GetConnectionString("AppCon");

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    using (MySqlDataReader myReader = myCommand.ExecuteReader())
                    {
                        while (myReader.Read())
                        {
                            int taskId = myReader.GetInt32("idTask");

                            var task = tasks.FirstOrDefault(t => t.idTask == taskId);
                            if (task == null)
                            {
                                task = new TaskClass
                                {
                                    idTask = taskId,
                                    nameTask = myReader.GetString("nameTask"),
                                    description = myReader.GetString("description"),
                                    deadLine = myReader.GetDateTime("deadLine"),
                                    idProject = myReader.GetInt32("idProject"),
                                    status = myReader.GetBoolean("status"),
                                    UserRoles = new List<UserTaskRole>()
                                };
                                tasks.Add(task);
                            }

                            if (!myReader.IsDBNull(myReader.GetOrdinal("user_idUser")))
                            {
                                var userRole = new UserTaskRole
                                {
                                    UserId = myReader.GetInt32("user_idUser"),
                                    Role = myReader.GetInt32("user_role"),
                                    Username = myReader.GetString("Username"),
                                    Name = myReader.GetString("Name"),
                                    Surname = myReader.GetString("Surname"),
                                    IsAdmin = myReader.GetBoolean("IsAdmin")
                                };
                                task.UserRoles.Add(userRole);
                            }
                        }
                    }
                }
            }

            return new JsonResult(tasks);
        }

        [HttpPost]
        public JsonResult Post(PostTask task)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return new JsonResult(new { message = "Access denied" })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            string checkProjectQuery = "SELECT COUNT(*) FROM todo.project WHERE idProject = @idProject;";
            string insertTaskQuery = @"INSERT INTO todo.task (nameTask, description, deadLine, idProject, status) 
                               VALUES (@nameTask, @description, @deadLine, @idProject, @status);
                               SELECT LAST_INSERT_ID();";
            string insertUserTaskQuery = @"INSERT INTO todo.user_has_task (user_idUser, task_idTask, user_role) 
                                   VALUES (@userId, @taskId, @userRole);";

            string MySqlDataSource = _configuration.GetConnectionString("AppCon");
            int newTaskId;

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();

                using (MySqlCommand checkProjectCommand = new MySqlCommand(checkProjectQuery, myCon))
                {
                    checkProjectCommand.Parameters.AddWithValue("@idProject", task.idProject);
                    int projectCount = Convert.ToInt32(checkProjectCommand.ExecuteScalar());

                    if (projectCount == 0)
                    {
                        return new JsonResult("Project does not exist!");
                    }
                }

                using (MySqlCommand insertTaskCommand = new MySqlCommand(insertTaskQuery, myCon))
                {
                    insertTaskCommand.Parameters.AddWithValue("@nameTask", task.nameTask);
                    insertTaskCommand.Parameters.AddWithValue("@description", task.description);
                    insertTaskCommand.Parameters.AddWithValue("@deadLine", task.deadLine);
                    insertTaskCommand.Parameters.AddWithValue("@idProject", task.idProject);
                    insertTaskCommand.Parameters.AddWithValue("@status", task.status);
                    newTaskId = Convert.ToInt32(insertTaskCommand.ExecuteScalar());
                }

                if (task.UserRoles != null && task.UserRoles.Any())
                {
                    foreach (var userRole in task.UserRoles)
                    {
                        using (MySqlCommand insertUserTaskCommand = new MySqlCommand(insertUserTaskQuery, myCon))
                        {
                            insertUserTaskCommand.Parameters.AddWithValue("@userId", userRole.UserId);
                            insertUserTaskCommand.Parameters.AddWithValue("@taskId", newTaskId);
                            insertUserTaskCommand.Parameters.AddWithValue("@userRole", userRole.Role);
                            insertUserTaskCommand.ExecuteNonQuery();
                        }
                    }
                }
            }

            return new JsonResult(new { Message = "Added Successfully!", TaskId = newTaskId });
        }

        [HttpPut]
        public JsonResult Put(PostTask task)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return new JsonResult(new { message = "Access denied" })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            string updateTaskQuery = @"UPDATE todo.task 
                               SET nameTask = @nameTask, description = @description, deadLine = @deadLine, 
                                   idProject = @idProject, status = @status 
                               WHERE idTask = @idTask;";

            string updateUserTaskQuery = @"UPDATE todo.user_has_task 
                                   SET user_role = @userRole 
                                   WHERE task_idTask = @taskId AND user_idUser = @userId;";

            string MySqlDataSource = _configuration.GetConnectionString("AppCon");

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();

                using (MySqlCommand updateTaskCommand = new MySqlCommand(updateTaskQuery, myCon))
                {
                    updateTaskCommand.Parameters.AddWithValue("@idTask", task.idTask);
                    updateTaskCommand.Parameters.AddWithValue("@nameTask", task.nameTask);
                    updateTaskCommand.Parameters.AddWithValue("@description", task.description);
                    updateTaskCommand.Parameters.AddWithValue("@deadLine", task.deadLine);
                    updateTaskCommand.Parameters.AddWithValue("@idProject", task.idProject);
                    updateTaskCommand.Parameters.AddWithValue("@status", task.status);
                    updateTaskCommand.ExecuteNonQuery();
                }

                if (task.UserRoles != null && task.UserRoles.Any())
                {
                    foreach (var userRole in task.UserRoles)
                    {
                        using (MySqlCommand updateUserTaskCommand = new MySqlCommand(updateUserTaskQuery, myCon))
                        {
                            updateUserTaskCommand.Parameters.AddWithValue("@taskId", task.idTask);
                            updateUserTaskCommand.Parameters.AddWithValue("@userId", userRole.UserId);
                            updateUserTaskCommand.Parameters.AddWithValue("@userRole", userRole.Role);
                            updateUserTaskCommand.ExecuteNonQuery();
                        }
                    }
                }
            }

            return new JsonResult("Updated Successfully!");
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

            string query = @"DELETE FROM todo.task WHERE (idTask = @idTask)";
            DataTable table = new DataTable();
            string MySqlDataSource = _configuration.GetConnectionString("AppCon");
            MySqlDataReader myReader;
            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@idTask", id);
                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }
            return new JsonResult("Deleted Successfully!");
        }
    }

    public class TaskClass
    {
        public int idTask { get; set; }
        public string nameTask { get; set; }
        public string description { get; set; }
        public DateTime deadLine { get; set; }
        public int idProject { get; set; }
        public bool status { get; set; }
        public List<UserTaskRole> UserRoles { get; set; }
    }

    public class UserTaskRole
    {
        public int UserId { get; set; }
        public int Role { get; set; }
        public string Username { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public bool IsAdmin { get; set; }
    }
}
