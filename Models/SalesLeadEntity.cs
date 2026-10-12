namespace SalesCRMApp.Models
{
    public class SalesLeadEntity
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
    }
}
