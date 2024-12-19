using Google.Apis.Auth;

public class GoogleTokenService
{
    public async Task<GoogleJsonWebSignature.Payload> ValidateGoogleToken(string idToken)
    {
        try
        { 
            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken);
            return payload;
        }
        catch (InvalidJwtException ex)
        { 
            throw new Exception("Invalid Google ID token"+ ex);
        }
    }
}