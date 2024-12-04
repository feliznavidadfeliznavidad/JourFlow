using JourFlow_BE.Models;
using Microsoft.EntityFrameworkCore;
using JourFlow_BE.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<IGenerateTokenService, TokenGenerating>();
builder.Services.AddSingleton<GoogleTokenService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});
builder.Services.AddDbContext<JourFlowDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
// builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen();

builder.Services.AddControllers();

var app = builder.Build();
app.MapControllers();

// // Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
//     app.UseSwagger();
//     app.UseSwaggerUI();
// }

app.UseHttpsRedirection();

app.UseCors("AllowAllOrigins");
app.Run();
