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
    public class StakeController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly AuthService _authService;

        public StakeController(IConfiguration configuration, AuthService authService)
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

            string query = @"SELECT * FROM todo.stakeholder";
            List<StakeClass> stakeholders = new List<StakeClass>();
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
                            var stakeholder = new StakeClass
                            {
                                idStake = myReader.GetInt32("idStake"),
                                nameStake = myReader.GetString("nameStake"),
                                AbNameStake = myReader.GetString("AbNameStake"),
                            };
                            stakeholders.Add(stakeholder);
                        }
                    }
                }
            }

            return new JsonResult(stakeholders);
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
                SELECT st.idStake, st.nameStake, st.AbNameStake 
                FROM todo.stakeholder st
                INNER JOIN todo.stakeholder_has_project sthp ON st.idStake = sthp.stakeholder_idStake
                WHERE sthp.project_idProject = @project_idProject";

            List<StakeClass> stake = new List<StakeClass>();
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
                            var newStake = new StakeClass
                            {
                                idStake = myReader.GetInt32("idStake"),
                                nameStake = myReader.GetString("nameStake"),
                                AbNameStake = myReader.GetString("AbNameStake")
                            };
                            stake.Add(newStake);
                        }
                    }
                }
            }

            return new JsonResult(stake);
        }

        [HttpPut]
        public JsonResult Put(StakeClass stakes)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return new JsonResult(new { message = "Access denied" })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            string query = @"UPDATE todo.stakeholder 
                            SET nameStake = @nameStake, AbNameStake = @AbNameStake
                            WHERE (idStake = @idStake);";
            DataTable table = new DataTable();
            string MySqlDataSource = _configuration.GetConnectionString("AppCon");
            MySqlDataReader myReader;
            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@idStake", stakes.idStake);
                    myCommand.Parameters.AddWithValue("@nameStake", stakes.nameStake);
                    myCommand.Parameters.AddWithValue("@AbNameStake", stakes.AbNameStake);
                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }
            return new JsonResult("Updated Successfully!");
        }

        [HttpPost]
        public JsonResult Post(StakeClass stake)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return new JsonResult(new { message = "Access denied" })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            string insertStakeQuery = @"
                INSERT INTO todo.stakeholder (nameStake, AbNameStake)
                VALUES (@nameStake, @AbNameStake);
                SELECT LAST_INSERT_ID();";

            string MySqlDataSource = _configuration.GetConnectionString("AppCon");

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(insertStakeQuery, myCon))
                {
                    myCommand.Parameters.AddWithValue("@nameStake", stake.nameStake);
                    myCommand.Parameters.AddWithValue("@AbNameStake", stake.AbNameStake);

                    int newStakeId = Convert.ToInt32(myCommand.ExecuteScalar());

                    return new JsonResult(new { message = "Added Successfully!", id = newStakeId });
                }
            }
        }

        [HttpPost("LinkToProject")]
        public JsonResult LinkToProject(int stakeholder_id, int project_id)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return new JsonResult(new { message = "Access denied" })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            string insertStakeProjectQuery = @"
                INSERT INTO todo.stakeholder_has_project (stakeholder_idStake, project_idProject) 
                VALUES (@stakeholder_idStake, @project_idProject);";

            string MySqlDataSource = _configuration.GetConnectionString("AppCon");

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(insertStakeProjectQuery, myCon))
                {
                    myCommand.Parameters.AddWithValue("@stakeholder_idStake", stakeholder_id);
                    myCommand.Parameters.AddWithValue("@project_idProject", project_id);

                    myCommand.ExecuteNonQuery();
                }
            }

            return new JsonResult("Linked Successfully!");
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

            string query = @"DELETE FROM todo.stakeholder WHERE (idStake = @idStake)";
            DataTable table = new DataTable();
            string MySqlDataSource = _configuration.GetConnectionString("AppCon");
            MySqlDataReader myReader;
            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@idStake", id);
                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }
            return new JsonResult("Deleted Successfully!");
        }

        [HttpPost("RemoveFromProject")]
        public JsonResult RemoveFromProject(int stakeholder_id, int project_id)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return new JsonResult(new { message = "Access denied" })
                {
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            string deleteStakeProjectQuery = @"
        DELETE FROM todo.stakeholder_has_project 
        WHERE stakeholder_idStake = @stakeholder_idStake AND project_idProject = @project_idProject;";

            string MySqlDataSource = _configuration.GetConnectionString("AppCon");

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(deleteStakeProjectQuery, myCon))
                {
                    myCommand.Parameters.AddWithValue("@stakeholder_idStake", stakeholder_id);
                    myCommand.Parameters.AddWithValue("@project_idProject", project_id);

                    myCommand.ExecuteNonQuery();
                }
            }

            return new JsonResult("Removed from project successfully!");
        }
    }
}