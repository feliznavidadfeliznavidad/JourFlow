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
        public PostsController(JourFlowDbContext dbContext)
        {
            _dbcontext = dbContext;
        }

        // [HttpGet("get")]
        // public IActionResult GetAll(){
        //     var posts = _dbcontext.Posts?.Select(p => p.ToGetPosts()).ToList();

        //     if (posts == null ){
        //         return NotFound();
        //     }

        //     return Ok(posts);
        // }

        [HttpGet("get")]
        public IActionResult GetAll()
        {
            var posts = _dbcontext.Posts?.Select(p => p.ToGetPosts()).ToList();
            var images = _dbcontext.IMGs?.Select(i => i.ToImageDto()).ToList();

            if (posts == null)
            {
                return NotFound();
            }

            return Ok(new { posts, images });
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddPost([FromBody] List<PostsDto> posts)
        {
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

            var validPosts = new List<Posts>(); // Danh sách bài viết hợp lệ
            var skippedPosts = new List<string>(); // Danh sách Id bị bỏ qua

            foreach (var post in newPosts)
            {
                var existingPost = await _dbcontext.Posts
                    .FirstOrDefaultAsync(p => p.Id == post.Id);

                if (existingPost != null)
                {
                    skippedPosts.Add(post.Id.ToString()); // Thêm vào danh sách bỏ qua
                    Console.WriteLine($"Post with Id {post.Id} already exists. Skipping.");
                }
                else
                {
                    validPosts.Add(post); // Thêm vào danh sách hợp lệ
                }
            }

            if (validPosts.Any())
            {
                try
                {
                    await _dbcontext.Posts!.AddRangeAsync(validPosts);
                    await _dbcontext.SaveChangesAsync();
                    Console.WriteLine($"Added {validPosts.Count} valid posts to the database.");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error saving posts to database: {ex.Message}");
                    return StatusCode(500, $"Internal server error: {ex.Message}");
                }
            }
            else
            {
                Console.WriteLine("No valid posts to add.");
            }

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

        // [HttpDelete("delete")]
        // public async Task<IActionResult> DeletePosts([FromBody] List<PostsDto> posts)
        // {
        //     if (posts == null || !posts.Any())
        //         return BadRequest("No posts provided.");

        //     // Lấy danh sách Ids từ posts gửi lên
        //     var idsToDelete = posts
        //         .Where(p => p.sync_status == 3) // Chỉ lấy các bài viết có sync_status = 3
        //         .Select(p => p.id)
        //         .ToList();

        //     if (!idsToDelete.Any())
        //         return BadRequest("No posts with sync_status = 3 provided.");

        //     // Lấy các bài viết từ database có Id khớp
        //     var postsToDelete = await _dbcontext!.Posts!
        //         .Where(p => idsToDelete.Contains(p.Id))
        //         .ToListAsync();

        //     if (!postsToDelete.Any())
        //         return NotFound("No matching posts found in the database.");

        //     // Xóa các bài viết
        //     _dbcontext!.Posts!.RemoveRange(postsToDelete);
        //     await _dbcontext.SaveChangesAsync();

        //     return Ok("success");
        // }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeletePosts([FromBody] List<PostsDto> posts)
        {
            if (posts == null || !posts.Any())
                return BadRequest("No posts provided.");

            var idsToDelete = posts
                .Where(p => p.sync_status == 3)
                .Select(p => p.id)
                .ToList();

            if (!idsToDelete.Any())
                return BadRequest("No posts with sync_status = 3 provided.");

            try
            {
                // Xóa images trước
                var imagesToDelete = await _dbcontext.IMGs!
                    .Where(i => idsToDelete.Contains(i.PostId))
                    .ToListAsync();

                if (imagesToDelete.Any())
                {
                    _dbcontext.IMGs!.RemoveRange(imagesToDelete);
                }

                // Sau đó xóa posts
                var postsToDelete = await _dbcontext.Posts!
                    .Where(p => idsToDelete.Contains(p.Id))
                    .ToListAsync();

                if (!postsToDelete.Any())
                    return NotFound("No matching posts found in the database.");

                _dbcontext.Posts!.RemoveRange(postsToDelete);
                await _dbcontext.SaveChangesAsync();

                return Ok("success");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("sync-images")]
        public async Task<IActionResult> SyncImages([FromBody] List<ImgsDto> images)
        {
            if (images == null || !images.Any())
                return BadRequest("No images provided");

            try
            {
                foreach (var imageDto in images)
                {
                    var existingImage = await _dbcontext.IMGs!
                        .FirstOrDefaultAsync(i => i.Id == imageDto.id);

                    if (existingImage == null)
                    {
                        var newImage = imageDto.ToImage();
                        await _dbcontext.IMGs!.AddAsync(newImage);
                    }
                    else
                    {
                        existingImage.Url = imageDto.url;
                        existingImage.PublicId = imageDto.public_id;
                        existingImage.CloudinaryUrl = imageDto.cloudinary_url;
                        existingImage.SyncStatus = 1;
                    }
                }

                await _dbcontext.SaveChangesAsync();
                return Ok("success");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}