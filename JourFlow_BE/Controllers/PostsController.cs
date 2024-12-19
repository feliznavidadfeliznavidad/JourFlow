using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JourFlow_BE.Dtos;
using JourFlow_BE.Mappers;
using JourFlow_BE.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NuGet.Protocol;

namespace JourFlow_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : ControllerBase
    {
        private readonly JourFlowDbContext _dbcontext;
        public PostsController(JourFlowDbContext dbContext)
        {
            _dbcontext = dbContext;
        }

        
        [HttpGet("get/{userId}")]
        [Authorize]
        public IActionResult GetPostsByUserId([FromRoute] Guid userId)
        {
            var posts = (from post in _dbcontext.Posts 
                        join imgs in _dbcontext.IMGs! on post.Id equals imgs.PostId 
                        where post.UserId == userId 
                        select post).Select(p => p.ToGetPosts()).ToList();
            var images = (from imgs in _dbcontext.IMGs 
                        join post in _dbcontext.Posts! on imgs.PostId equals post.Id 
                        where imgs.Posts!.UserId == userId 
                        select imgs).Select(i => i.ToImageDto()).ToList();
            Console.WriteLine("Posts: " + posts.ToJson());
            Console.WriteLine("Images: " + images.ToJson());
            

            if (posts == null)
            {
                return NotFound();
            }

            return Ok(new { posts , images });
        }

        [HttpPost("add-image")]
        [Authorize]
        public async Task<IActionResult> AddImage([FromBody] List<ImgsDto>  images)
        {
            Console.WriteLine("AddImages");
            if (images == null || !images.Any())
            {
                Console.WriteLine("No images provided");
                return BadRequest("No images provided");
            }

            Console.WriteLine($"Received {images.Count} posts.");


            var newImgs = images
                .Where(i => i.sync_status == 0)
                .Select(dto => dto.ToImage())
                .ToList();


            Console.WriteLine($"Filtered {newImgs.Count} imgs with sync_status == 0.");


            _dbcontext.IMGs!.AddRange(newImgs);
            await _dbcontext.SaveChangesAsync();

            return Ok("success");
        }
        [HttpPost("add-post")]
        [Authorize]
        public async Task<IActionResult> AddPost([FromBody] List<PostsDto>  posts)
        {
            Console.WriteLine("AddPosts");

            if (posts == null || !posts.Any())
            {
                Console.WriteLine("No posts provided");
                return BadRequest("No posts provided");
            }

            Console.WriteLine($"Received {posts.Count} posts.");


            var newPosts = posts
                .Where(p => p.sync_status == 0)
                .Select(dto => dto.ToAddPosts())
                .ToList();


            Console.WriteLine($"Filtered {newPosts.Count} posts with sync_status == 0.");

            _dbcontext.Posts!.AddRange(newPosts);
            await _dbcontext.SaveChangesAsync();

            return Ok("success");
        }

        [HttpPut("update")]
        [Authorize]
        public async Task<IActionResult> UpdatePost([FromBody] List<PostsDto> posts)
        {
            if (posts == null || !posts.Any())
                return BadRequest("No posts provided.");

            // Lấy danh sách Ids từ posts gửi lên
            var ids = posts.Where(p => p.sync_status == 2).Select(p => p.id).ToList();

            // Tìm các bài viết trong database có Id khớp
            var existingPosts = await _dbcontext!.Posts!
                .Where(p => ids.Contains(p.Id))
                .ToListAsync();

            if (!existingPosts.Any())
                return NotFound("No matching posts found in the database.");

            // Cập nhật dữ liệu cho các bài viết
            foreach (var post in posts)
            {
                var existingPost = existingPosts.FirstOrDefault(p => p.Id == post.id);

                if (existingPost != null)
                {
                    existingPost.Title = post.title ?? existingPost.Title;
                    existingPost.IconPath = post.icon_path ?? existingPost.IconPath;
                    existingPost.Content = post.content ?? existingPost.Content;
                    existingPost.UpdateDate = post.update_date;
                }
            }

            // Lưu các thay đổi vào database
            await _dbcontext.SaveChangesAsync();

            return Ok("success");
        }

        [HttpDelete("delete")]
        [Authorize]
        public async Task<IActionResult> DeletePosts([FromBody] List<PostsDto> posts)
        {
            if (posts == null || !posts.Any())
                return BadRequest("No posts provided.");

            // Lấy danh sách Ids từ posts gửi lên
            var idsToDelete = posts
                .Where(p => p.sync_status == 3) // Chỉ lấy các bài viết có sync_status = 3
                .Select(p => p.id)
                .ToList();

            if (!idsToDelete.Any())
                return BadRequest("No posts with sync_status = 3 provided.");

            // Lấy các bài viết từ database có Id khớp
            var postsToDelete = await _dbcontext!.Posts!
                .Where(p => idsToDelete.Contains(p.Id))
                .ToListAsync();

            if (!postsToDelete.Any())
                return NotFound("No matching posts found in the database.");

            // Xóa các bài viết
            _dbcontext!.Posts!.RemoveRange(postsToDelete);
            await _dbcontext.SaveChangesAsync();

            return Ok("success");
        }

               
    }
}