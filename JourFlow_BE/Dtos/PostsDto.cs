using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JourFlow_BE.Dtos
{
    public class PostsDto
    {
        public required string id { get; set; }
        public Guid user_id { get; set; }
        public string? title { get; set; }
        public string? icon_path { get; set; }
        public string? content { get; set; }
        public DateTime? post_date { get; set; }
        public DateTime? update_date { get; set; } 
        public int? sync_status { get; set; } 
    }
}