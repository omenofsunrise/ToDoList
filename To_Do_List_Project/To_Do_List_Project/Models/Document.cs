namespace react_api.Models
{
    public class Document
    {
        public int Id { get; set; }
        public int? ProjectId { get; set; }
        public int? TaskId { get; set; }
        public string FileName { get; set; }
        public string OriginalName { get; set; }
        public string FilePath { get; set; }
        public DateTime UploadDate { get; set; }
        public int UploadedBy { get; set; }
    }
}