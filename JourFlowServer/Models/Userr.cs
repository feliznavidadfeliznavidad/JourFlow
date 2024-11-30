using System;
using System.Collections.Generic;

namespace server.Models;

public partial class Userr
{
    public int Id { get; set; }

    public string? RefreshToken { get; set; }

    public string? Email { get; set; }
}
