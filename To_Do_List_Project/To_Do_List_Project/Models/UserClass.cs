namespace react_api.Models
{
    public class UserClass
    {
        public int idUser { get; set; }
        public string username { get; set; }
        public string name { get; set; }
        public string surname { get; set; }
        public string password { get; set; }
        public string? salt { get; set; }
        public bool is_admin { get; set; }
    }
}