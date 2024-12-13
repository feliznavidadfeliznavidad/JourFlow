using JourFlow_BE.Dtos;
using JourFlow_BE.Models;

public static class ImageMapper
{
    public static ImgsDto ToImageDto(this IMGs image)
    {
        return new ImgsDto
        {
            id = image.Id,
            post_id = image.PostId,
            url = image.Url,
            public_id = image.PublicId,
            cloudinary_url = image.CloudinaryUrl,
            sync_status = image.SyncStatus
        };
    }

    public static IMGs ToImage(this ImgsDto dto)
    {
        return new IMGs
        {
            Id = dto.id,
            PostId = dto.post_id,
            Url = dto.url,
            PublicId = dto.public_id,
            CloudinaryUrl = dto.cloudinary_url,
            SyncStatus = dto.sync_status
        };
    }
}