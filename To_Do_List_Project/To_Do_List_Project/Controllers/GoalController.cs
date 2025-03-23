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
    public class GoalController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly AuthService _authService;

        public GoalController(IConfiguration configuration, AuthService authService)
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

            string query = @"SELECT * FROM todo.goal";
            List<GoalClass> goals = new List<GoalClass>();
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
                            var goal = new GoalClass
                            {
                                idGoal = myReader.GetInt32("idGoal"),
                                nameGoal = myReader.GetString("nameGoal"),
                                AbNameGoal = myReader.GetString("AbNameGoal")
                            };
                            goals.Add(goal);
                        }
                    }
                }
            }

            return new JsonResult(goals);
        }

        [HttpGet("{project_id}")]
        public JsonResult Get(int project_id)
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
                SELECT g.idGoal, g.nameGoal, g.AbNameGoal 
                FROM todo.goal g
                INNER JOIN todo.goal_has_project ghp ON g.idGoal = ghp.goal_idGoal
                WHERE ghp.project_idProject = @project_idProject";

            List<GoalClass> goals = new List<GoalClass>();
            string MySqlDataSource = _configuration.GetConnectionString("AppCon");

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@project_idProject", project_id);

                    using (MySqlDataReader myReader = myCommand.ExecuteReader())
                    {
                        while (myReader.Read())
                        {
                            var goal = new GoalClass
                            {
                                idGoal = myReader.GetInt32("idGoal"),
                                nameGoal = myReader.GetString("nameGoal"),
                                AbNameGoal = myReader.GetString("AbNameGoal")
                            };
                            goals.Add(goal);
                        }
                    }
                }
            }

            return new JsonResult(goals);
        }

        [HttpPost]
        public JsonResult Post(GoalClass goal)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return new JsonResult(new { message = "Access denied" })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            string insertGoalQuery = @"
                INSERT INTO todo.goal (nameGoal, AbNameGoal) 
                VALUES (@nameGoal, @AbNameGoal);
                SELECT LAST_INSERT_ID();";

            string MySqlDataSource = _configuration.GetConnectionString("AppCon");

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(insertGoalQuery, myCon))
                {
                    myCommand.Parameters.AddWithValue("@nameGoal", goal.nameGoal);
                    myCommand.Parameters.AddWithValue("@AbNameGoal", goal.AbNameGoal);

                    int newGoalId = Convert.ToInt32(myCommand.ExecuteScalar());

                    return new JsonResult(new { message = "Added Successfully!", id = newGoalId });
                }
            }
        }

        [HttpPost("LinkToProject")]
        public JsonResult LinkToProject(int goal_id, int project_id)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return new JsonResult(new { message = "Access denied" })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            string insertGoalProjectQuery = @"
                INSERT INTO todo.goal_has_project (goal_idGoal, project_idProject) 
                VALUES (@goal_idGoal, @project_idProject);";

            string MySqlDataSource = _configuration.GetConnectionString("AppCon");

            try
            {
                using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
                {
                    myCon.Open();
                    using (MySqlCommand myCommand = new MySqlCommand(insertGoalProjectQuery, myCon))
                    {
                        myCommand.Parameters.AddWithValue("@goal_idGoal", goal_id);
                        myCommand.Parameters.AddWithValue("@project_idProject", project_id);

                        myCommand.ExecuteNonQuery();
                    }
                }

                return new JsonResult("Linked Successfully!");
            }
            catch (MySqlException ex)
            {
                if (ex.Number == 1062)
                {
                    return new JsonResult(new { message = "Duplicate entry: The goal is already linked to the project." })
                    {
                        StatusCode = StatusCodes.Status409Conflict
                    };
                }
                else
                {
                    return new JsonResult(new { message = "An error occurred while linking the goal to the project." })
                    {
                        StatusCode = StatusCodes.Status500InternalServerError
                    };
                }
            }
            catch (Exception ex)
            {
                return new JsonResult(new { message = "An unexpected error occurred." })
                {
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        [HttpPut]
        public JsonResult Put(GoalClass goal)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return new JsonResult(new { message = "Access denied" })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            string query = @"UPDATE todo.goal 
                            SET nameGoal = @nameGoal, AbNameGoal = @AbNameGoal
                            WHERE (idGoal = @idGoal);";
            DataTable table = new DataTable();
            string MySqlDataSource = _configuration.GetConnectionString("AppCon");
            MySqlDataReader myReader;
            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@idGoal", goal.idGoal);
                    myCommand.Parameters.AddWithValue("@nameGoal", goal.nameGoal);
                    myCommand.Parameters.AddWithValue("@AbNameGoal", goal.AbNameGoal);
                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
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

            string query = @"DELETE FROM todo.goal WHERE (idGoal = @idGoal)";
            DataTable table = new DataTable();
            string MySqlDataSource = _configuration.GetConnectionString("AppCon");
            MySqlDataReader myReader;
            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@idGoal", id);
                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }
            return new JsonResult("Deleted Successfully!");
        }

        [HttpPost("RemoveFromProject")]
        public JsonResult RemoveFromProject(int goal_id, int project_id)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return new JsonResult(new { message = "Access denied" })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            string deleteGoalProjectQuery = @"
                DELETE FROM todo.goal_has_project 
                WHERE goal_idGoal = @goal_idGoal AND project_idProject = @project_idProject;";

            string MySqlDataSource = _configuration.GetConnectionString("AppCon");

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(deleteGoalProjectQuery, myCon))
                {
                    myCommand.Parameters.AddWithValue("@goal_idGoal", goal_id);
                    myCommand.Parameters.AddWithValue("@project_idProject", project_id);

                    myCommand.ExecuteNonQuery();
                }
            }

            return new JsonResult("Removed from project successfully!");
        }
    }
}