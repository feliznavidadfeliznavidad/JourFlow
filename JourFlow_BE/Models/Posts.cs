using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace JourFlow_BE.Models
{
    [Table("Posts")]
    public class Posts
    {
        
        [Key]
        public required string Id { get; set; } 
        [Required]
        [ForeignKey("Users")]
        public Guid UserId { get; set; } 
        public string? Title { get; set; }
        public string? IconPath { get; set; }
        [Required]
        public string? Content { get; set; }
        [Required]
        public DateTime? PostDate { get; set; }
        [Required]
        public DateTime? UpdateDate { get; set; }  
        public Users? User { get; set; }
        public ICollection<IMGs>? IMGs { get; set; } = new List<IMGs>();

    }
}