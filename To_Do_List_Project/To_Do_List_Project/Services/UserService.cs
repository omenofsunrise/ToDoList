using MySql.Data.MySqlClient;
using react_api.Models;

namespace To_Do_List_Project.Services
{
    public class UserService
    {
        private readonly IConfiguration _configuration;

        public UserService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public List<UserClass> Get()
        {
            string query = @"SELECT * FROM todo.user";
            List<UserClass> users = new List<UserClass>();
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
                            var user = new UserClass
                            {
                                idUser = myReader.GetInt32("idUser"),
                                username = myReader.GetString("username"),
                                name = myReader.GetString("name"),
                                surname = myReader.GetString("surname"),
                                password = myReader.GetString("password"),
                                is_admin = myReader.GetBoolean("is_admin")
                            };
                            users.Add(user);
                        }
                    }
                }
            }

            return users;
        }

        public UserClass GetUserByUsername(string username)
        {
            string query = @"SELECT * FROM todo.user WHERE username = @username";
            UserClass user = null;
            string MySqlDataSource = _configuration.GetConnectionString("AppCon");

            using (MySqlConnection myCon = new MySqlConnection(MySqlDataSource))
            {
                myCon.Open();
                using (MySqlCommand myCommand = new MySqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@username", username);
                    using (MySqlDataReader myReader = myCommand.ExecuteReader())
                    {
                        if (myReader.Read())
                        {
                            user = new UserClass
                            {
                                idUser = myReader.GetInt32("idUser"),
                                username = myReader.GetString("username"),
                                name = myReader.GetString("name"),
                                surname = myReader.GetString("surname"),
                                password = myReader.GetString("password"),
                                salt = myReader.GetString("salt"),
                                is_admin = myReader.GetBoolean("is_admin")
                            };
                        }
                    }
                }
            }

            return user;
        }
    }
}
