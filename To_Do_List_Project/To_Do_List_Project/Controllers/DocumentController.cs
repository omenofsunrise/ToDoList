using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using MySql.Data.MySqlClient;
using Microsoft.Extensions.Configuration;
using react_api.Models;
using To_Do_List_Project.Services;
using System.Data;

namespace react_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly AuthService _authService;

        public DocumentController(IConfiguration configuration, AuthService authService)
        {
            _configuration = configuration;
            _authService = authService;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadDocument([FromForm] DocumentUploadModel model)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return Unauthorized(new { message = "Access denied" });
            }

            if (model.File == null || model.File.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded" });
            }

            if (model.ProjectId == null && model.TaskId == null)
            {
                return BadRequest(new { message = "Either ProjectId or TaskId must be specified" });
            }

            if (model.ProjectId != null && !await EntityExists("project", "idProject", model.ProjectId.Value))
            {
                return NotFound(new { message = "Project not found" });
            }

            if (model.TaskId != null && !await EntityExists("task", "idTask", model.TaskId.Value))
            {
                return NotFound(new { message = "Task not found" });
            }

            var userId = _authService.GetUserId(token);

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "documents");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(model.File.FileName)}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await model.File.CopyToAsync(fileStream);
            }

            string query = @"INSERT INTO documents 
                            (project_id, task_id, file_name, original_name, file_path, upload_date, uploaded_by) 
                            VALUES (@projectId, @taskId, @fileName, @originalName, @filePath, @uploadDate, @uploadedBy);
                            SELECT LAST_INSERT_ID();";

            string MySqlDataSource = _configuration.GetConnectionString("AppCon");

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                await myCon.OpenAsync();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@projectId", model.ProjectId);
                    myCommand.Parameters.AddWithValue("@taskId", model.TaskId);
                    myCommand.Parameters.AddWithValue("@fileName", uniqueFileName);
                    myCommand.Parameters.AddWithValue("@originalName", model.File.FileName);
                    myCommand.Parameters.AddWithValue("@filePath", $"/documents/{uniqueFileName}");
                    myCommand.Parameters.AddWithValue("@uploadDate", DateTime.Now);
                    myCommand.Parameters.AddWithValue("@uploadedBy", userId);

                    var documentId = Convert.ToInt32(await myCommand.ExecuteScalarAsync());

                    return Ok(new
                    {
                        Message = "File uploaded successfully",
                        DocumentId = documentId,
                        FilePath = $"/documents/{uniqueFileName}",
                        OriginalName = model.File.FileName
                    });
                }
            }
        }

        [HttpGet("project/{projectId}")]
        public async Task<IActionResult> GetProjectDocuments(int projectId)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return Unauthorized(new { message = "Access denied" });
            }

            return await GetDocuments("project_id", projectId);
        }

        [HttpGet("task/{taskId}")]
        public async Task<IActionResult> GetTaskDocuments(int taskId)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return Unauthorized(new { message = "Access denied" });
            }

            return await GetDocuments("task_id", taskId);
        }

        [HttpGet("download/{documentId}")]
        public async Task<IActionResult> DownloadDocument(int documentId)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return Unauthorized(new { message = "Access denied" });
            }

            string query = @"SELECT original_name, file_path 
                         FROM documents 
                         WHERE id = @documentId";

            string MySqlDataSource = _configuration.GetConnectionString("AppCon");
            string originalName = "";
            string filePath = "";

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                await myCon.OpenAsync();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@documentId", documentId);

                    using (var reader = await myCommand.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            originalName = reader.GetString("original_name");
                            filePath = reader.GetString("file_path");
                        }
                        else
                        {
                            return NotFound(new { message = "Document not found" });
                        }
                    }
                }
            }

            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", filePath.TrimStart('/'));

            if (!System.IO.File.Exists(fullPath))
            {
                return NotFound(new { message = "File not found" });
            }

            var memory = new MemoryStream();
            using (var stream = new FileStream(fullPath, FileMode.Open))
            {
                await stream.CopyToAsync(memory);
            }
            memory.Position = 0;

            return File(memory, GetContentType(fullPath), originalName);
        }

        [HttpDelete("{documentId}")]
        public async Task<IActionResult> DeleteDocument(int documentId)
        {
            var token = HttpContext.Request.Headers["Auth"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token) || !_authService.ValidateToken(token))
            {
                return Unauthorized(new { message = "Access denied" });
            }

            string getFilePathQuery = "SELECT file_path FROM documents WHERE id = @documentId";
            string deleteQuery = "DELETE FROM documents WHERE id = @documentId";

            string MySqlDataSource = _configuration.GetConnectionString("AppCon");
            string filePath = "";

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                await myCon.OpenAsync();

                using (MySqlCommand getFilePathCommand = new MySqlCommand(getFilePathQuery, myCon))
                {
                    getFilePathCommand.Parameters.AddWithValue("@documentId", documentId);

                    var result = await getFilePathCommand.ExecuteScalarAsync();
                    if (result == null)
                    {
                        return NotFound(new { message = "Document not found" });
                    }

                    filePath = result.ToString();
                }

                using (MySqlCommand deleteCommand = new MySqlCommand(deleteQuery, myCon))
                {
                    deleteCommand.Parameters.AddWithValue("@documentId", documentId);
                    await deleteCommand.ExecuteNonQueryAsync();
                }
            }

            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", filePath.TrimStart('/'));
            if (System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
            }

            return Ok(new { message = "Document deleted successfully" });
        }

        private async Task<bool> EntityExists(string tableName, string idColumn, int id)
        {
            string query = $"SELECT COUNT(*) FROM {tableName} WHERE {idColumn} = @id";
            string MySqlDataSource = _configuration.GetConnectionString("AppCon");

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                await myCon.OpenAsync();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@id", id);
                    var count = Convert.ToInt32(await myCommand.ExecuteScalarAsync());
                    return count > 0;
                }
            }
        }

        private async Task<IActionResult> GetDocuments(string fieldName, int entityId)
        {
            string query = $@"SELECT d.id, d.project_id, d.task_id, d.file_name, d.original_name, 
                            d.file_path, d.upload_date, d.uploaded_by,
                            u.username, u.name, u.surname
                            FROM documents d
                            JOIN user u ON d.uploaded_by = u.idUser
                            WHERE d.{fieldName} = @entityId";

            List<DocumentWithUserInfo> documents = new List<DocumentWithUserInfo>();
            string MySqlDataSource = _configuration.GetConnectionString("AppCon");

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                await myCon.OpenAsync();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@entityId", entityId);

                    using (var reader = await myCommand.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            documents.Add(new DocumentWithUserInfo
                            {
                                Id = reader.GetInt32("id"),
                                ProjectId = reader.IsDBNull(reader.GetOrdinal("project_id"))
                                    ? (int?)null : reader.GetInt32("project_id"),
                                TaskId = reader.IsDBNull(reader.GetOrdinal("task_id"))
                                    ? (int?)null : reader.GetInt32("task_id"),
                                FileName = reader.GetString("file_name"),
                                OriginalName = reader.GetString("original_name"),
                                FilePath = reader.GetString("file_path"),
                                UploadDate = reader.GetDateTime("upload_date"),
                                UploadedBy = reader.GetInt32("uploaded_by"),
                                UploaderUsername = reader.GetString("username"),
                                UploaderName = reader.GetString("name"),
                                UploaderSurname = reader.GetString("surname")
                            });
                        }
                    }
                }
            }

            return Ok(documents);
        }

        private string GetContentType(string path)
        {
            var types = GetMimeTypes();
            var ext = Path.GetExtension(path).ToLowerInvariant();
            return types.ContainsKey(ext) ? types[ext] : "application/octet-stream";
        }

        private Dictionary<string, string> GetMimeTypes()
        {
            return new Dictionary<string, string>
            {
                {".txt", "text/plain"},
                {".pdf", "application/pdf"},
                {".doc", "application/vnd.ms-word"},
                {".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"},
                {".xls", "application/vnd.ms-excel"},
                {".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
                {".png", "image/png"},
                {".jpg", "image/jpeg"},
                {".jpeg", "image/jpeg"},
                {".gif", "image/gif"},
                {".csv", "text/csv"}
            };
        }
    }

    public class DocumentUploadModel
    {
        public IFormFile File { get; set; }
        public int? ProjectId { get; set; }
        public int? TaskId { get; set; }
    }

    public class DocumentWithUserInfo : Document
    {
        public string UploaderUsername { get; set; }
        public string UploaderName { get; set; }
        public string UploaderSurname { get; set; }
    }
}