using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JourFlow_BE.Dtos;
using JourFlow_BE.Models;

namespace JourFlow_BE.Mappers
{
    public static class PostsMappers
    {
        public static Posts ToAddPosts(this PostsDto postsDto)
        {
            return new Posts
            {
                Id = postsDto.id, 
                UserId = postsDto.user_id,
                Title = postsDto.title,
                IconPath = postsDto.icon_path,
                Content = postsDto.content,
                PostDate = postsDto.post_date,
                UpdateDate = postsDto.update_date
            };
        }
        public static PostsDto ToGetPosts(this Posts posts)
        {
            return new PostsDto
            {
                id = posts.Id, 
                user_id = posts.UserId,
                title = posts.Title,
                icon_path = posts.IconPath,
                content = posts.Content,
                post_date = posts.PostDate,
                update_date = posts.UpdateDate
            };
        }

    }
}