using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JourFlow_BE.Dtos;
using JourFlow_BE.Mappers;
using JourFlow_BE.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JourFlow_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : ControllerBase
    {
        private readonly JourFlowDbContext _dbcontext;
        public PostsController(JourFlowDbContext dbContext){
            _dbcontext = dbContext;
        }

        [HttpGet("get")]
        public IActionResult GetAll(){
            var posts = _dbcontext.Posts?.Select(p => p.ToGetPosts()).ToList();
            
            if (posts == null ){
                return NotFound();
            }

            return Ok(posts);
        }

        
        [HttpPost("add")]
        public async Task<IActionResult> AddPost([FromBody] List<PostsDto> posts)
        {   
            if (posts == null || !posts.Any())
                return BadRequest("No posts provided");

            var newPosts = posts
                .Where(p => p.sync_status == 0 ) // Kiểm tra lại SyncStatus == 0 
                .Select(dto => dto.ToAddPosts())
                .ToList();

            await _dbcontext.Posts!.AddRangeAsync(newPosts);

            await _dbcontext.SaveChangesAsync();

            Console.WriteLine($"Added {newPosts.Count} posts.");
            return Ok("success");
        }

        [HttpPut("update")]
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