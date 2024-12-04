using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace JourFlow_BE.Models
{
    [Table("Users")]
    public class Users
    {
        [Key]
        public int Id { get; set; }
        public string? UserName { get; set; }
        public string? RefreshToken { get; set; }
        public string? Email { get; set; }
        [StringLength(1000)]
        public string? AvtUrl { get; set; }
        public ICollection<Posts>? Posts { get; set; }
    }
}