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
    public class ProjectController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly AuthService _authService;

        public ProjectController(IConfiguration configuration, AuthService authService)
        {
            _configuration = configuration;
            _authService = authService;
        }

        [HttpGet]
        public async Task<JsonResult> Get()
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return new JsonResult(new { message = "Access denied" })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            bool isUserAdmin = _authService.GetUserAccess(token);
            int userId = _authService.GetUserId(token);

            string query = @"
                SELECT 
                    p.idProject,
                    p.nameProject,
                    p.startDate,
                    p.stateProject,
                    p.description,
                    p.completed,
                    t.idTask,
                    t.nameTask,
                    t.description AS taskDescription,
                    t.status AS taskStatus,
                    uhp.user_idUser AS projectUserId,
                    uhp.user_role AS projectUserRole,
                    uht.user_idUser AS taskUserId,
                    uht.user_role AS taskUserRole,
                    u.username AS projectUsername,
                    u.name AS projectName,
                    u.surname AS projectUserSurname,
                    u.is_admin AS projectUserIsAdmin,
                    ut.username AS taskUsername,
                    ut.name AS taskUserName,
                    ut.surname AS taskUserSurname,
                    ut.is_admin AS taskUserIsAdmin
                FROM project p
                LEFT JOIN user_has_project uhp ON p.idProject = uhp.project_idProject
                LEFT JOIN user u ON uhp.user_idUser = u.idUser
                LEFT JOIN task t ON p.idProject = t.idProject
                LEFT JOIN user_has_task uht ON t.idTask = uht.task_idTask
                LEFT JOIN user ut ON uht.user_idUser = ut.idUser";

            var projects = new Dictionary<int, ResponseProjectClass>();
            string MySqlDataSource = _configuration.GetConnectionString("AppCon");

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                await myCon.OpenAsync();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    using (var myReader = (MySqlDataReader)await myCommand.ExecuteReaderAsync())
                    {
                        while (await myReader.ReadAsync())
                        {
                            int projectId = myReader.GetInt32("idProject");

                            if (!projects.ContainsKey(projectId))
                            {
                                var project = new ResponseProjectClass
                                {
                                    idProject = projectId,
                                    nameProject = myReader.GetString("nameProject"),
                                    startDate = myReader.GetDateTime("startDate"),
                                    stateProject = myReader.GetString("stateProject"),
                                    description = myReader.GetString("description"),
                                    completed = myReader.GetBoolean("completed"),
                                    Tasks = new List<ResponseTaskClass>(),
                                    UserRoles = new List<UserProjectRole>()
                                };
                                projects.Add(projectId, project);
                            }

                            if (!myReader.IsDBNull(myReader.GetOrdinal("projectUserId")))
                            {
                                var userRole = new UserProjectRole
                                {
                                    UserId = myReader.GetInt32("projectUserId"),
                                    Role = myReader.IsDBNull(myReader.GetOrdinal("projectUserRole"))
                                        ? 0
                                        : myReader.GetInt32("projectUserRole"),
                                    Username = myReader.IsDBNull(myReader.GetOrdinal("projectUsername"))
                                        ? null
                                        : myReader.GetString("projectUsername"),
                                    Name = myReader.IsDBNull(myReader.GetOrdinal("projectName"))
                                        ? null
                                        : myReader.GetString("projectName"),
                                    Surname = myReader.IsDBNull(myReader.GetOrdinal("projectUserSurname"))
                                        ? null
                                        : myReader.GetString("projectUserSurname"),
                                    IsAdmin = myReader.IsDBNull(myReader.GetOrdinal("projectUserIsAdmin"))
                                        ? false
                                        : myReader.GetBoolean("projectUserIsAdmin")
                                };

                                if (!projects[projectId].UserRoles.Any(ur => ur.UserId == userRole.UserId))
                                {
                                    projects[projectId].UserRoles.Add(userRole);
                                }
                            }

                            if (!myReader.IsDBNull(myReader.GetOrdinal("idTask")))
                            {
                                int taskId = myReader.GetInt32("idTask");
                                var task = projects[projectId].Tasks.FirstOrDefault(t => t.idTask == taskId);

                                if (task == null)
                                {
                                    task = new ResponseTaskClass
                                    {
                                        idTask = taskId,
                                        taskName = myReader.GetString("nameTask"),
                                        taskDescription = myReader.IsDBNull(myReader.GetOrdinal("taskDescription"))
                                            ? null
                                            : myReader.GetString("taskDescription"),
                                        taskStatus = myReader.IsDBNull(myReader.GetOrdinal("taskStatus"))
                                            ? false
                                            : myReader.GetBoolean("taskStatus"),
                                        isAssignedToUser = myReader.IsDBNull(myReader.GetOrdinal("taskUserId"))
                                            ? false
                                            : myReader.GetInt32("taskUserId") == userId,
                                        UserRoles = new List<UserTaskRole>()
                                    };
                                    projects[projectId].Tasks.Add(task);
                                }

                                if (!myReader.IsDBNull(myReader.GetOrdinal("taskUserId")))
                                {
                                    var userTaskRole = new UserTaskRole
                                    {
                                        UserId = myReader.GetInt32("taskUserId"),
                                        Role = myReader.IsDBNull(myReader.GetOrdinal("taskUserRole"))
                                            ? 0
                                            : myReader.GetInt32("taskUserRole"),
                                        Username = myReader.IsDBNull(myReader.GetOrdinal("taskUsername"))
                                            ? null
                                            : myReader.GetString("taskUsername"),
                                        Name = myReader.IsDBNull(myReader.GetOrdinal("taskUserName"))
                                            ? null
                                            : myReader.GetString("taskUserName"),
                                        Surname = myReader.IsDBNull(myReader.GetOrdinal("taskUserSurname"))
                                            ? null
                                            : myReader.GetString("taskUserSurname"),
                                        IsAdmin = myReader.IsDBNull(myReader.GetOrdinal("taskUserIsAdmin"))
                                            ? false
                                            : myReader.GetBoolean("taskUserIsAdmin")
                                    };

                                    if (!task.UserRoles.Any(utr => utr.UserId == userTaskRole.UserId))
                                    {
                                        task.UserRoles.Add(userTaskRole);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (isUserAdmin)
            {
                return new JsonResult(projects.Values.ToList());
            }

            var filteredProjects = projects.Values
                .Where(p => p.UserRoles.Any(ur => ur.UserId == userId) || p.Tasks.Any(t => t.isAssignedToUser))
                .ToList();

            return new JsonResult(filteredProjects);
        }

        [HttpPost]
        public JsonResult Post(ProjectPostClass project)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return new JsonResult(new { message = "Access denied" })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            string query = @"INSERT INTO todo.project(nameProject, startDate, stateProject, description) 
                     VALUES (@nameProject, @startDate, @stateProject, @description);
                     SELECT LAST_INSERT_ID();";

            string MySqlDataSource = _configuration.GetConnectionString("AppCon");

            int newProjectId;

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@nameProject", project.nameProject);
                    myCommand.Parameters.AddWithValue("@startDate", project.startDate);
                    myCommand.Parameters.AddWithValue("@stateProject", project.stateProject);
                    myCommand.Parameters.AddWithValue("@description", project.description);

                    newProjectId = Convert.ToInt32(myCommand.ExecuteScalar());
                }

                if (project.UserRoles != null && project.UserRoles.Any())
                {
                    string userQuery = "INSERT INTO todo.user_has_project (user_idUser, project_idProject, user_role) VALUES (@userId, @projectId, @userRole);";
                    foreach (var userRole in project.UserRoles)
                    {
                        using (MySqlCommand userCommand = new MySqlCommand(userQuery, myCon))
                        {
                            userCommand.Parameters.AddWithValue("@userId", userRole.UserId);
                            userCommand.Parameters.AddWithValue("@projectId", newProjectId);
                            userCommand.Parameters.AddWithValue("@userRole", userRole.Role);
                            userCommand.ExecuteNonQuery();
                        }
                    }
                }

                if (project.GoalIds != null && project.GoalIds.Any())
                {
                    string goalQuery = "INSERT INTO todo.goal_has_project (goal_idGoal, project_idProject) VALUES (@goalId, @projectId);";
                    foreach (var goalId in project.GoalIds)
                    {
                        using (MySqlCommand goalCommand = new MySqlCommand(goalQuery, myCon))
                        {
                            goalCommand.Parameters.AddWithValue("@goalId", goalId);
                            goalCommand.Parameters.AddWithValue("@projectId", newProjectId);
                            goalCommand.ExecuteNonQuery();
                        }
                    }
                }

                if (project.StakeholderIds != null && project.StakeholderIds.Any())
                {
                    string stakeholderQuery = "INSERT INTO todo.stakeholder_has_project (stakeholder_idStake, project_idProject) VALUES (@stakeholderId, @projectId);";
                    foreach (var stakeholderId in project.StakeholderIds)
                    {
                        using (MySqlCommand stakeholderCommand = new MySqlCommand(stakeholderQuery, myCon))
                        {
                            stakeholderCommand.Parameters.AddWithValue("@stakeholderId", stakeholderId);
                            stakeholderCommand.Parameters.AddWithValue("@projectId", newProjectId);
                            stakeholderCommand.ExecuteNonQuery();
                        }
                    }
                }

                if (project.Tasks != null && project.Tasks.Any())
                {
                    string taskQuery = @"INSERT INTO todo.task (nameTask, description, deadLine, idProject, status) 
                                VALUES (@nameTask, @description, @deadLine, @idProject, @status);
                                SELECT LAST_INSERT_ID();";

                    string userTaskQuery = "INSERT INTO todo.user_has_task (user_idUser, task_idTask, user_role) VALUES (@userId, @taskId, @userRole);";

                    foreach (var task in project.Tasks)
                    {
                        int newTaskId;
                        using (MySqlCommand taskCommand = new MySqlCommand(taskQuery, myCon))
                        {
                            taskCommand.Parameters.AddWithValue("@nameTask", task.nameTask);
                            taskCommand.Parameters.AddWithValue("@description", task.description);
                            taskCommand.Parameters.AddWithValue("@deadLine", task.deadLine);
                            taskCommand.Parameters.AddWithValue("@idProject", newProjectId);
                            taskCommand.Parameters.AddWithValue("@status", task.status);

                            newTaskId = Convert.ToInt32(taskCommand.ExecuteScalar());
                        }

                        if (task.UserRoles != null && task.UserRoles.Any())
                        {
                            foreach (var userRole in task.UserRoles)
                            {
                                using (MySqlCommand userTaskCommand = new MySqlCommand(userTaskQuery, myCon))
                                {
                                    userTaskCommand.Parameters.AddWithValue("@userId", userRole.UserId);
                                    userTaskCommand.Parameters.AddWithValue("@taskId", newTaskId);
                                    userTaskCommand.Parameters.AddWithValue("@userRole", userRole.Role);
                                    userTaskCommand.ExecuteNonQuery();
                                }
                            }
                        }
                    }
                }
            }

            return new JsonResult(new { Message = "Added Successfully!", ProjectId = newProjectId });
        }

        [HttpPut]
        public JsonResult Put(ProjectClass projects)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return new JsonResult(new { message = "Access denied" })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            string query = @"UPDATE todo.project 
                            SET nameProject = @nameProject, startDate = @startDate, stateProject = @stateProject, description = @description, completed = @completed
                            WHERE (idProject = @idProject);";
            DataTable table = new DataTable();
            string MySqlDataSource = _configuration.GetConnectionString("AppCon");
            MySqlDataReader myReader;
            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@idProject", projects.idProject);
                    myCommand.Parameters.AddWithValue("@nameProject", projects.nameProject);
                    myCommand.Parameters.AddWithValue("@startDate", projects.startDate);
                    myCommand.Parameters.AddWithValue("@stateProject", projects.stateProject);
                    myCommand.Parameters.AddWithValue("@description", projects.description);
                    myCommand.Parameters.AddWithValue("@completed", projects.completed);
                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }
            return new JsonResult("Updated Successfully!");
        }

        [HttpPut("updateUserRole")]
        public JsonResult UpdateUserRole(int projectId, int userId, int newRole)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return new JsonResult(new { message = "Access denied" })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            string query = @"UPDATE todo.user_has_project 
                     SET user_role = @userRole
                     WHERE project_idProject = @projectId AND user_idUser = @userId;";

            string MySqlDataSource = _configuration.GetConnectionString("AppCon");

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@projectId", projectId);
                    myCommand.Parameters.AddWithValue("@userId", userId);
                    myCommand.Parameters.AddWithValue("@userRole", newRole);
                    myCommand.ExecuteNonQuery();
                }
            }

            return new JsonResult("User role updated successfully!");
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

            string query = @"DELETE FROM todo.project WHERE (idProject = @idProject)";
            DataTable table = new DataTable();
            string MySqlDataSource = _configuration.GetConnectionString("AppCon");
            MySqlDataReader myReader;
            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@idProject", id);
                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }
            return new JsonResult("Deleted Successfully!");
        }
    }

    public class ProjectPostClass
    {
        public string nameProject { get; set; }
        public DateTime startDate { get; set; }
        public string stateProject { get; set; }
        public string description { get; set; }
        public List<UserProjectRoleInput> UserRoles { get; set; }
        public List<int> UserIds { get; set; }
        public List<int> GoalIds { get; set; }
        public List<int> StakeholderIds { get; set; }
        public bool completed { get; set; }
        public List<PostTask> Tasks { get; set; }
    }

    public class UserProjectRole
    {
        public int UserId { get; set; }
        public int Role { get; set; }
        public string Username { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public bool IsAdmin { get; set; }
    }

    public class UserProjectRoleInput
    {
        public int UserId { get; set; }
        public int Role { get; set; }
    }

    public class Task
    {
        public int idTask { get; set; }
        public string nameTask { get; set; }
        public string description { get; set; }
        public DateTime deadLine { get; set; }
        public int idProject { get; set; }
        public bool status { get; set; }
        public List<UserTaskRole> UserRoles { get; set; }
    }

    public class PostTask
    {
        public int idTask { get; set; }
        public string nameTask { get; set; }
        public string description { get; set; }
        public DateTime deadLine { get; set; }
        public int idProject { get; set; }
        public bool status { get; set; }
        public List<UserProjectRoleInput> UserRoles { get; set; }
    }

    public class ResponseTaskClass
    {
        public int idTask { get; set; }
        public string taskName { get; set; }
        public string? taskDescription { get; set; }
        public bool? taskStatus { get; set; }
        public bool isAssignedToUser { get; set; }
        public List<UserTaskRole> UserRoles { get; set; } = new List<UserTaskRole>();
    }

    public class ResponseProjectClass
    {
        public int idProject { get; set; }
        public string nameProject { get; set; }
        public DateTime startDate { get; set; }
        public string stateProject { get; set; }
        public string description { get; set; }
        public bool completed { get; set; }
        public List<ResponseTaskClass> Tasks { get; set; } = new List<ResponseTaskClass>();
        public List<UserProjectRole> UserRoles { get; set; } = new List<UserProjectRole>();
    }
}