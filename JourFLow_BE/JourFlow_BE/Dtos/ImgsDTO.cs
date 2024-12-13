using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JourFlow_BE.Dtos
{
    public class ImgsDto
    {
        public required string id { get; set; }
        public string? post_id { get; set; }
        public string? url { get; set; }
        public string? public_id { get; set; }
        public string? cloudinary_url { get; set; }
        public int? sync_status { get; set; } 
    }
}