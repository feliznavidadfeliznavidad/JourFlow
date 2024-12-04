using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace JourFlow_BE.Models
{
    public class IMGs
    {
        [Key]
        public required int Id { get; set; }
        [Required]
        [ForeignKey("Posts")]
        public required string PostId { get; set; }
        public string? Url { get; set; }
        public Posts? Posts{ get; set; }
        
    }
}