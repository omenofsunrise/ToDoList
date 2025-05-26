namespace react_api.Models
{
    public class ProjectClass
    {
        public int idProject { get; set; }
        public string nameProject { get; set; }
        public DateTime startDate { get; set; }
        public string stateProject { get; set; }
        public string description { get; set; }
        public bool completed { get; set; }
        public List<Document> Documents { get; set; } = new List<Document>();
    }
}
