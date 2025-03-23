namespace react_api.Models
{
    public class TaskClass
    {
        public int idTask { get; set; }
        public string nameTask { get; set; }
        public string description { get; set; }
        public DateTime deadLine { get; set; }
        public int idProject { get; set; }
        public bool status { get; set; }
    }
}
