using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace JourFlow_BE.Models
{
    public class JourFlowDbContext(DbContextOptions<JourFlowDbContext> options) : DbContext(options)
    {
        public DbSet<Users>? Users { get; set; }
        public DbSet<Posts>? Posts { get; set; }
        public DbSet<IMGs>? IMGs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
           
            modelBuilder.Entity<Posts>()
                .HasOne(p => p.User)
                .WithMany(u => u.Posts)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<IMGs>()
                .HasOne(i => i.Posts)
                .WithMany(p => p.IMGs)
                .HasForeignKey(i => i.PostId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}